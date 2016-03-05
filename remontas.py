from bottle import route, template, request, abort, static_file, Response
from bson.objectid import ObjectId

import adminka
import conf


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
    result = {'filter': {'first_job': None, 'second_job': None, 'extra_jobs': {}}, 'masters_count': 80, 'current_page': 3, 'max_page': 6, 'masters': []}

    # perfect_master = {'name':"Петр", 'foto':img_path + "img-user-1.png", 'jobs_count':"5 работ", 'guid':"id", 'link':"src"}

    # for master in range(15):
    #    result["masters"].append(perfect_master)
    for master in conf.db.masters.find():
        newMaster = {}
        newMaster['name'] = master["name"]
        newMaster['jobs_count'] = str(master["jobs_count"]) + " работ"
        newMaster['avatar'] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)
        newMaster["id"] = str(master["_id"])
        result["masters"].append(newMaster)

    return result


# API ремонтаса. получение данных для личного кабинета
@route('/api/lk/initData')
def rem_lkGetData():
    result_check_rights = adminka.check_rights("master", request)
    if result_check_rights["status"]:
        user = conf.db.users_masters.find_one({"_id": ObjectId(result_check_rights["user_id"])})

        try:
            master = conf.db.masters.find_one({"_id": ObjectId(user["master_id"])})
            if master != None:
                master["_id"] = str(master["_id"])
                master["avatar"] = request.urlparts.scheme + "://" + request.urlparts.netloc + conf.img_path + master.get("avatar", conf.img_no_avatar)
                master["status"] = "OK"
            else:
                master["status"] = "Error"
                master["note"] = "id not found"
        except Exception as e:
                master["status"] = "Error"
                master["note"] = str(e)
                print(e)
        return master
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
                {"phone1": request.json["phone1"],
                 "phone2": request.json["phone2"],
                 "detail": request.json["detail"]}
            )
            Response.status = 200
            return None
        except Exception as e:
            abort(500, str(e))
            print(e)
