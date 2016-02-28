remontas24Site.controller('authRegFormController', ['$scope', '$rootScope', 'close', 'AuthService', 'AUTH_EVENTS', '$state', function ($scope, $rootScope, close, AuthService, AUTH_EVENTS, $state) {
    $scope.close = close;

    $scope.activeTab = "auth";
    $scope.activeTabProfileKind = "phys";
    $scope.wrongCredentials = false;

    $scope.credentials = {
        username: '',
        password: ''
    };

    $scope.login = function (credentials) {
        AuthService.login(credentials).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                //$scope.currentUser = Session.username();

            },
            function () {
                //                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $scope.wrongCredentials = true;
            });
    };

    $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        close();
        $state.go('remontas.lk');
    });

}]);