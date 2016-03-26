from bottle import route, template, request, abort, static_file, Response
from bson.objectid import ObjectId

from common import JSONEncoder
import adminka
import conf
import os
import json
import uuid


# Ремонтас. По маршруту возвращается шаблон
@route('/')
def index():
    return template('remontas')


# Ремонтас. возврат файлов с учетом прав доступа
@route('/remontas/<access>/<filename:path>')
def static(access, filename):
    if access == "public":
        return static_file(filename, root='./remontas/public')
    elif access == "restricted":
        result_check_rights = adminka.check_rights("master", request)
        if result_check_rights["status"]:
            return static_file(filename, root='./remontas/restricted')
        else:
            return abort(401, "Sorry, access denied.")


# API ремонтаса. получение списка мастеров для главной странице по фильтру
@route('/api/main/searchMasters')
def rem_doSearchMasters():
    result = {"filter": {"first_job": None, "second_job": None, "extra_jobs": {}}, "masters_count": 80, "current_page": 3, "max_page": 6, "masters": []}

    # perfect_master = {'name':"Петр", 'foto':img_path + "img-user-1.png", 'jobs_count':"5 работ", 'guid':"id", 'link':"src"}

    # for master in range(15):
    #    result["masters"].append(perfect_master)
    for master in conf.db.masters.find():
        newMaster = {}
        newMaster["name"] = master["name"]
        newMaster["jobs_count"] = str(master["jobs_count"]) + " работ"
        newMaster["avatar"] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)
        newMaster["id"] = str(master["_id"])
        result["masters"].append(newMaster)
    return result


# API ремонтаса. получение данных для личного кабинета
@route('/api/lk')
def rem_lkGetData():
    result_check_rights = adminka.check_rights("master", request)
    if result_check_rights["status"]:
        user = conf.db.users_masters.find_one({"_id": ObjectId(result_check_rights["user_id"])})
        lkResult = {}

        if request.params.method == "init":
            try:
                master = conf.db.masters.find_one({"_id": ObjectId(user["master_id"])})
                if master != None:
                    # master["_id"] = str(master["_id"])
                    master["avatar"] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)
                    lkResult["status"] = "OK"

                    categories = list(conf.db.category_job.find())
                    lkResult["master"] = master
                    lkResult["categories"] = categories

                else:
                    lkResult["status"] = "Error"
                    lkResult["note"] = "id not found"
            except Exception as e:
                    lkResult["status"] = "Error"
                    lkResult["note"] = str(e)
                    print(e)

            return JSONEncoder().encode(lkResult)

        elif request.params.method == "123":
            pass

    else:
        return abort(401, "Sorry, access denied.")

# API ремонтаса. Сохранение данных
@route('/api/lk', method='POST')
def rem_lkSaveData():
    result_check_rights = adminka.check_rights("master", request)
    if result_check_rights["status"]:
        user = conf.db.users_masters.find_one({"_id": ObjectId(result_check_rights["user_id"])})

        result = {}

        try:
            master = conf.db.masters.find_one({"_id": ObjectId(user["master_id"])})
            if master != None:

                newMaster = json.loads(request.forms.get("master"))

                del newMaster["_id"]

                upload = request.files.get("avatar")

                if upload != None:
                    filename, ext = os.path.splitext(upload.raw_filename)
                    new_filename = str(uuid.uuid4())
                    upload.filename = new_filename + ext

                    oldFilePath = conf.storage_path + master["avatar"]

                    if os.path.isfile(oldFilePath):
                        if master["avatar"] != conf.img_no_avatar:
                            os.remove(oldFilePath)
                    else:  # Show an error ##
                        print("Error: %s file not found" % master["avatar"])

                    newMaster["avatar"] = upload.filename

                    upload.save(conf.storage_path)

                conf.db.masters.update_one({"_id": ObjectId(user["master_id"])}, {"$set": newMaster})

                result["status"] = "OK"

            else:
                raise ValueError('Master id not found.', str(user["master_id"]))

        except Exception as e:
            result["status"] = "Error"
            result["note"] = str(e)
            print(e)

        return result

    else:
        return abort(401, "Sorry, access denied.")

@route('/api/lk/mainDataSave', method='POST')
def rem_mainDataSave():
    print("Hello")
    result_check_rights = adminka.check_rights("master", request)
    if result_check_rights["status"]:
        try:
            conf.db.masters.update(
                {"_id": ObjectId(result_check_rights["master_id"])},
                {
                 "$set":{"phone1": request.json["phone1"],
                 "phone2": request.json["phone2"],
                 "detail": request.json["detail"]}
                }
                )
            Response.status = 200
            return None
        except Exception as e:
            abort(500, str(e))
            print(e)
