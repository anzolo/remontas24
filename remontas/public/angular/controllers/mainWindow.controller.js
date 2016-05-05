remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', 'AUTH_EVENTS', 'AuthService', '$state', 'Session', '$rootScope', function ($scope, searchMasters, ModalService, AUTH_EVENTS, AuthService, $state, Session, $rootScope) {

    $scope.model = {
        searchBox: {},

    };

    $scope.currentPage = "remontas.searchPage";
    $scope.isAuthOK = false;
    $scope.showMasteramPodmenu = false;

    $scope.isAuth = AuthService.isAuthenticated;

    $scope.setMasteramPodmenuVisible = setMasteramPodmenuVisible;
    $scope.showAuthRegForm = showAuthRegForm;
    $scope.logout = logout;
    $scope.nameOfMasterMenu = nameOfMasterMenu;
    $scope.loadMasters = loadMasters;


    loadMasters(1);

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

    function loadMasters(page) {
        $scope.searchResult = searchMasters.get({
            "page": page
        }, function (data) {
            $scope.model.searchBox.configUrl = JSON.parse(JSON.stringify(data.configUrl));
            $scope.model.searchBox.masters = JSON.parse(JSON.stringify(data.masters));
            $scope.model.searchBox.count_masters = data.count;
            $scope.model.searchBox.max_page = data.max_page;
            $scope.model.searchBox.current_page = data.current_page;
            $scope.model.searchBox.loadMasters = $scope.loadMasters;
        });
    }

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
