from bottle import route, static_file
import json
from bson import ObjectId
import conf
import os
import uuid

from PIL import Image, ImageEnhance

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

def syncFiles(newMaster, oldMaster, request):
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
                        #watermark(conf.works_path + photo["filename"], conf.works_path + photo["filename"],"storage/remontas24.svg")
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
