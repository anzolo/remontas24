import bottle

from bottle import route, template

@route('/')# Handle HTTP GET for the application root
def index():
    return template('\n<h1>{{message}}</h1>', message='Hello Runabove')

# Run bottle internal test server when invoked directly ie: non-uxsgi mode
if __name__ == '__main__':
    bottle.run(host='0.0.0.0', port=8080)
# Run bottle in application mode. Required in order to get the application working with uWSGI!
else:
    app = application = bottle.default_app()