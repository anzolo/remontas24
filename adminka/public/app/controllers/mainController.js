remontas24App.controller('mainController', ['$scope', '$rootScope', 'AuthService', 'USER_ROLES', 'AUTH_EVENTS', 'Session', '$state', function ($scope, $rootScope, AuthService, USER_ROLES, AUTH_EVENTS, Session, $state) {
    //$scope.isAutorized = false;

    $scope.currentUser = Session.username();
    $scope.userRoles = USER_ROLES;
    //    console.log("AuthService", AuthService);
    //$scope.isAuthorizedAdmin = AuthService.isAuthorized();


    $scope.credentials = {
        username: '',
        password: ''
    };

    //console.log($rootScope.$id);

    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                //$scope.currentUser = $scope.credentials.username;
                //$scope.isAuthorizedAdmin = AuthService.isAuthorized();
                //                var currentPageTemplate = $route.current.templateUrl;
                //                $templateCache.remove(currentPageTemplate);
                //                $route.reload();

                $scope.currentUser = Session.username();

            },
            function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            });
    };

    $scope.logout = function () {
        AuthService.logout();
        $state.go('login');
    };

    $scope.$on(AUTH_EVENTS.notAuthenticated, function () {
        AuthService.logout();
        $state.go('login');
    });

    $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        $state.go('adminka.dashboard');
    });
            }]);
