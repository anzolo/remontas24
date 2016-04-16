from bottle import route, static_file
import json
from bson import ObjectId
import conf
import os
import uuid

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
            else:
                #исключаем фото, которое осталось в мастере из списка удаления
                if oldPhotos.count(photo["filename"])>0:
                    oldPhotos.remove(photo["filename"])

    #удаляем фото, которых нет в новом мастере
    for photo in oldPhotos:
        oldFilePath = conf.works_path + photo
        if os.path.isfile(oldFilePath):
            os.remove(oldFilePath)
