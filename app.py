import bottle
import jwt, Crypto.PublicKey.RSA as RSA, datetime

from bottle import route, template, request, abort
from pymongo import MongoClient


client = MongoClient()
db = client.remontas24

session_priv_key = b'-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA9C/3dZkVFiGIUg4mvqt3pZSpGzVv2xtSwu7O17p5tx0tOxga\n+inyb/1FU1GRT9cAQupIvssEsK9m+5MchnU35SyTotSado/9dgJNTeZeCQ0pTuK8\nl4fsPfLZH2kcrmDcQx4jzDKJc0dhSxMGXrysg9t9VRowEF+73+DKQJbu2KqIOG5m\n69HDdQWTucTUCXrqpy1sn8MBYW4PjLgExpEQdwZCNjLwxYVTL5dt/rZkSs6l8ENM\njaHAZF5FOXGQJeuC2InlqJbPVLPKnuKkFrXJ+uzeNuhbdkNMLKqtCleFLYYV8Zez\nQz6Dt3y/eT9qogiDcdeIN7sVKD82zsAkv4eKDQIDAQABAoIBAQChntHqCw1y3XTt\n4qHwV2tUs+WNtbu4SQhpL0jGbo07DtuuHlFUvMjTKM5mzDkioApzP8AwUA1lqGLA\nJmmd8R2y2ONKxe8KhFldbz6dTdl1ojlyFg5/OR67De55pMev/zoqTluhPt3M6DTU\nTN5NfBGvIGp/Flszqzmdf5o+T+f8jO+sq0q7kN5luUcqCpESZP6eSiZXGuUto+lR\nPBmG9AoLmG0kq8Dt9yXwUpJBi4QqPHK55AlOnXSM7f2ddofQAUgWCJv1KAKdKTxv\niGOM7O5VCNMeeAJtUXm2Fxs5EEHu7RroYhCc2GQoLDzcG6JUGkb7p4J0ExYdVkD4\nDn6ltyR9AoGBAPjVojo4487CVHUeLT3YWYB7eiB1+Hv0KXG6bzYAQA8dVk7lScvM\nTkzhR4fupANd4iG20nxXZ3Cy1N4HG0SZB8ded3l2snnRQJ4T5/klN0UMtjg9DHp3\n2P8pZKGs0QqloW8fV0maxNMb1lMsEK6NVUVTs9EBJfBqOCMfbD24+eLrAoGBAPs4\nEzSkvnuAjveBv/7J7SMSGZg6tcNZxid2CCHDw3a28CComXYfyEpu0N872KxN1TRv\nyo9cDzK1L8yytIDH6xRX7R+oExbJ6WZvOWumstSv2UsrhviZTp8YyVs7jtRiQex+\nkihnLazl/HPdkNrCerib3g0D5q/Tg4NtOzqfYVjnAoGAPExAgI1SnsK2hp7mZass\nnRbO1Fjh+t+Cv31m/5X17/Oy+3FSfaEnhDe/BrCMbAhvCK5tuRXRCh07ugXM1MWk\nfeplVzitLRnI58V5HAWprADVkzEv+ela2xIjwY3IJiVWxj+4/iwT7/g56nOuIy46\ncI9E7quxjt2edtxhdV+CpjsCgYAs4ibkR+7UZ/KjG+ZuoishEfHKteqVnWt+z2LC\njZRVmHesjhLk/OavDb95stqSZlGKTdLV7C+28pI4s1D2lUFV4CO4fTHz510w9PxA\nVIcs4sIi4QL7VYCrgiUvjKOHJIr8stxwJYcOlgSVuudPfmGorAhvMNw9W7/qclCb\nt7APzwKBgECNnyuFBTD1EPyxfWoAVy67+EGoW0lez4CSLN904VoCdw2BBgrKHG8q\n7NRxBFdFFP+wEVsXF6lLyJsGLsSkTIeOlAXZXWzpkwFISLBkFB3NQt18+vZaBE9x\ngorRlIpLQGAomPPz6n/9OhekKSGq6zUM+MSSAA9we0xnv5Oqq+hv\n-----END RSA PRIVATE KEY-----'
session_pub_key = b'-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA9C/3dZkVFiGIUg4mvqt3\npZSpGzVv2xtSwu7O17p5tx0tOxga+inyb/1FU1GRT9cAQupIvssEsK9m+5MchnU3\n5SyTotSado/9dgJNTeZeCQ0pTuK8l4fsPfLZH2kcrmDcQx4jzDKJc0dhSxMGXrys\ng9t9VRowEF+73+DKQJbu2KqIOG5m69HDdQWTucTUCXrqpy1sn8MBYW4PjLgExpEQ\ndwZCNjLwxYVTL5dt/rZkSs6l8ENMjaHAZF5FOXGQJeuC2InlqJbPVLPKnuKkFrXJ\n+uzeNuhbdkNMLKqtCleFLYYV8ZezQz6Dt3y/eT9qogiDcdeIN7sVKD82zsAkv4eK\nDQIDAQAB\n-----END PUBLIC KEY-----'

@route('/adminka/<access>/<filename:path>')
def static(access, filename):
    if access=="public":
        #print("Authorization = ",request.get_header("Authorization"))
        return bottle.static_file(filename, root='./adminka/public')
    elif access=="restricted":
        #print("Authorization(restricted) = ",request.get_header("Authorization"))
        if request.get_header("Authorization")!= None:

            bearer = request.get_header("Authorization").split()

            #print(bearer[1])

            print(check_token(bearer[1]))

            if check_token(bearer[1]):
                return bottle.static_file(filename, root='./adminka/restricted')
            else:
                return "Sorry, access denied."
        else:
            return "Sorry, access denied."

def check_token(token):
    check_status = False

    try:
        header, claims = jwt.verify_jwt(token, session_pub_key, ['PS256'])
        print(header)
        print(claims)
        check_status = True
    except Exception as e:
        print(e)

    return check_status



@route('/')
def index():
    return template('\n<h1>{{message}}</h1>', message='Главная страница нового Remontas24!')

@route('/adminka')
def adminka():
    return template('adminka')

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

    users = db.users
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
    '''
    key = RSA.generate(2048)
    priv_pem = key.exportKey()
    pub_pem = key.publickey().exportKey()
    priv_key = RSA.importKey(priv_pem)
    pub_key = RSA.importKey(pub_pem)

    print(priv_pem)
    print(pub_pem)
    '''

    priv_key = RSA.importKey(session_priv_key)

    payload = { 'user_id': result["user_id"], 'role': result["role"] }
    result["token"] = jwt.generate_jwt(payload, priv_key, 'PS256', datetime.timedelta(seconds=5))
    return result


# Run bottle internal test server when invoked directly ie: non-uxsgi mode
if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port=8080)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = bottle.default_app()

    #acc1aca627  55