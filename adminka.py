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
        if request.params.method == "deleteMaster":
            return deleteMaster(request.params.id_to_delete)
        else:
            masters_list = []
            result = {}

            for master in conf.db.masters.find():
                new_master = {}
                new_master["name"] = master["name"]
                new_master["_id"] = master["_id"]
                new_master["avatar"] = master["avatar"]
                # new_master["works_count"] = len(master["works"])
                new_master["kind_profile"] = master["kind_profile"]
                new_master["email"] = master["email"]
                masters_list.append(new_master)

            result["masters"] = masters_list
            result["configUrl"] = conf.configUrl

            return common.JSONEncoder().encode(result)
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

                common.calcScoreMaster(master_id)

            else: #если это создание нового мастера
                newMaster["status"] = "new"
                newMaster["score"] = 0
                common.syncFiles(newMaster, None, request)
                result["new_id"] = str(conf.db.masters.insert_one(newMaster).inserted_id)
                result["note"] = "Создан новый мастер"

                common.calcScoreMaster(conf.db.masters.insert_one(newMaster).inserted_id)

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

        elif request.params.method == "delete":
            categoryElement = conf.db.category_job.find_one({"_id":ObjectId(request.json['id'])})

            if not categoryElement is None:
                # это категория

                if categoryElement["type"]=="category":
                    deleteCategory(categoryElement["_id"])

                # это вид услуг
                if categoryElement["type"] == "service":
                    deleteKindService(categoryElement["_id"])

                # это услуга
                if categoryElement["type"] == "job":
                    deleteService(categoryElement["_id"])

            return {"status":"OK"}

    else:
        return abort(401, "Sorry, access denied.")

def deleteCategory(id):

    masters = list(conf.db.masters.find({"categories._id": str(id)}))

    for master in masters:
        tempCategory=None
        for category in master["categories"]:
            if category["_id"]==str(id):
                tempCategory = category
        if not tempCategory is None:
            master["categories"].remove(tempCategory)
            tempCategory = None
            conf.db.masters.replace_one({"_id":master["_id"]}, master)

    conf.db.category_job.delete_one({'_id': ObjectId(id)})

def deleteKindService(id):
    masters = list(conf.db.masters.find({"categories.kind_services._id": str(id)}))

    for master in masters:
        tempKindService = None
        for category in master["categories"]:
            for kindService in category["kind_services"]:
                if kindService["_id"] == str(id):
                    tempKindService = kindService
            if not tempKindService is None:
                category["kind_services"].remove(tempKindService)
                tempKindService = None
        conf.db.masters.replace_one({"_id": master["_id"]},master)

    conf.db.category_job.delete_one({'_id': ObjectId(id)})

def deleteService(id):
    masters = list(conf.db.masters.find({"categories.kind_services.services._id": str(id)}))

    for master in masters:
        tempService = None
        tempKindService = None
        for category in master["categories"]:
            for kindService in category["kind_services"]:
                for service in kindService["services"]:
                    if service["_id"] == str(id):
                        tempService = service
                if not tempService is None:
                    kindService["services"].remove(tempService)
                    tempService = None
                if len(kindService["services"])==0:
                    tempKindService = kindService
            if not tempKindService is None:
                category["kind_services"].remove(tempKindService)
                tempKindService = None
        conf.db.masters.replace_one({"_id": master["_id"]}, master)

    conf.db.category_job.delete_one({'_id': ObjectId(id)})


# удаление мастера
def deleteMaster(id):
    result = dict()

    try:
        master = conf.db.masters.find_one({"_id": ObjectId(id)})

        if not master is None:

            # удаляем все фото
            for work in master["works"]:
                for photo in work["photos"]:
                    deleteFilePath = conf.works_path + photo["filename"]
                    if os.path.isfile(deleteFilePath):
                        os.remove(deleteFilePath)

            # удаляем автарку
            if master["avatar"]!=conf.img_no_avatar:
                deleteFilePath = conf.works_path + master["avatar"]
                if os.path.isfile(deleteFilePath):
                    os.remove(deleteFilePath)

            # удаляем мастера из БД
            conf.db.masters.delete_one({'_id': ObjectId(id)})

            result["status"] = "OK"
        else:
            result["status"] = "Error"
            result["note"] = "master not found"

        return result

    except Exception as e:
        result["status"] = "Error"
        result["note"] = str(e)
        print("Error: " + str(e))
        common.writeToLog("error", "rem_lkSaveData: " + str(e))
        return result

# сервис управления пользователями
@route('/api/adminka/usersManage')
def adm_manageUsers():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        if request.params.method == "getAllUsersMasters":
            users_list = []
            result = {}

            for user in conf.db.users_masters.find():
                tempUser = {}
                tempUser["master_id"] = user["master_id"]
                tempUser["status"] = user["status"]
                tempUser["login"] = user["login"]
                tempUser["password"] = user["password"]

                users_list.append(tempUser)

            result["users"] = users_list
            # result["configUrl"] = conf.configUrl

            return common.JSONEncoder().encode(result)
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


