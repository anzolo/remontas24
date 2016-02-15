import bottle
import jwt, Crypto.PublicKey.RSA as RSA, datetime
from bson.json_util import dumps

from bottle import route, template, request, abort
from pymongo import MongoClient
import os, uuid
from bson.objectid import ObjectId


client = MongoClient()
db = client.remontas24

session_priv_key = b'-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA9C/3dZkVFiGIUg4mvqt3pZSpGzVv2xtSwu7O17p5tx0tOxga\n+inyb/1FU1GRT9cAQupIvssEsK9m+5MchnU35SyTotSado/9dgJNTeZeCQ0pTuK8\nl4fsPfLZH2kcrmDcQx4jzDKJc0dhSxMGXrysg9t9VRowEF+73+DKQJbu2KqIOG5m\n69HDdQWTucTUCXrqpy1sn8MBYW4PjLgExpEQdwZCNjLwxYVTL5dt/rZkSs6l8ENM\njaHAZF5FOXGQJeuC2InlqJbPVLPKnuKkFrXJ+uzeNuhbdkNMLKqtCleFLYYV8Zez\nQz6Dt3y/eT9qogiDcdeIN7sVKD82zsAkv4eKDQIDAQABAoIBAQChntHqCw1y3XTt\n4qHwV2tUs+WNtbu4SQhpL0jGbo07DtuuHlFUvMjTKM5mzDkioApzP8AwUA1lqGLA\nJmmd8R2y2ONKxe8KhFldbz6dTdl1ojlyFg5/OR67De55pMev/zoqTluhPt3M6DTU\nTN5NfBGvIGp/Flszqzmdf5o+T+f8jO+sq0q7kN5luUcqCpESZP6eSiZXGuUto+lR\nPBmG9AoLmG0kq8Dt9yXwUpJBi4QqPHK55AlOnXSM7f2ddofQAUgWCJv1KAKdKTxv\niGOM7O5VCNMeeAJtUXm2Fxs5EEHu7RroYhCc2GQoLDzcG6JUGkb7p4J0ExYdVkD4\nDn6ltyR9AoGBAPjVojo4487CVHUeLT3YWYB7eiB1+Hv0KXG6bzYAQA8dVk7lScvM\nTkzhR4fupANd4iG20nxXZ3Cy1N4HG0SZB8ded3l2snnRQJ4T5/klN0UMtjg9DHp3\n2P8pZKGs0QqloW8fV0maxNMb1lMsEK6NVUVTs9EBJfBqOCMfbD24+eLrAoGBAPs4\nEzSkvnuAjveBv/7J7SMSGZg6tcNZxid2CCHDw3a28CComXYfyEpu0N872KxN1TRv\nyo9cDzK1L8yytIDH6xRX7R+oExbJ6WZvOWumstSv2UsrhviZTp8YyVs7jtRiQex+\nkihnLazl/HPdkNrCerib3g0D5q/Tg4NtOzqfYVjnAoGAPExAgI1SnsK2hp7mZass\nnRbO1Fjh+t+Cv31m/5X17/Oy+3FSfaEnhDe/BrCMbAhvCK5tuRXRCh07ugXM1MWk\nfeplVzitLRnI58V5HAWprADVkzEv+ela2xIjwY3IJiVWxj+4/iwT7/g56nOuIy46\ncI9E7quxjt2edtxhdV+CpjsCgYAs4ibkR+7UZ/KjG+ZuoishEfHKteqVnWt+z2LC\njZRVmHesjhLk/OavDb95stqSZlGKTdLV7C+28pI4s1D2lUFV4CO4fTHz510w9PxA\nVIcs4sIi4QL7VYCrgiUvjKOHJIr8stxwJYcOlgSVuudPfmGorAhvMNw9W7/qclCb\nt7APzwKBgECNnyuFBTD1EPyxfWoAVy67+EGoW0lez4CSLN904VoCdw2BBgrKHG8q\n7NRxBFdFFP+wEVsXF6lLyJsGLsSkTIeOlAXZXWzpkwFISLBkFB3NQt18+vZaBE9x\ngorRlIpLQGAomPPz6n/9OhekKSGq6zUM+MSSAA9we0xnv5Oqq+hv\n-----END RSA PRIVATE KEY-----'
session_pub_key = b'-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9C/3dZkVFiGIUg4mvqt3\npZSpGzVv2xtSwu7O17p5tx0tOxga+inyb/1FU1GRT9cAQupIvssEsK9m+5MchnU3\n5SyTotSado/9dgJNTeZeCQ0pTuK8l4fsPfLZH2kcrmDcQx4jzDKJc0dhSxMGXrys\ng9t9VRowEF+73+DKQJbu2KqIOG5m69HDdQWTucTUCXrqpy1sn8MBYW4PjLgExpEQ\ndwZCNjLwxYVTL5dt/rZkSs6l8ENMjaHAZF5FOXGQJeuC2InlqJbPVLPKnuKkFrXJ\n+uzeNuhbdkNMLKqtCleFLYYV8ZezQz6Dt3y/eT9qogiDcdeIN7sVKD82zsAkv4eK\nDQIDAQAB\n-----END PUBLIC KEY-----'

