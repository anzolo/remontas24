from bottle import route, static_file


#  хранилище фото
@route('/storage/<filename:path>')
def storage(filename):
    return static_file(filename, root='./storage')
