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

#  хранилище фото и аватарок
@route('/storage/<filename:path>')
def storage(filename):
    return static_file(filename, root='./static/storage')

#  хранилище общих ресурсов для админки и ремонтаса
@route('/common/<filename:path>')
def storage(filename):
    return static_file(filename, root='./static/common')

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        if isinstance(o,datetime):
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
                            # photoFile.save(conf.works_path)
                            # watermarkPhoto(conf.works_path + photo["filename"], "remontas/public/img/watermark.png", 'tile', 0.2)
                            watermarkPhoto(photoFile.file, conf.works_path + photo["filename"], conf.watermarkPath, 'tile', 0.2)
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
        writeToLog("error", "syncFiles: " + str(e))

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

def watermarkPhoto(photo, photo_path, watermark, position, opacity=1):
    im = Image.open(photo)
    mark = Image.open(watermark)


    # уменьшить размер фото

    large_size = (1920, 1200)

    image_w, image_h = im.size
    aspect_ratio = image_w / float(image_h)
    new_height = int(large_size[0] / aspect_ratio)

    if new_height < 1200:
        final_width = large_size[0]
        final_height = new_height
    else:
        final_width = int(aspect_ratio * large_size[1])
        final_height = large_size[1]

    imaged = im.resize((final_width, final_height), Image.ANTIALIAS)

    """Adds a watermark to an image."""
    if opacity < 1:
        mark = reduce_opacity(mark, opacity)
    if imaged.mode != 'RGBA':
        imaged = imaged.convert('RGBA')
    # create a transparent layer the size of the image and draw the
    # watermark in that layer.
    layer = Image.new('RGBA', imaged.size, (0,0,0,0))
    if position == 'tile':
        for y in range(0, imaged.size[1], mark.size[1]):
            for x in range(0, imaged.size[0], mark.size[0]):
                layer.paste(mark, (x, y))
    elif position == 'scale':
        # scale, but preserve the aspect ratio
        ratio = min(
            float(imaged.size[0]) / mark.size[0], float(imaged.size[1]) / mark.size[1])
        w = int(mark.size[0] * ratio)
        h = int(mark.size[1] * ratio)
        mark = mark.resize((w, h))
        layer.paste(mark, ((imaged.size[0] - w) / 2, (imaged.size[1] - h) / 2))
    else:
        layer.paste(mark, position)
    # composite the watermark with the layer
    photoWithWatermark = Image.composite(layer, imaged, layer)
    photoWithWatermark.save(photo_path,'JPEG', quality=60, optimize=True, progressive=True)
    mark.close()

def sendMail(toAddress, subj, msg_text, msg_html):
    try:
        message = MIMEMultipart('alternative')
        message['From'] = conf.fromAddress
        message['To'] = toAddress
        #message['Cc'] = copyAddress
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

        toAddressList = toAddress.split(",")

        server = smtplib.SMTP_SSL(conf.smtp_server, conf.smtp_port)
        # server.starttls()
        server.login(conf.mailLogin, conf.mailPassword)
        server.sendmail(conf.mailLogin,
                        toAddressList,
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

# обновление баллов мастера
def calcScoreMaster(master_id):
    try:
        master = conf.db.masters.find_one({"_id": ObjectId(master_id)})

        if not "status" in master:
            master["status"] = "new"

        score = 0
        reset_to_register = False

        scoreDecription = {"master_id": ObjectId(master_id), "details": []}
        scoreMainCriteria = []

        if master is not None:

            del master["_id"]

            if master["status"] != "closed":

                # критерий - нет аватарки
                ballDescr = {"description": "Загружено фото мастера/логотип компании", "status": True}

                if master["avatar"] == conf.img_no_avatar:
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - есть 3 работы в портфолио в которых более 5 фото
                ballDescr = {"description": "Заполнено 3 работы в портфолио с не менее 5-ю фотографиями", "status": True}

                works = 0
                for work in master["works"]:
                    if len(work["photos"]) >= 5:
                        works += 1

                if works < 3:
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - заполнен хотя бы один телефон
                ballDescr = {"description": "Заполнен контактный телефон", "status": True}

                if (len(master["phone1"]) == 0) and (len(master["phone2"]) == 0):
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - прайс заполнен на 50% или более
                ballDescr = {"description": "Заполнено более 50% цен на услуги", "status": True}

                allServicesCount = 0
                serviceWithPriceCount = 0
                for category in master["categories"]:
                    for kindService in conf.db.category_job.find({"parent_id": ObjectId(category["_id"])}):
                        allServicesCount += conf.db.category_job.find({"parent_id": kindService["_id"]}).count()
                    for kindServiceMaster in category["kind_services"]:
                        for service in kindServiceMaster["services"]:
                            if service["price"] > 0:
                                serviceWithPriceCount += 1

                # print("allServicesCount = " + str(allServicesCount) + "; serviceWithPriceCount = "+str(serviceWithPriceCount))
                if ((allServicesCount > 0) and ((serviceWithPriceCount/allServicesCount) < 0.5)) or (allServicesCount == 0):
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                scoreDecription["details"].append({"description": "Заполнена основная информация", "score": 50, "details": scoreMainCriteria, "status": not reset_to_register})

                # подсчтет остальных критериев
                if not reset_to_register:

                    score += 50

                    # критерий - заполнено 100% цен на услуги - 15 баллов
                    ballDescr = {"description": "Заполнено 100% цен на услуги", "score": 15, "status": False}
                    if allServicesCount-serviceWithPriceCount == 0:
                        ballDescr["status"] = True
                        score += 15

                    scoreDecription["details"].append(ballDescr)

                    # критерий - указано 2 номера телефона - 5 баллов
                    ballDescr = {"description": "Указано 2 номера телефона", "score": 5, "status": False}
                    if (len(master["phone1"]) > 0) and (len(master["phone2"]) > 0):
                        ballDescr["status"] = True
                        score += 5

                    scoreDecription["details"].append(ballDescr)

                    # критерий - описание услуг составляет более 300 символов – 10  баллов
                    ballDescr = {"description": "Общее описание более 300 символов", "score": 10, "status": False}
                    if len(master["detail"]) >= 300:
                        ballDescr["status"] = True
                        score += 10

                    scoreDecription["details"].append(ballDescr)

                    # критерий - за каждую размещённую в портфолио новую работу – 15 баллов
                    ballDescr = {"description": "Размещение выполненных работ", "score": 15, "status": False}
                    if works > 3:
                        ballDescr["status"] = True
                        calcScore = (works - 3)*15
                        ballDescr["score"] = calcScore
                        score += calcScore

                    scoreDecription["details"].append(ballDescr)

                if not master["status"] == "new":
                    if reset_to_register:
                        master["status"] = "register"
                    else:
                        master["status"] = "active"
                else:
                    master["status"] = "new"

                master["score"] = score

                conf.db.masters.update_one({"_id": ObjectId(master_id)}, {"$set": master})
                conf.db.users_masters.update_one({"master_id": ObjectId(master_id)}, {"$set": {"status": master["status"]}})

                conf.db.scoreMasters.replace_one({"master_id": ObjectId(master_id)}, scoreDecription, True)
    except Exception as e:
        print("Error: " + str(e))
        writeToLog("error", "calcScoreMaster: " + str(e))
