remontas24App.factory('AuthService', function ($http, Session, $rootScope, $q) {
    //    console.log("AuthService initialise...");
    return {
        login: function (credentials) {
            return $http
                .post('/api/login/admin', credentials)
                .then(function (res) {

                    Session.create(res.data.token, res.data.username);
                });
        },
        logout: function () {
            Session.destroy();
        },
        isAuthenticated: function () {
            //console.log("isAuthenticated. Session.token = ", Session.token);
            //console.log("isAuthenticated. Session.userRole = ", Session.userRole);
            return !!Session.token();
        },
        isAuthorized: function () {
            //console.log("isAuthorized. !angular.isArray(authorizedRoles) = ", !angular.isArray(authorizedRoles));
            //console.log("isAuthorized. authorizedRoles = ", authorizedRoles);

            //            if (!angular.isArray(authorizedRoles)) {
            //                authorizedRoles = [authorizedRoles];
            //            }

            //            return (this.isAuthenticated() &&
            //                authorizedRoles.indexOf(Session.userRole) !== -1);
            //
            return this.isAuthenticated();
        }
    };
})

remontas24App.service('Session', function ($localStorage) {
    this.create = function (loginToken, username) {
        $localStorage.tokenAdmin = loginToken;
        $localStorage.usernameAdmin = username;
        //console.log("create token: ", loginToken);
    };
    this.destroy = function () {
        $localStorage.tokenAdmin = null;
    };
    this.token = function () {
        //console.log("return token: ", $localStorage.token);
        return $localStorage.tokenAdmin;
    };
    this.username = function () {
        //console.log("return token: ", $localStorage.token);
        return $localStorage.usernameAdmin;
    };

    return this;
})

remontas24App.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS, Session) {
    return {
        responseError: function (response) {
            if (response.status === 401) {

//                console.log("1")
//                console.log(response);

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

            return $q.reject(response);
        },

        request: function (config) {
            config.headers = config.headers || {};
            //console.log("config.headers = ", config.headers);
            //console.log("Session = ", Session);
            //console.log("Session.token = ", Session.token());

            if (!!Session.token()) {
                config.headers.Authorization = 'Bearer ' + Session.token();
            };

            //config.headers.Authorization = 'Bearer ' + Session.token;

            //console.log("config = ", config);

            return config;
        },
        response: function (response) {
            if (response.status === 401) {
                // handle the case where the user is not authenticated


            }

//            console.log("2")
//            console.log(response);
            return response || $q.when(response);
        }
    };
})
