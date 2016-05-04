from bottle import route, template, request, abort, static_file, url, redirect
from bson.objectid import ObjectId

import adminka
import common
import conf
import os
import json


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
    # result = {"filter": {"first_job": None, "second_job": None, "extra_jobs": {}}, "masters_count": 80, "current_page": 3, "max_page": 6, "masters": []}

    # perfect_master = {'name':"Петр", 'foto':img_path + "img-user-1.png", 'jobs_count':"5 работ", 'guid':"id", 'link':"src"}

    # for master in range(15):
    #    result["masters"].append(perfect_master)

    result = dict()


    masters = conf.db.masters.find({"score": {"$gte": 0}}).sort("score", -1)

    result["count"] = masters.count()
    result["masters"] = []
    result["configUrl"] = conf.configUrl

    for master in masters:
        bufMaster = {"_id":master["_id"],
                     "name": master["name"],
                     "avatar": master["avatar"],
                     "count_works":len(master["works"])}
        result["masters"].append(bufMaster)

    return common.JSONEncoder().encode(result)

    # разбираем фильтр пришедший от клиента

    # забираем мастеров из базы в соответствии с фильтром; берем только активных; сортируем по убыванию баллам

    #



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
                if master is not None:
                    lkResult["master"] = master
                    lkResult["categories"] = list(conf.db.category_job.find())
                    lkResult["configUrl"] = conf.configUrl
                    lkResult["scoreDetail"] = conf.db.scoreMasters.find_one({"master_id":ObjectId(user["master_id"])})
                    lkResult["status"] = "OK"
                else:
                    lkResult["status"] = "Error"
                    lkResult["note"] = "id not found"
            except Exception as e:
                    lkResult["status"] = "Error"
                    lkResult["note"] = str(e)
                    print(e)
                    common.writeToLog("error", str(e))

            return common.JSONEncoder().encode(lkResult)

        # elif request.params.method == "123":
        #    pass

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
            oldMaster = conf.db.masters.find_one({"_id": ObjectId(user["master_id"])})
            if oldMaster != None:

                newMaster = json.loads(request.forms.get("master"))

                del newMaster["_id"]

                if "email" in newMaster and "email" in oldMaster:
                    newMaster["email"] = oldMaster["email"]
                if "status" in newMaster and "status" in oldMaster:
                    newMaster["status"] = oldMaster["status"]
                if "kind_profile" in newMaster and "kind_profile" in oldMaster:
                    newMaster["kind_profile"] = oldMaster["kind_profile"]
                if "name" in newMaster and "name" in oldMaster:
                    newMaster["name"] = oldMaster["name"]
                if "sername" in newMaster and "sername" in oldMaster:
                    newMaster["sername"] = oldMaster["sername"]
                if "patronymic" in newMaster and "patronymic" in oldMaster:
                    newMaster["patronymic"] = oldMaster["patronymic"]


                avatarFile = request.files.get("avatar")

                if avatarFile is not None:
                    avatarFile.filename = common.createFileName(avatarFile.raw_filename)
                    newMaster["avatar"] = avatarFile.filename

                    avatarFile.save(conf.storage_path)

                    oldFilePath = conf.storage_path + oldMaster["avatar"]
                    if os.path.isfile(oldFilePath):
                        if oldMaster["avatar"] != conf.img_no_avatar:
                            os.remove(oldFilePath)
                    else:  # Show an error ##
                        print("Error: %s file not found" % oldMaster["avatar"])

                common.syncFiles(newMaster, oldMaster, request)

                conf.db.masters.update_one({"_id": ObjectId(user["master_id"])}, {"$set": newMaster})

                calcScoreMaster(user["master_id"])

                result["status"] = "OK"

            else:
                raise ValueError('Master id not found.', str(user["master_id"]))

        except Exception as e:
            result["status"] = "Error"
            result["note"] = str(e)
            print("Error: " + str(e))
            common.writeToLog("error", "rem_lkSaveData: " + str(e))

        return result

    else:
        return abort(401, "Sorry, access denied.")

