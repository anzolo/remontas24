from bottle import route, static_file
import json
from bson import ObjectId

#  хранилище фото
@route('/storage/<filename:path>')
def storage(filename):
    return static_file(filename, root='./storage')

class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)