img_path = "/storage/"
storage_path = "storage"
session_time_out_minutes = 5

#  хранилище фото
@route('/storage/<filename:path>')
def storage(filename):
    return bottle.static_file(filename, root='./storage')

#    Админка
@route('/adminka')
@route('/adminka/login')
@route('/adminka/masters')
def adm_adminka():
    return template('adminka')

@route('/adminka/<access>/<filename:path>')
def adm_static(access, filename):
    if access=="public":
        return bottle.static_file(filename, root='./adminka/public')
    elif access=="restricted":

        if check_rights("admin",request):
            return bottle.static_file(filename, root='./adminka/restricted')
        else:
            return abort(401,"Sorry, access denied.")
            #return bottle.static_file(filename, root='./adminka/restricted')

#    Сайт
@route('/')
def index():
    return template('remontas')

@route('/remontas/<access>/<filename:path>')
def static(access, filename):
    if access=="public":
        return bottle.static_file(filename, root='./remontas/public')
    elif access=="restricted":
        if check_rights("master",request):
            return bottle.static_file(filename, root='./remontas/restricted')
        else:
            return abort(401,"Sorry, access denied.")

#       API
@route('/api/login/<role>', method='POST')
def do_login(role):
    result = {"status":"forbidden",
            "user_id": None,
             "role":None
             }
    if role == "admin":
        result = check_login_admin(request.json["username"], request.json["password"], result)
    else:
        result = check_login_master(request.json["username"], request.json["password"], result)

    if result["status"] == "success":
        result = create_session(result)

    del result["user_id"]

    return result

def check_login_admin(username, password, result):

    users = db.users_adminka
    user = users.find_one({"username":username, "password":password})
    if user != None:
        result["status"] = "success"
        result["user_id"] = str(user["_id"])
        result["username"] = username
        result["role"] = "admin"
    return result

def check_login_master(username, password, result):
    pass
#    return result

def create_session(result):

    priv_key = RSA.importKey(session_priv_key)

    payload = { 'user_id': result["user_id"], 'role': result["role"] }
    result["token"] = jwt.generate_jwt(payload, priv_key, 'PS256', datetime.timedelta(minutes=session_time_out_minutes))
    return result

def check_rights(role,rq):
    result = False
    #print(rq.get_header("Authorization"))
    if rq.get_header("Authorization")!= None:
        bearer = rq.get_header("Authorization").split()

        try:
            header, claims = jwt.verify_jwt(bearer[1], session_pub_key, ['PS256'])
            #print(header)
            #print(claims)

            if claims["role"]==role:
                result = True
            else:
                print("Попытка запросить ресурс по токену с недостаточными правами.")

        except Exception as e:
            print(e)

    return result

@route('/api/adminka/masters')
def adm_getMastersList():
    if check_rights("admin",request):

        masters_list = []
        result = {}

        for master in db.masters.find():
            new_master={}
            new_master["name"]= master["name"]
            new_master["id"]=str(master["_id"])
            new_master["avatar"]="/storage/" + master["avatar"]
            new_master["jobs_count"]=master["jobs_count"]
            masters_list.append(new_master)

        result["masters"]=masters_list

        return result
    else:
        return abort(401,"Sorry, access denied.")