def calcScoreMaster(master_id):
    try:
        master = conf.db.masters.find_one({"_id": ObjectId(master_id)})

        score = 0
        reset_to_register = False

        scoreDecription = {"master_id":ObjectId(master_id),"details":[]}
        scoreMainCriteria = []

        if master != None:

            del master["_id"]

            if (master["status"]!="closed"):

                # критерий - нет аватарки
                ballDescr = {"description": "Загружено фото мастера/логотип компании", "status":True}

                if master["avatar"] == conf.img_no_avatar:
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - есть 3 работы в портфолио в которых более 5 фото
                ballDescr = {"description": "Заполнено 3 работы в портфолио с не менее 5-ю фотографиями", "status": True}

                works = 0
                for work in master["works"]:
                    if len(work["photos"])>=5:
                        works+=1

                if works<3:
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - заполнен хотя бы один телефон
                ballDescr = {"description": "Заполнен контактный телефон", "status": True}

                if (len(master["phone1"])==0) and (len(master["phone2"])==0):
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                # критерий - прайс заполнен на 50% или более
                ballDescr = {"description": "Заполнено более 50% цен на услуги", "status": True}

                allServicesCount = 0
                serviceWithPriceCount = 0
                for category in master["categories"]:
                    for kindService in conf.db.category_job.find({"parent_id": ObjectId(category["_id"])}):
                        allServicesCount+=conf.db.category_job.find({"parent_id": kindService["_id"]}).count()
                    for kindServiceMaster in category["kind_services"]:
                        for service in kindServiceMaster["services"]:
                            if service["price"]>0:
                                serviceWithPriceCount+=1

                # print("allServicesCount = " + str(allServicesCount) + "; serviceWithPriceCount = "+str(serviceWithPriceCount))
                if ((allServicesCount>0) and ((serviceWithPriceCount/allServicesCount)<0.5)) or (allServicesCount==0):
                    reset_to_register = True
                    ballDescr["status"] = False

                scoreMainCriteria.append(ballDescr)

                scoreDecription["details"].append({"description":"Заполнена основная информация","score":50, "details":scoreMainCriteria,"status":not reset_to_register})

                # подсчтет остальных критериев
                if not reset_to_register:

                    score+=50

                    #критерий - заполнено 100% цен на услуги - 15 баллов
                    ballDescr = {"description":"Заполнено 100% цен на услуги","score":15, "status":False}
                    if allServicesCount-serviceWithPriceCount==0:
                        ballDescr["status"] = True
                        score += 15

                    scoreDecription["details"].append(ballDescr)

                    # критерий - указано 2 номера телефона - 5 баллов
                    ballDescr = {"description": "Указано 2 номера телефона", "score": 5, "status": False}
                    if (len(master["phone1"])>0) and (len(master["phone2"])>0):
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
                    if works>3:
                        ballDescr["status"] = True
                        calcScore = (works - 3)*15
                        ballDescr["score"] = calcScore
                        score += calcScore

                    scoreDecription["details"].append(ballDescr)


                if not master["status"]=="new":
                    if reset_to_register:
                        master["status"] = "register"
                    else:
                        master["status"] = "active"
                else:
                    master["status"] = "new"

                master["score"] = score

                conf.db.masters.update_one({"_id": ObjectId(master_id)}, {"$set": master})
                conf.db.users_masters.update_one({"master_id": ObjectId(master_id)}, {"$set": {"status":master["status"]}})

                conf.db.scoreMasters.replace_one({"master_id":ObjectId(master_id)},scoreDecription,True)
    except Exception as e:
        print("Error: " + str(e))
        common.writeToLog("error", "calcScoreMaster: " + str(e))


# API ремонтаса. получение данных по мастеру
@route('/api/masterOpenProfile/<masterId>')
def rem_masterGetData(masterId):
    result = dict()

    try:
        master = conf.db.masters.find_one({"_id": ObjectId(masterId)})
        if master is not None:
            result["master"] = master

            #удалим лишние поля
            if "_id" in result["master"]:
                del result["master"]["_id"]
            if "status" in result["master"]:
                del result["master"]["status"]
            if "score" in result["master"]:
                del result["master"]["score"]
            if "email" in result["master"]:
                del result["master"]["email"]

            result["configUrl"] = conf.configUrl
            result["status"] = "OK"
        else:
            result["status"] = "Error"
            result["note"] = "id not found"
    except Exception as e:
        result["status"] = "Error"
        result["note"] = str(e)
        print(e)
        common.writeToLog("error", "rem_masterGetData: " + str(e))

    return common.JSONEncoder().encode(result)

