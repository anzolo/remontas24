remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', 'AUTH_EVENTS', 'AuthService', '$state', 'Session', '$rootScope', function ($scope, searchMasters, ModalService, AUTH_EVENTS, AuthService, $state, Session, $rootScope) {

    $scope.currentPage = "remontas.searchPage";
    $scope.isAuthOK = false;
    $scope.showMasteramPodmenu = false;
    //    $scope.lkButtonName = "Мастерам";


    $scope.isAuth = AuthService.isAuthenticated;

    $scope.searchResult = searchMasters.get();

    $scope.setMasteramPodmenuVisible = setMasteramPodmenuVisible;
    $scope.showAuthRegForm = showAuthRegForm;
    $scope.logout = logout;
    $scope.nameOfMasterMenu = nameOfMasterMenu;


    ////////////////////////////////////////////////////////////////////////////////////////

    $rootScope.$on('$stateChangeSuccess',
        function (event, toState, toParams, fromState, fromParams) {

            $scope.currentPage = toState.name;

        })

    $scope.$on(AUTH_EVENTS.notAuthenticated, function () {
        AuthService.logout();
        $state.go('remontas.searchPage');
    });

    $scope.$on(AUTH_EVENTS.loginSuccess, function () {

        $scope.currentPage = "lk";
        $scope.isAuthOK = true;
    });

    function nameOfMasterMenu() {
        if (AuthService.isAuthenticated()) {
            return "Личный кабинет";
        } else {
            return "Мастерам";
        }
    }


    function setMasteramPodmenuVisible(value) {
        $scope.showMasteramPodmenu = value;
    };

    function showAuthRegForm() {
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

    function logout() {
        AuthService.logout();
        $scope.isAuthOK = false;
        $state.go('remontas.searchPage');
    };
}]);
