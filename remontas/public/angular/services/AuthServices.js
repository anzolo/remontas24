remontas24Site.factory('AuthService', function ($http, Session, $rootScope, $q, AUTH_EVENTS) {
    return {
        login: function (credentials) {
            return $http
                .post('/api/login/master', credentials)
                .then(function (res) {
                    if (res.data.status == "success") {
                        Session.create(res.data.token, res.data.username);
                        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                    } else $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                });
        },
        logout: function () {
            Session.destroy();
        },
        isAuthenticated: function () {
            return !!Session.token();
        }
    };
})

remontas24Site.service('Session', function ($localStorage) {
    this.create = function (loginToken, username) {
        $localStorage.token = loginToken;
        $localStorage.username = username;
        //console.log("create token: ", loginToken);
    };
    this.destroy = function () {
        $localStorage.token = null;
        $localStorage.username = null;
    };
    this.token = function () {
        return $localStorage.token;
    };
    this.username = function () {
        return $localStorage.username;
    };
    this.saveFilter = function (newFilter) {
        return $localStorage.filter = JSON.parse(JSON.stringify(newFilter));
    };
    this.filter = function () {
        return $localStorage.filter;
    };

    return this;
})

remontas24Site.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, Session) {
    return {
        responseError: function (response) {
            if (response.status === 401) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, response);
                return {
                    transformRequest: [],
                    transformResponse: [],
                    method: 'GET',
                    url: '',
                    headers: {
                        Accept: 'application/json, text/plain, */*'
                    }
                }
            }
            if (response.status === 403) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthorized,
                    response);
            }
            if (response.status === 419 || response.status === 440) {
                $rootScope.$broadcast(AUTH_EVENTS.sessionTimeout,
                    response);
            }
            //console.log(response);
            return $q.reject(response);
        },

        request: function (config) {
            config.headers = config.headers || {};


            if (!!Session.token()) {
                config.headers.Authorization = 'Bearer ' + Session.token();
            };
            return config;
        },

        response: function (response) {
            if (response.status === 401) {
                // handle the case where the user is not authenticated

            }
            return response || $q.when(response);
        }
    };
})
