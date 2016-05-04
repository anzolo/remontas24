# API админки
from bottle import route, template, request, abort, static_file, Response
import jwt
import Crypto.PublicKey.RSA as RSA
import datetime
from bson.objectid import ObjectId
import os
import common
import json

import conf

from bottle import debug
debug(True)


# Админка. По маршруту возвращается шаблон
@route('/adminka')
@route('/adminka/login')
@route('/adminka/masters')
def adm_adminka():
    return template('adminka')


# Админка. возврат файлов с учетом прав доступа
@route('/adminka/<access>/<filename:path>')
def adm_static(access, filename):
    if access == "public":
        return static_file(filename, root='./adminka/public')
    elif access == "restricted":
        result_check_rights = check_rights("admin", request)
        if result_check_rights["status"]:
            return static_file(filename, root='./adminka/restricted')
        else:
            return abort(401, "Sorry, access denied.")
            # return bottle.static_file(filename, root='./adminka/restricted')


# API админки. по логину-паролю возвращаем пользователя
@route('/api/login/<role>', method='POST')
def do_login(role):
    try:
        result = {"status": "forbidden",
                  "user_id": None,
                  "role": None
                 }

        if role == "admin":
            result = check_login_admin(request.json["username"], request.json["password"], result)
        elif role == "master":
            result = check_login_master(request.json["username"], request.json["password"], result)

        if result["status"] == "success":
            result = create_session(result)
            del result["user_id"]
            return result
        else:
            del result["user_id"]
            del result["role"]
            return result

    except Exception as e:
        print("Error: " + str(e))
        common.writeToLog("error", "do_login: " + str(e))


# API админки. получение списка всех мастеров
@route('/api/adminka/masters')
def adm_getMastersList():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:

        masters_list = []
        result = {}

        for master in conf.db.masters.find():
            new_master = {}
            new_master["name"] = master["name"]
            new_master["id"] = str(master["_id"])
            new_master["avatar"] = "/storage/" + master.get("avatar", conf.img_no_avatar)
            new_master["jobs_count"] = master["jobs_count"]
            new_master["kind_profile"] = master["kind_profile"]
            new_master["email"] = master["email"]
            masters_list.append(new_master)

        result["masters"] = masters_list
        return result
    else:
        return abort(401, "Sorry, access denied.")


# API админки. получить одного мастера для отображения
@route('/api/adminka/masters/<id>')
def adm_getMaster(id):
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        masters = conf.db.masters

        try:
            master = masters.find_one({"_id": ObjectId(id)})
            result = {}
            if master != None:
                # master["_id"] = str(master["_id"])
                #master["avatar"] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)

                #master["avatar"] = conf.img_url_path + master.get("avatar", conf.img_no_avatar)



                result["status"] = "OK"
                result["master"] = master
                result["categories"] = list(conf.db.category_job.find())
                result["configUrl"] = conf.configUrl

            else:
                result["status"] = "Error"
                result["note"] = "id not found"

        except Exception as e:
                result["status"] = "Error"
                result["note"] = str(e)
                print(e)

        return common.JSONEncoder().encode(result)
    else:
        return abort(401, "Sorry, access denied.")


# API админки. Создать нового/пересохранение существующего мастера при редактировании
@route('/api/adminka/masters', method='POST')
def adm_manageMasters():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        result = {}
        isNewMaster = False

        try:
            newMaster = json.loads(request.forms.get("master"))

            if "_id" in newMaster:

                master_id = newMaster["_id"]

                oldMaster = conf.db.masters.find_one({"_id": ObjectId(master_id)})

                del newMaster["_id"]
            else:
                oldMaster = None
                isNewMaster = True

            avatarFile = request.files.get("avatar")

            #сохранение аватарки, если выбрана. если не выбрана, то делается "нет фото"
            if avatarFile is not None:

                avatarFile.filename = common.createFileName(avatarFile.raw_filename)
                newMaster["avatar"] = avatarFile.filename

                avatarFile.save(conf.storage_path)

                if not isNewMaster:
                    oldFilePath = conf.storage_path + oldMaster["avatar"]
                    if os.path.isfile(oldFilePath):
                        if oldMaster["avatar"] != conf.img_no_avatar:
                            os.remove(oldFilePath)

                else:  # Show an error ##
                    print("Error: %s file not found" % oldMaster["avatar"])
            elif isNewMaster:
                newMaster["avatar"] = conf.img_no_avatar


            #если мастер уже существует
            if not isNewMaster:

                common.syncFiles(newMaster, oldMaster, request)

                conf.db.masters.update_one({"_id": ObjectId(master_id)}, {"$set": newMaster})

                result["note"] = "Отредактирован существующий мастер"

            else: #если это создание нового мастера
                common.syncFiles(newMaster, None, request)
                result["new_id"] = str(conf.db.masters.insert_one(newMaster).inserted_id)
                result["note"] = "Создан новый мастер"

            result["status"] = "OK"

        except Exception as e:
                result["status"] = "Error"
                result["note"] = str(e)
                #print(e)

        return result

    else:
        return abort(401, "Sorry, access denied.")

