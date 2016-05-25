# API админки
from bottle import route, template, request, abort, static_file, Response
import jwt
import Crypto.PublicKey.RSA as RSA
import datetime
from bson.objectid import ObjectId
import os
import common
import json
import random
from random import randint
import string
import conf


from bottle import debug
debug(conf.debug)


# Админка. По маршруту возвращается шаблон
@route('/adminka')
@route('/adminka/login')
@route('/adminka/masters')
def adm_adminka():
    return static_file("adminka.html", root='./static')


# Админка. возврат файлов с учетом прав доступа
@route('/adminka/<access>/<filename:path>')
def adm_static(access, filename):
    if access == "public":
        return static_file(filename, root='./static/adminka/public')
    elif access == "restricted":
        result_check_rights = check_rights("admin", request)
        if result_check_rights["status"]:
            return static_file(filename, root='./static/adminka/restricted')
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
                result["scoreDetail"] = conf.db.scoreMasters.find_one({"master_id": ObjectId(id)})
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

            if "alias_id" in newMaster:
                if conf.db.masters.find_one({"alias_id":newMaster["alias_id"]}) is not None:
                    raise ValueError('Уже есть мастер с таким алиасом: {alias}'.format(alias=repr(newMaster["alias_id"])))

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

        except ValueError as err:
            result["status"] = "Error"
            result["note"] = str(err.args)
        except Exception as err:
            result["status"] = "Error"
            result["note"] = str(err)

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


# API админки. Выполнение специальных операций
@route('/api/adminka/Operations')
def adm_runOperation():
    result_check_rights = check_rights("admin", request)
    if result_check_rights["status"]:
        if request.params.operation == "generateTestMasters":
            generateTestMasters(2000)
            return {"status":"OK"}
        elif request.params.operation == "clearDB":
            clearDB()
            return {"status": "OK"}
    else:
        return abort(401, "Sorry, access denied.")



