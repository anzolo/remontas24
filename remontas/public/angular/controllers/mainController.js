remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', 'AUTH_EVENTS', 'AuthService', '$state', 'Session', '$rootScope', function ($scope, searchMasters, ModalService, AUTH_EVENTS, AuthService, $state, Session, $rootScope) {

    $scope.currentPage = "remontas.searchPage";
    $scope.isAuthOK = false;

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {

            $scope.currentPage = toState.name;
            //            console.log("$scope.currentPage = ", $scope.currentPage);

        })

    $scope.searchResult = searchMasters.get();

    $scope.showMasteramPodmenu = false;
    $scope.lkButtonName = "Мастерам";
    //$scope.currentPage = "main";

    $scope.setMasteramPodmenuVisible = function (value) {
        $scope.showMasteramPodmenu = value;
    };

    $scope.showAuthRegForm = function () {
        if (AuthService.isAuthenticated()) {
            //            console.log("Session.token = ", Session.token());
            $state.go('remontas.lk');
        } else {
            ModalService.showModal({
                templateUrl: "/remontas/public/templates/modals/authRegForm.html",
                controller: "authRegFormController"
            });
        }

    };

    $scope.$on(AUTH_EVENTS.notAuthenticated, function () {
        AuthService.logout();
        $state.go('remontas.searchPage');
    });

    $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        $scope.lkButtonName = "Личный кабинет";
        $scope.currentPage = "lk";
        $scope.isAuthOK = true;
    });

    $scope.logout = function () {
        AuthService.logout();
        $scope.lkButtonName = "Мастерам";
        $scope.isAuthOK = false;
        $state.go('remontas.searchPage');
    };
}]);