@route('/api/masterRegister', method='POST')
def rem_registerMaster():
    #request.json["sername"]

    result = dict()

    try:
    # проверка полноты запроса - есть все необходимые поля
        if not ("kind_profile" in request.json):
            result["status"] = "error"
            result["errorType"] = "fieldMiss"
            result["description"] = "Отсутствует обязательное поле для регистрации: " + "kind_profile"
            return common.JSONEncoder().encode(result)
        else:
            if (request.json["kind_profile"]!="phys") and (request.json["kind_profile"]!="org"):
                result["status"] = "error"
                result["errorType"] = "fieldIncorrect"
                result["description"] = "Некорректно заполнено одно из обязательных полей"
                return common.JSONEncoder().encode(result)


        if (not ("name" in request.json)) or (not ("email" in request.json)) or (not ("password" in request.json)):
            result["status"] = "error"
            result["errorType"] = "fieldMiss"
            result["description"] = "Отсутствует обязательное поле для регистрации"
            return common.JSONEncoder().encode(result)

        if request.json["kind_profile"]=="phys":
            if not ("sername" in request.json):
                result["status"] = "error"
                result["errorType"] = "fieldMiss"
                result["description"] = "Отсутствует обязательное поле для регистрации"
                return common.JSONEncoder().encode(result)

        if len(request.json["email"])==0:
            result["status"] = "error"
            result["errorType"] = "emailBlank"
            result["description"] = "Электронная почта не заполнена"
            return common.JSONEncoder().encode(result)

        # проверка емейла - емейл не занят
        if conf.db.users_masters.find({"login": request.json["email"]}).count()>0:
            result["status"] = "error"
            result["errorType"] = "emailAlreadyRegistered"
            result["description"] = "С указанным ящиком электронной почты уже зарегистрирован мастер"
            return common.JSONEncoder().encode(result)

        # проверка пароля - если пустой, генерировать новый

        # создание мастера в базе данных
        masterUserId = createMaster(request.json, result)
        if masterUserId==None:
            return common.JSONEncoder().encode(result)

        # уведомление по почте
        if not sendNotificationAboutSuccesRegisterToMaster(masterUserId, result):
            return common.JSONEncoder().encode(result)

        result["status"] = "ok"
        return common.JSONEncoder().encode(result)

    except Exception as e:
        print("Error: " + str(e))
        result["status"] = "error"
        result["errorType"] = "unknownError"
        result["description"] = "Непредвиденная ошибка: " + str(e)
        common.writeToLog("error", "rem_registerMaster: " + str(e))
        return common.JSONEncoder().encode(result)

def createMaster(regParams, result):
    try:

        master = { "name" : regParams["name"],
                   "status" : "new",
                   "score" : 0,
                   "avatar" : conf.img_no_avatar,
                   "kind_profile" : regParams["kind_profile"],
                   "email" : regParams["email"],
                   "phone1" : "",
                   "phone2": "",
                   "detail" : "",
                   "categories" : [],
                   "additional_service" : [],
                   "works" : []
                   }

        if regParams["kind_profile"]=="phys":
            master["sername"] = regParams["sername"]
            master["patronymic"] = regParams["patronymic"]

        resultInsert = conf.db.masters.insert_one(master)

        masterUser = {
                        "login" : regParams["email"],
                        "password" : regParams["password"],
                        "master_id" : ObjectId(resultInsert.inserted_id),
                        "checkEmailCode": common.createEmailCheckCode(),
                        "status": "new"
                    }

        resultInsert = conf.db.users_masters.insert_one(masterUser)

        calcScoreMaster(masterUser["master_id"])

        return resultInsert.inserted_id

    except Exception as e:
        print("Error: " + str(e))
        result["status"] = "error"
        result["errorType"] = "unknownError"
        result["description"] = "Непредвиденная ошибка: " + str(e)
        common.writeToLog("error", "createMaster: " + str(e))
        return None