def generateTestMasters(count):
    try:
        for i in range(count):
            # иницаиализируем мастера
            master = dict()

            detailPattern = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Morbi lacinia molestie dui. Praesent blandit dolor. Sed non quam. In vel mi sit amet augue congue elementum. Morbi in ipsum sit amet pede facilisis laoreet. Donec lacus nunc, viverra nec, blandit vel, egestas et, augue. Vestibulum tincidunt malesuada tellus. Ut ultrices ultrices enim. Curabitur sit amet mauris. Morbi in dui quis est pulvinar ullamcorper."
            master["detail"] = detailPattern[0:randint(100, 500)]

            status_list = ["new","register","active", "closed"]
            kind_profile_list = ["org","phys"]

            #avatars_list = load
            #workPhoto_list = load

            # randint(0, 9)

            kubik = randint(1, 10)

            status_index = 0

            if kubik>0 and kubik<9:
                status_index = 1
            elif kubik==9:
                status_index = 0
            elif kubik==10:
                status_index = 3

            master["status"] = status_list[status_index]
            master["name"] = "Мастер " + str(i)
            master["kind_profile"] = kind_profile_list[randint(0, 1)]

            if master["kind_profile"]=="phys":
                master["sername"] = "Мастеров"
                master["patronymic"] = "Мастерович"

            master["email"] = "".join(
                random.choice(string.ascii_lowercase + string.digits) for x in range(8)) + "@mail.ru"


            master["additional_service"] = []
            master["works"] = []
            master["categories"] = []

            master["score"] = 0
            master["phone1"] = ""
            master["phone2"] = ""
            master["avatar"] = conf.img_no_avatar


            if master["status"]!="new":
                master["phone1"] = str(randint(9220000000, 9999999999))

                phone_count = randint(1, 2)

                if phone_count==2:
                    master["phone2"] = str(randint(9220000000, 9999999999))



                with open('storage/avatars.txt') as my_file:
                    avatars_list = my_file.read().splitlines()

                master["avatar"] = avatars_list[randint(0, len(avatars_list)-1)]

                # заполняем доп. услуги
                case_add_service = randint(0, 2)
                # 0 - ничего не выбрано
                if case_add_service == 1: # выбран 1
                    pos = randint(0, 1)
                    master["additional_service"].append(conf.addServicesDict[pos]["_id"])
                elif case_add_service == 2: # выбраны все
                    master["additional_service"].append(conf.addServicesDict[0]["_id"])
                    master["additional_service"].append(conf.addServicesDict[1]["_id"])


                # заполняем работы
                with open('storage/photos.txt') as my_file:
                    photos_list = my_file.read().splitlines()

                count_works = randint(0, 11)

                for i in range(count_works):
                    newWork = {"description": "ремонт в квартире " + str(i), "photos":[]}

                    count_photos = randint(1, 12)
                    for p in range(count_photos):
                        newPhoto = {"description":"Фото "+str(p),"filename":photos_list[randint(0, len(photos_list)-1)]}
                        newWork["photos"].append(newPhoto)

                    master["works"].append(newWork)

                # print(photos_list)

                # заполняем категории-виды_работ-услуги


                category_list = list(conf.db.category_job.find({"type":"category"}))

                count_category = randint(0, 2)

                for c in range(count_category):
                    category_index = randint(0, len(category_list)-1)

                    category = category_list[category_index]

                    newCategory = dict()
                    newCategory["name"] = category["val"]
                    newCategory["order"] = category["order"]
                    newCategory["_id"] = str(category["_id"])
                    newCategory["kind_services"]=[]

                    kindServices_list = list(conf.db.category_job.find({"parent_id": category["_id"]}))

                    for kindService in kindServices_list:
                        newKindService = dict()

                        newKindService["name"] = kindService["val"]
                        newKindService["order"] = kindService["order"]
                        newKindService["_id"] = str(kindService["_id"])
                        newKindService["services"]=[]

                        services_list = list(conf.db.category_job.find({"parent_id": kindService["_id"]}))
                        count_services = randint(0, len(services_list))

                        for s in range(count_services):
                            service = services_list[randint(0, len(services_list)-1)]
                            newService = dict()
                            newService["_id"] = str(service["_id"])
                            newService["order"] = service["order"]
                            newService["measure"] = service["measure"]
                            newService["name"] = service["val"]
                            newService["price"] = randint(0,10000)

                            newKindService["services"].append(newService)
                            services_list.remove(service)

                        newCategory["kind_services"].append(newKindService)

                    master["categories"].append(newCategory)
                    category_list.remove(category)


                # print(master)

            # сохраняем мастера
            result = conf.db.masters.insert_one(master)

            # создать пользователя
            newUser = {"master_id": ObjectId(result.inserted_id),
                        "status": master["status"],
                        "login": master["email"],
                        "password": "123"}

            conf.db.users_masters.insert_one(newUser)

            # считаем баллы
            common.calcScoreMaster(result.inserted_id)


    except Exception as e:
        print(e)

def clearDB():
    conf.db.scoreMasters.delete_many({})
    conf.db.users_masters.delete_many({})
    conf.db.masters.delete_many({})
    conf.db.averagePrices.delete_many({})

@route ('/api/adminka/ordersService')
def adm_getOrders():
    result = list(conf.db.orders.find().sort("when",-1))
    return common.JSONEncoder().encode(result)

@route ('/api/adminka/options')
def adm_getOptions():
    result = list(conf.db.options.find().sort("option",-1))
    return common.JSONEncoder().encode(result)

@route ('/api/adminka/options', method='POST')
def adm_setOption():
    conf.db.options.replace_one({"_id":ObjectId(request.json["_id"])},{"option":request.json["option"],"value":request.json["value"]})


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

            conf.db.scoreMasters.delete_one({"master_id":ObjectId(id)})

            # удаляем мастера из БД
            conf.db.masters.delete_one({'_id': ObjectId(id)})

            # удаляем пользователя
            conf.db.users_masters.delete_one({'master_id': ObjectId(id)})

            # удаляем расчет баллов
            conf.db.scoreMasters.delete_one({'master_id': ObjectId(id)})

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