#Админка. получить одного мастера для отображения
@route('/api/adminka/masters/<id>')
def adm_getMaster(id):
    if check_rights("admin",request):
        masters = db.masters

        editMaster = {}

        try:
            master = masters.find_one({"_id":ObjectId(id)})
            if master != None:
                editMaster['name'] = master["name"]
                editMaster['jobs_count'] = master["jobs_count"]
                editMaster['avatar'] = request.urlparts.scheme +"://"+request.urlparts.netloc + img_path + master["avatar"]
                editMaster["id"]=str(master["_id"])
                editMaster["status"]="OK"
            else:
                editMaster["status"] = "Error"
                editMaster["note"] = "id not found"
        except Exception as e:
                editMaster["status"] = "Error"
                editMaster["note"] = str(e)
                print(e)

        print(request.url)
        print(request.urlparts)

        return editMaster
    else:
        return abort(401,"Sorry, access denied.")

#Админка. Пересохранить мастера при редактировании
@route('/api/adminka/masters/<id>', method='POST')
def adm_saveAfterEdit(id):
    if check_rights("admin",request):
        result = {}
        newMaster = {}
        oldAvatarFileName =""

        #print(request.forms.get('name'))
        #print(request.forms.get('works'))

        try:
            oldMaster = db.masters.find_one({"_id":ObjectId(id)})
            if oldMaster != None:
                oldAvatarFileName = storage_path +"/" + oldMaster["avatar"]
                upload = request.files.get('avatar')
                filename, ext = os.path.splitext(upload.raw_filename)

                new_filename =  str(uuid.uuid4())
                upload.filename = new_filename + ext

                resultQuery = db.masters.update_one({"_id":ObjectId(id)},
                                          {"$set": {"name": request.forms.get('name'),
                                                    "jobs_count": request.forms.get('jobs_count'),
                                                    "avatar": upload.filename}
                                           })

                #print("resultQuery.result.matched_count = ",resultQuery.result.matched_count)
                #print("resultQuery.result.modified_count = ",resultQuery.result.modified_count)
                #print("----------",oldAvatarFileName)

                if os.path.isfile(oldAvatarFileName):
                    os.remove(oldAvatarFileName)
                else:    ## Show an error ##
                    print("Error: %s file not found" % oldAvatarFileName)

                upload.save(storage_path)

                result["status"]="OK"

            else:
                result["status"] = "Error"
                result["note"] = "id not found"
        except Exception as e:
                result["status"] = "Error"
                result["note"] = str(e)
                print(e)

        return result
    else:
        return abort(401,"Sorry, access denied.")


#создание нового мастера в админке
@route('/api/adminka/masters', method='POST')
def adm_createNewMaster():
    if check_rights("admin",request):

        result = {}
        newMaster = {}

        #print(request.forms.get('name'))
        #print(request.forms.get('works'))

        upload = request.files.get('avatar')
        filename, ext = os.path.splitext(upload.raw_filename)

        new_filename =  str(uuid.uuid4())

        upload.filename = new_filename + ext

        #print(upload.filename)

        newMaster['name'] = request.forms.get('name')
        newMaster['jobs_count'] = request.forms.get('jobs_count')
        newMaster['avatar'] = upload.filename

        try:
            db.masters.insert_one(newMaster)
            upload.save(storage_path)

            result["status"]="OK"
        except Exception as e:
            #print(e)
            result["status"]="Error"
            result["note"] = str(e)

        return result
    else:
        return abort(401,"Sorry, access denied.")

@route('/api/main/searchMasters')
def rem_doSearchMasters():
    result = {'filter':{'first_job': None, 'second_job':None, 'extra_jobs':{}}, 'masters_count':80, 'current_page':3, 'max_page':6, 'masters':[]}

    #perfect_master = {'name':"Петр", 'foto':img_path + "img-user-1.png", 'jobs_count':"5 работ", 'guid':"id", 'link':"src"}

    #for master in range(15):
    #    result["masters"].append(perfect_master)
    for master in db.masters.find():
        newMaster = {}
        newMaster['name'] = master["name"]
        newMaster['jobs_count'] = str(master["jobs_count"]) + " работ"
        newMaster['avatar'] = request.urlparts.scheme +"://"+request.urlparts.netloc + img_path + master["avatar"]
        newMaster["id"]=str(master["_id"])
        result["masters"].append(newMaster)

    return result


# Run bottle internal test server when invoked directly ie: non-uxsgi mode
if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port=8080)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = bottle.default_app()

    #acc1aca627  55