@route('/api/verifyMail/<code>', name="verifyMail")
def rem_checkEmailCode(code):
    try:
        masterUser = conf.db.users_masters.find_one({"checkEmailCode": code})

        if not masterUser==None:
            # master = conf.db.masters.find_one({"_id": masterUser["master_id"]})
            conf.db.masters.update_one({"_id": masterUser["master_id"]},{"$set":{"status":"register"}})
            # conf.db.users_masters.update_one({"_id": masterUser["_id"]}, {})
            conf.db.users_masters.update_one({"_id": masterUser["_id"]},{"$unset":{"checkEmailCode":""},"$set": {"status": "register"}})
            sendNotificationAboutSuccesVerifyEmail(masterUser["_id"])
    except Exception as e:
        print("Error: " + str(e))
        common.writeToLog("error", "rem_checkEmailCode: " + str(e))

    redirect('/')

def sendNotificationAboutSuccesRegisterToMaster(masterUserId, result):
    try:
        masterUser = conf.db.users_masters.find_one({"_id":ObjectId(masterUserId)})
        master = conf.db.masters.find_one({"_id":masterUser["master_id"]})

        siteURL = request.urlparts[0] +"://"+ request.urlparts[1] + url("verifyMail", code=masterUser["checkEmailCode"])

        messageText = conf.messageRegisterMasterText.format(name=master["name"], siteURL = siteURL)
        messageHTML = conf.messageRegisterMasterHTML.format(name=master["name"], siteURL = siteURL)

        subject = "Регистрация на remontas24.ru"

        common.sendMail(masterUser["login"], subject, messageText, messageHTML)

        return True
    except Exception as e:
        print("Error: " + str(e))
        result["status"] = "error"
        result["errorType"] = "unknownError"
        result["description"] = "Непредвиденная ошибка: " + str(e)
        common.writeToLog("error", str(e))
        return False

def sendNotificationAboutSuccesVerifyEmail(masterUserId):
    try:
        masterUser = conf.db.users_masters.find_one({"_id":ObjectId(masterUserId)})
        master = conf.db.masters.find_one({"_id":masterUser["master_id"]})

        siteURL = request.urlparts[0] +"://"+ request.urlparts[1]

        messageText = conf.messageVerifyEmailText.format(name=master["name"], siteURL = siteURL)
        messageHTML = conf.messageVerifyEmailHTML.format(name=master["name"], siteURL = siteURL)

        subject = "Доступно заполнение портфолио в remontas24.ru"

        common.sendMail(masterUser["login"], subject, messageText, messageHTML)

        return True
    except Exception as e:
        print("Error: " + str(e))
        common.writeToLog("error", "sendNotificationAboutSuccesVerifyEmail: " + str(e))

@route('/api/masterResetPassword', method='POST')
def rem_resetMasterPassword():
    result = dict()

    try:
        #найти юзера мастера
        masterUser = conf.db.users_masters.find_one({"login": request.json["email"]})
        master = conf.db.masters.find_one({"_id": masterUser["master_id"]})

        #сгенерировать и установить новый пароль

        newPassword = common.generatePassword(8)

        conf.db.users_masters.update_one({"_id": masterUser["_id"]}, {"$set": {"password": newPassword}})

        #отправить уведомление на email

        siteURL = request.urlparts[0] + "://" + request.urlparts[1]

        messageText = conf.messagePasswordRecoveryEmailText.format(name=master["name"], siteURL=siteURL, password=newPassword)
        messageHTML = conf.messagePasswordRecoveryEmailHTML.format(name=master["name"], siteURL=siteURL, password=newPassword)

        subject = "Восстановление пароля на remontas24.ru"

        common.sendMail(masterUser["login"], subject, messageText, messageHTML)

        #вернуть ответ на клиента, что все ок
        result["status"] = "ok"

        return result

    except Exception as e:
        print("Error: " + str(e))
        result["status"] = "error"
        result["errorType"] = "unknownError"
        result["description"] = "Непредвиденная ошибка: " + str(e)
        common.writeToLog("error", "rem_resetMasterPassword: " + str(e))
        return common.JSONEncoder().encode(result)
