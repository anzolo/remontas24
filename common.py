from bottle import route, static_file
import json
from bson import ObjectId
import conf
import os
import uuid

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from PIL import Image, ImageEnhance

from datetime import datetime

from os import urandom

#  хранилище фото
@route('/storage/<filename:path>')
def storage(filename):
    return static_file(filename, root='./storage')

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)

def createFileName(oldFilename):
    filename, ext = os.path.splitext(oldFilename)
    new_filename = str(uuid.uuid4())
    return new_filename + ext

def createEmailCheckCode():
    return str(uuid.uuid4())

def syncFiles(newMaster, oldMaster, request):
    try:
        #создаем лист со всеми фотками которые есть в старом мастере
        oldPhotos = []
        if oldMaster is not None:
            for work in oldMaster["works"]:
                for photo in work["photos"]:
                    oldPhotos.append(photo["filename"])

        for work in newMaster["works"]:
            for photo in work["photos"]:
                if "new" in photo:
                    if photo["new"]:
                        #сохраняем файл
                        del photo["new"]

                        photoFile = request.files.get(photo["filename"])

                        if photoFile is not None:
                            photoFile.filename = createFileName(photoFile.raw_filename)
                            photo["filename"] = photoFile.filename
                            photoFile.save(conf.works_path)
                            watermarkPhoto(conf.works_path + photo["filename"], "storage/watermark.png", 'tile', 0.2)
                else:
                    #исключаем фото, которое осталось в мастере из списка удаления
                    if oldPhotos.count(photo["filename"])>0:
                        oldPhotos.remove(photo["filename"])

        #удаляем фото, которых нет в новом мастере
        for photo in oldPhotos:
            oldFilePath = conf.works_path + photo
            if os.path.isfile(oldFilePath):
                os.remove(oldFilePath)
    except Exception as e:
        print("Error: " + str(e))
        writeToLog("error", str(e))

def reduce_opacity(im, opacity):
    """Returns an image with reduced opacity."""
    assert opacity >= 0 and opacity <= 1
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    else:
        im = im.copy()
    alpha = im.split()[3]
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    im.putalpha(alpha)
    return im

def watermarkPhoto(photo, watermark, position, opacity=1):
    im = Image.open(photo)
    mark = Image.open(watermark)

    """Adds a watermark to an image."""
    if opacity < 1:
        mark = reduce_opacity(mark, opacity)
    if im.mode != 'RGBA':
        im = im.convert('RGBA')
    # create a transparent layer the size of the image and draw the
    # watermark in that layer.
    layer = Image.new('RGBA', im.size, (0,0,0,0))
    if position == 'tile':
        for y in range(0, im.size[1], mark.size[1]):
            for x in range(0, im.size[0], mark.size[0]):
                layer.paste(mark, (x, y))
    elif position == 'scale':
        # scale, but preserve the aspect ratio
        ratio = min(
            float(im.size[0]) / mark.size[0], float(im.size[1]) / mark.size[1])
        w = int(mark.size[0] * ratio)
        h = int(mark.size[1] * ratio)
        mark = mark.resize((w, h))
        layer.paste(mark, ((im.size[0] - w) / 2, (im.size[1] - h) / 2))
    else:
        layer.paste(mark, position)
    # composite the watermark with the layer
    photoWithWatermark = Image.composite(layer, im, layer)
    photoWithWatermark.save(photo,'PNG')

def sendMail(toAddress, subj, msg_text, msg_html):
    try:
        message = MIMEMultipart('alternative')
        message['From'] = conf.fromAddress
        message['To'] = toAddress
        #message['Cc'] = 'Receiver2 Name <receiver2@server>'
        message['Subject'] = subj

        # Record the MIME types of both parts - text/plain and text/html.
        part1 = MIMEText(msg_text, 'plain')
        part2 = MIMEText(msg_html, 'html')

        # Attach parts into message container.
        # According to RFC 2046, the last part of a multipart message, in this case
        # the HTML message, is best and preferred.
        message.attach(part1)
        message.attach(part2)

        final_message = message.as_string()

        server = smtplib.SMTP_SSL(conf.smtp_server, conf.smtp_port)
        # server.starttls()
        server.login(conf.mailLogin, conf.mailPassword)
        server.sendmail(conf.mailLogin,
                        [toAddress],
                        final_message)
        server.quit()

        writeToLog("email", toAddress + " : " + msg_text)
    except Exception as e:
        print("Error: " + str(e))
        writeToLog("error", toAddress + " : " + str(e))

def writeToLog(type, message):
    try:
        record = {"when":datetime.now(), "type":type, "message":message}

        conf.db.logs.insert_one(record)
    except Exception as e:
        print("Error: " + str(e))

def generatePassword(length):
    if not isinstance(length, int) or length < 8:
        raise ValueError("temp password must have positive length")

    chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz123456789012345"

    ran = urandom(length)
    print(str(ran))
    for c in urandom(length):
        print(c)
    return "".join([chars[c % len(chars)] for c in urandom(length)])
