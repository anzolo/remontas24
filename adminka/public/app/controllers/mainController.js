remontas24App.controller('mainController', ['$scope', '$rootScope', 'AuthService', 'USER_ROLES', 'AUTH_EVENTS', 'Session', '$route', '$templateCache', function ($scope, $rootScope, AuthService, USER_ROLES, AUTH_EVENTS, Session, $route, $templateCache) {
    //$scope.isAutorized = false;

    $scope.currentUser = Session.username();
    $scope.userRoles = USER_ROLES;
    //    console.log("AuthService", AuthService);
    $scope.isAuthorizedAdmin = AuthService.isAuthorized();


    $scope.credentials = {
        username: '',
        password: ''
    };

    //console.log($rootScope.$id);

    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                //$scope.currentUser = $scope.credentials.username;
                $scope.isAuthorizedAdmin = AuthService.isAuthorized();
                var currentPageTemplate = $route.current.templateUrl;
                $templateCache.remove(currentPageTemplate);
                $route.reload();

                $scope.currentUser = Session.username();

            },
            function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
    };

    $scope.logout = function () {
        AuthService.logout();
        $scope.isAuthorizedAdmin = AuthService.isAuthorized();
    };

    $scope.$on(AUTH_EVENTS.notAuthenticated, function () {
        Session.destroy();
        $scope.isAuthorizedAdmin = AuthService.isAuthorized();
    });
            }]);
