import bottle

from bottle import route, template
from pymongo import MongoClient

client = MongoClient()
db = client.remontas24

@route('/static/<filename:path>')
def static(filename):
    '''
    Serve static files
    '''
    return bottle.static_file(filename, root='./static')

@route('/')# Handle HTTP GET for the application root
def index():
    return template('\n<h1>{{message}}</h1>', message='Главная страница нового Remontas24!')

@route('/adminka')# Handle HTTP GET for the application root
def adminka():
    return template('adminka')


# Run bottle internal test server when invoked directly ie: non-uxsgi mode
if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port=8080)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = bottle.default_app()

    #acc1aca627  55