# API админки
from bottle import route, template, request, abort, static_file, Response
import jwt
import Crypto.PublicKey.RSA as RSA
import datetime
from bson.objectid import ObjectId
import uuid
import os
from common import JSONEncoder

import conf


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
    result = {"status": "forbidden",
              "user_id": None,
              "role": None
             }

    if role == "admin":
        result = check_login_admin(request.json["username"], request.json["password"], result)
    elif role == "master":
        result = check_login_master(request.json["username"], request.json["password"], result)
    else:
        return abort(401, "Неверный логин или пароль.")

    if result["status"] == "success":
        result = create_session(result)
        del result["user_id"]
        return result
    else:
        return abort(401, "Неверный логин или пароль.")


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
            if master != None:
                # master["_id"] = str(master["_id"])
                master["avatar"] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)
                master["status"] = "OK"
            else:
                master["status"] = "Error"
                master["note"] = "id not found"

        except Exception as e:
                master["status"] = "Error"
                master["note"] = str(e)
                print(e)

        return JSONEncoder().encode(master)
    else:
        return abort(401, "Sorry, access denied.")


# API админки. Пересохранить мастера при редактировании
@route('/api/adminka/masters/<id>', method='POST')
def adm_saveAfterEdit(id):
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        result = {}
        newMaster = {}

        try:
            oldMaster = conf.db.masters.find_one({"_id": ObjectId(id)})
            if oldMaster != None:

                upload = request.files.get("avatar")

                if upload != None:
                    filename, ext = os.path.splitext(upload.raw_filename)
                    new_filename = str(uuid.uuid4())
                    upload.filename = new_filename + ext
                    newMaster["avatar"] = upload.filename
                else:
                    newMaster["avatar"] = conf.img_no_avatar

                newMaster["name"] = request.forms.get("name")
                newMaster["email"] = request.forms.get("email")
                newMaster["jobs_count"] = request.forms.get("jobs_count")
                newMaster["kind_profile"] = request.forms.get("kind_profile")
                newMaster["detail"] = request.forms.get("detail")
                newMaster["phone1"] = request.forms.get("phone1")
                newMaster["phone2"] = request.forms.get("phone2")
                if request.forms.get("kind_profile") == "phys":
                    newMaster["sername"] = request.forms.get("sername")
                    newMaster["patronymic"] = request.forms.get("patronymic")

                # print("newMaster = ",newMaster)

                resultQuery = conf.db.masters.update_one({"_id": ObjectId(id)}, {"$set": newMaster})

                # print("resultQuery.result.matched_count = ",resultQuery.result.matched_count)
                # print("resultQuery.result.modified_count = ",resultQuery.result.modified_count)
                # print("----------",oldAvatarFileName)

                oldFilePath = conf.storage_path + "/" + oldMaster["avatar"]

                if os.path.isfile(oldFilePath):
                    if oldMaster["avatar"] != conf.img_no_avatar:
                        os.remove(oldFilePath)
                else:    # Show an error ##
                    print("Error: %s file not found" % oldMaster["avatar"])

                upload.save(conf.storage_path)

                result["status"] = "OK"

            else:
                result["status"] = "Error"
                result["note"] = "id not found"

        except Exception as e:
                result["status"] = "Error"
                result["note"] = str(e)
                print(e)

        return result
    else:
        return abort(401, "Sorry, access denied.")


# API админки. создание нового мастера в админке
@route('/api/adminka/masters', method='POST')
def adm_createNewMaster():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:

        result = {}
        newMaster = {}

        # print(request.forms.get('name'))
        # print(request.forms.get('works'))

        upload = request.files.get("avatar")

        if upload != None:
            filename, ext = os.path.splitext(upload.raw_filename)
            new_filename = str(uuid.uuid4())
            upload.filename = new_filename + ext
            newMaster["avatar"] = upload.filename
        else:
            newMaster["avatar"] = conf.img_no_avatar

        # print(upload.filename)

        newMaster["name"] = request.forms.get("name")
        newMaster["email"] = request.forms.get("email")
        newMaster["jobs_count"] = request.forms.get("jobs_count")
        newMaster["kind_profile"] = request.forms.get("kind_profile")
        newMaster["detail"] = request.forms.get("detail")
        newMaster["phone1"] = request.forms.get("phone1")
        newMaster["phone2"] = request.forms.get("phone2")
        if request.forms.get("kind_profile") == "phys":
            newMaster["sername"] = request.forms.get("sername")
            newMaster["patronymic"] = request.forms.get("patronymic")

        try:
            conf.db.masters.insert_one(newMaster)

            if upload != None:
                upload.save(conf.storage_path)

            result["status"] = "OK"

        except Exception as e:
            #print(e)
            result["status"] = "Error"
            result["note"] = str(e)

        return result
    else:
        return abort(401, "Sorry, access denied.")


# API админки. Сервис получения информации по категориям
@route('/api/adminka/categories')
def adm_getCategoriesList():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        if request.params.method == "getAll":
            return JSONEncoder().encode(list(conf.db.category_job.find()))
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
                Response.status = 200
                return None

            except Exception as e:
                abort(500, str(e))
                print(e)

        elif request.params.method == "saveEdited":
            try:
                conf.db.category_job.update(
                    {"_id": ObjectId(request.json["_id"])},
                    {"$set": {"val": request.json["val"]}}
                    )
                Response.status = 200
                return None

            except Exception as e:
                abort(500, str(e))
                print(e)

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
    if user != None:
        result["status"] = "success"
        result["user_id"] = str(user["_id"])
        result["username"] = username
        result["role"] = "admin"
    return result


# Ремонтас. Проверка логина и пароля по БД для мастера
def check_login_master(login, password, result):
    users = conf.db.users_masters
    user = users.find_one({"login": login, "password": password})
    if user != None:
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
