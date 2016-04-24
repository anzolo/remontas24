from bottle import route, template, request, abort, static_file, Response
from bson.objectid import ObjectId

import adminka
import common
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
        #newMaster["jobs_count"] = str(len(master["works"])) + " работ"
        newMaster["avatar"] = conf.img_url_path + master.get("avatar", conf.img_no_avatar)
        newMaster["_id"] = str(master["_id"])
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
            print(e)

        return result

    else:
        return abort(401, "Sorry, access denied.")

# @route('/api/lk/mainDataSave', method='POST')
# def rem_mainDataSave():
#     print("Hello")
#     result_check_rights = adminka.check_rights("master", request)
#     if result_check_rights["status"]:
#         try:
#             conf.db.masters.update(
#                 {"_id": ObjectId(result_check_rights["master_id"])},
#                 {
#                  "$set":{"phone1": request.json["phone1"],
#                  "phone2": request.json["phone2"],
#                  "detail": request.json["detail"]}
#                 }
#                 )
#             Response.status = 200
#             return None
#         except Exception as e:
#             abort(500, str(e))
#             print(e)

def calcScoreMaster(master_id):
    master = conf.db.masters.find_one({"_id": ObjectId(master_id)})

    score = 0
    reset_to_register = False

    scoreDecription = {"master_id":ObjectId(master_id),"details":[]}
    scoreMainCriteria = []

    if master != None:

        del master["_id"]

        if (master["status"]!="closed") and (master["status"]!="new"):

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
            if (allServicesCount>0) and ((serviceWithPriceCount/allServicesCount)<0.5):
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


            if reset_to_register:
                master["status"] = "register"
            else:
                master["status"] = "active"

            master["score"] = score

            conf.db.masters.update_one({"_id": ObjectId(master_id)}, {"$set": master})

            conf.db.scoreMasters.replace_one({"master_id":ObjectId(master_id)},scoreDecription,True)


# API ремонтаса. получение данных по мастеру
@route('/api/master')
def rem_masterGetData():
    print("ID -> "+request.params.id)
    result = {"back": request.params.id}
    result["status"] = "OK"
    return result
