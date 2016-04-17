from bottle import route, static_file
import json
from bson import ObjectId
import conf
import os
import uuid

from PIL import Image, ImageEnhance
from PIL import ImageFilter
from PIL import ImageOps
from PIL import ImageDraw
from PIL import ImageFont

from wand.image import Image as WandImage
import subprocess

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

def stampWaterMarkOnPhoto(filename):
    pass
    # imageW = 0
    # imageH = 0
    # img_filename = "%s/../data/tarte_fruits.jpg" % demo_dir
    # font_filename = "%s/timR24.pil" % demo_dir
    # im = None
    # ft = ImageFont.load(font_filename)
    #
    # im0 = Image.open(img_filename)
    # imageW = im0.size[0]
    # imageH = im0.size[1]
    #
    # im = ImageOps.solarize(im0, 128)
    #
    # draw = ImageDraw.Draw(im)
    # draw.line((0, 0) + im.size, fill=(255, 255, 255))
    # draw.line((0, im.size[1], im.size[0], 0), fill=(255, 255, 255))
    # wh = ft.getsize("GLSL Hacker")
    # draw.text((im.size[0] / 2 - wh[0] / 2, im.size[1] / 2 + 20), "GLSL Hacker",
    #           fill=(255, 255, 0), font=ft)
    # draw.text((im.size[0] / 2 - wh[0] / 2, im.size[1] / 2 - 60), "GLSL Hacker",
    #           fill=(255, 255, 0), font=ft)
    # del draw

def watermark(source, target, watermark, blend_mode='overlay', ratio=1, transparency=0.3):
    source_obj = WandImage(filename=source)
    watermark_obj = WandImage(filename=watermark)

    if ratio > 1:
        ratio = 1

    watermark_width = int(source_obj.size[0] * ratio)
    watermark_height = int(float(watermark_width) / float(watermark_obj.size[0]) * watermark_obj.size[1])

    rsvg = subprocess.Popen(
        ['rsvg-convert', '-a', '-h', str(watermark_height), watermark],
        stdout=subprocess.PIPE
    )

    #value = rsvg.stdout.read()

    watermark_obj = WandImage(format="svg", blob=rsvg.stdout.read())
    del rsvg

    watermark_obj.transparentize(transparency)
    source_obj.composite_channel(
        'all_channels', watermark_obj, blend_mode,
        source_obj.size[0] / 2 - watermark_obj.size[0] / 2,
        source_obj.size[1] / 2 - watermark_obj.size[1] / 2
    )

    source_obj.save(filename=target)

    return True
