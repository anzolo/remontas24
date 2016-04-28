remontas24Site.controller('authRegFormController', ['$scope', '$rootScope', 'close', 'AuthService', 'AUTH_EVENTS', '$state', '$document', function ($scope, $rootScope, close, AuthService, AUTH_EVENTS, $state, $document) {
    $scope.closeWindow = function () {
        bodyRef.removeClass('ovh');
        close();
    };

    $scope.activeTab = "auth";
    $scope.activeTabProfileKind = "phys";
    $scope.wrongCredentials = false;

    $scope.credentials = {
        username: '',
        password: ''
    };

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');

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
        bodyRef.removeClass('ovh');
        close();
        $state.go('remontas.lk');
    });

}]);