# API админки. Сервис получения информации по категориям
@route('/api/adminka/categories')
def adm_getCategoriesList():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        if request.params.method == "getAll":
            return common.JSONEncoder().encode(list(conf.db.category_job.find()))
    else:
        return abort(401, "Sorry, access denied.")


# API админки. Сервис создания и изменения категорий
@route('/api/adminka/categories', method='POST')
def adm_saveCategory():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        if request.params.method == "saveNew":
            newCategory = request.json
            if newCategory["type"] == "category":
                newCategory["parent_id"] = None
                newCategory["order"] = 1
                for maxOrder in conf.db.category_job.find({"type": "category"}).sort([("order", -1)]).limit(1):
                    newCategory["order"] = maxOrder["order"] + 1

            elif newCategory["type"] == "service":
                newCategory["parent_id"] = ObjectId(newCategory["parent_id"])
                newCategory["order"] = 1
                for maxOrder in conf.db.category_job.find({"type": "service", "parent_id": ObjectId(newCategory["parent_id"])}).sort([("order", -1)]).limit(1):
                    newCategory["order"] = maxOrder["order"] + 1

            elif newCategory["type"] == "job":
                newCategory["parent_id"] = ObjectId(newCategory["parent_id"])
                newCategory["order"] = 1
                for maxOrder in conf.db.category_job.find({"type": "job", "parent_id": ObjectId(newCategory["parent_id"])}).sort([("order", -1)]).limit(1):
                    newCategory["order"] = maxOrder["order"] + 1

            try:
                conf.db.category_job.insert_one(newCategory)

            except Exception as e:
                print(e)
                return abort(500, str(e))


        elif request.params.method == "saveEdited":
            try:
                if not ("measure" in request.json):
                    request.json["measure"]=""


                conf.db.category_job.update_one(
                    {"_id": ObjectId(request.json["_id"])},
                    {"$set": {"val": request.json["val"],
                              "measure": request.json["measure"]}}
                    )

            except Exception as e:
                print(e)
                return abort(500, str(e))


    else:
        return abort(401, "Sorry, access denied.")


# проверка прав на запрос к api на основе информации зашифрованной в токене
def check_rights(role, rq):
    result = {"status": False}
    # print(rq.get_header("Authorization"))
    if rq.get_header("Authorization") != None:
        bearer = rq.get_header("Authorization").split()

        try:
            header, claims = jwt.verify_jwt(bearer[1], conf.session_pub_key, ['PS256'])
            # print(header)
            # print(claims)

            if claims["role"] == role:
                result["status"] = True
                result["user_id"] = claims["user_id"]
                if claims["role"] == "master":
                    result["master_id"] = claims["master_id"]
                    print(str(claims["master_id"]), role)
            else:
                print("Попытка запросить ресурс по токену с недостаточными правами.")

        except Exception as e:
            print(e)

    return result


# Админка. Проверка логина и пароля по БД для админа
def check_login_admin(username, password, result):
    users = conf.db.users_adminka
    user = users.find_one({"username": username, "password": password})
    if (user is not None):
        result["status"] = "success"
        result["user_id"] = str(user["_id"])
        result["username"] = username
        result["role"] = "admin"
    return result


# Ремонтас. Проверка логина и пароля по БД для мастера
def check_login_master(login, password, result):
    users = conf.db.users_masters
    user = users.find_one({"login": login, "password": password})
    if (user is not None) and (user["status"]!="new") and (user["status"]!="closed"):
        result["status"] = "success"
        result["user_id"] = str(user["_id"])
        result["username"] = login
        result["role"] = "master"
        result["master_id"] = str(user["master_id"])
    return result


# Создание токена сессии. вызывается, если успешно пройдена авторизация
# Доделать. различное время сессии для админа и мастера
# Доделать. Свой ключ шифрования для сессий мастеров
def create_session(result):
    priv_key = RSA.importKey(conf.session_priv_key)

    payload = {'user_id': result["user_id"], 'role': result["role"]}

    if result["role"] == "master":
        payload["master_id"] = result["master_id"]

    result["token"] = jwt.generate_jwt(payload, priv_key, 'PS256', datetime.timedelta(minutes=conf.session_time_out_minutes_admin if result["role"] == "admin" else conf.session_time_out_minutes_master))

    return result
