remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', 'AUTH_EVENTS', 'AuthService', '$state', 'Session', '$rootScope', function ($scope, searchMasters, ModalService, AUTH_EVENTS, AuthService, $state, Session, $rootScope) {

    $scope.model = {
        searchBox: {},
        categories: [],
        filter: {
            "check": false
        }
    };

    $scope.showComboBox = "";
    $scope.countCheckedServices = "";
    $scope.currentPage = "remontas.searchPage";
    $scope.isAuthOK = false;
    $scope.showMasteramPodmenu = false;

    $scope.isAuth = AuthService.isAuthenticated;

    $scope.setMasteramPodmenuVisible = setMasteramPodmenuVisible;
    $scope.showAuthRegForm = showAuthRegForm;
    $scope.logout = logout;
    $scope.nameOfMasterMenu = nameOfMasterMenu;
    $scope.loadMasters = loadMasters;
    $scope.showFiltersMenu = showFiltersMenu;
    $scope.checkCategory = checkCategory;
    $scope.selectServices = selectServices;
    $scope.CheckService = CheckService;

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
            $scope.model.categories = JSON.parse(JSON.stringify(data.categories));
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

    function compareOrder(a, b) {
        if (a.order < b.order) return -1;
        else if (a.order > b.order) return 1;
        else return 0;
    };

    function showFiltersMenu(menu) {
        if ($scope.showComboBox == "") $scope.showComboBox = menu;
    };

    function selectServices() {
        $scope.showComboBox = "";
    };

    function checkCategory(element) {
        $scope.showComboBox = ""
        $scope.countCheckedServices = "";
        var newCategory = {
            "check": true,
            "_id": element._id,
            "name": element.val,
            "kind_services": []
        };

        var kind_services = $scope.model.categories.filter(function (el1) {
            return el1.parent_id == element._id
        }).sort(compareOrder);

        kind_services.forEach(function (kser, i, arr) {
            var newKindService = {
                "_id": kser._id,
                "name": kser.val,
                "order": kser.order,
                "check": false
            };
            newCategory["kind_services"].push(newKindService)
        });

        $scope.model.filter = newCategory;
    };

    function CheckService(element) {
        element['check'] = !element['check'];
        var count = 0;
        $scope.model.filter["kind_services"].forEach(function (kser, i, arr) {
            if (kser["check"]) count++;
        });
        $scope.countCheckedServices = "Выбрано услуг " + count;
    };

}]);