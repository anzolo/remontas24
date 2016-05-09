remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', 'AUTH_EVENTS', 'AuthService', '$state', 'Session', '$rootScope', function ($scope, searchMasters, ModalService, AUTH_EVENTS, AuthService, $state, Session, $rootScope) {

    $scope.model = {
        searchBox: {},
        categories: [],
        placeholderForServices: ""
    };

    //    console.log(Session.filter())
    if (Session.filter() == undefined) {
        $scope.model.filter = {
            "category": {
                "_id": "all-category",
                "order": -1,
                "parent_id": null,
                "type": "category",
                "val": "Все категории"
            },
            "kindServices": [],
            "addServices": []
        };
    } else $scope.model.filter = JSON.parse(JSON.stringify(Session.filter()));

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
    $scope.closePopup = closePopup;
    $scope.CheckService = CheckService;
    $scope.checkAddService = checkAddService;
    $scope.arrayObjectIndexOf = arrayObjectIndexOf;
    $scope.getFavoritesCount = getFavoritesCount;
    $scope.masterInFavorites = masterInFavorites;
    $scope.showInvoiceForm = showInvoiceForm;

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

        Session.saveFilter($scope.model.filter);

        $scope.searchResult = searchMasters.searchMasters({
            "page": page,
            "filter": $scope.model.filter
        }, function (data) {

            $scope.model.searchBox.configUrl = JSON.parse(JSON.stringify(data.configUrl));
            $scope.model.searchBox.masters = JSON.parse(JSON.stringify(data.masters));
            $scope.model.searchBox.count_masters = data.count;
            $scope.model.searchBox.max_page = data.max_page;
            $scope.model.searchBox.current_page = data.current_page;
            $scope.model.searchBox.loadMasters = $scope.loadMasters;
            $scope.model.searchBox.masterInFavorites = $scope.masterInFavorites;

            $scope.model.additionalServicesDict = JSON.parse(JSON.stringify(data.additionalServicesDict));

            $scope.model.categories = JSON.parse(JSON.stringify(data.categories));

            categoryAll = {
                "_id": "all-category",
                "order": -1,
                "parent_id": null,
                "type": "category",
                "val": "Все категории"
            };

            $scope.model.categories.push(categoryAll);


            if (Session.filter() == undefined) {
                $scope.model.filter = {
                    "category": $scope.model.categories[$scope.model.categories.length - 1],
                    "kindServices": [],
                    "addServices": []
                };
            } else $scope.model.filter = JSON.parse(JSON.stringify(Session.filter()));

            var maxServices = $scope.model.categories.filter(function (el1) {
                return el1.parent_id == $scope.model.filter.category._id
            }).length;

            if ($scope.model.filter.kindServices.length == 0 || $scope.model.filter.kindServices.length == maxServices) {
                $scope.model.placeholderForServices = "Все услуги"
            } else
                $scope.model.placeholderForServices = "Выбрано услуг " + $scope.model.filter.kindServices.length;

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

    function closePopup() {
        $scope.showComboBox = "";
    };

    function checkCategory(element) {
        $scope.showComboBox = "";
        $scope.model.filter.category = JSON.parse(JSON.stringify(element));

        $scope.model.placeholderForServices = "Все услуги";
        $scope.model.filter.kindServices.length = 0;

    };

    function CheckService(element) {

        var indexOfEl = arrayObjectIndexOf($scope.model.filter.kindServices, element._id, "_id")
            //            $scope.model.filter.kindServices.indexOf(JSON.parse(JSON.stringify(element)));

        if (indexOfEl >= 0) {
            $scope.model.filter.kindServices.splice(indexOfEl, 1);
        } else $scope.model.filter.kindServices.push(JSON.parse(JSON.stringify(element)));

        var maxServices = $scope.model.categories.filter(function (el1) {
            return el1.parent_id == element.parent_id
        }).length;

        if ($scope.model.filter.kindServices.length == 0 || $scope.model.filter.kindServices.length == maxServices) {
            $scope.model.placeholderForServices = "Все услуги"
        } else
            $scope.model.placeholderForServices = "Выбрано услуг " + $scope.model.filter.kindServices.length;
    };

    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for (var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) return i;
        }
        return -1;
    }

    function checkAddService(element_id) {

        var indexOfEl = $scope.model.filter.addServices.indexOf(element_id);

        if (indexOfEl >= 0) {
            $scope.model.filter.addServices.splice(indexOfEl, 1);
        } else $scope.model.filter.addServices.push(element_id);

    };

    function getFavoritesCount() {

        var count = Session.countFavorites();

        if (count > 99) count = count.toString() + "+";

        return count;
    };

    function masterInFavorites(master) {
        return Session.masterInFavourites(master._id);
    };

    function showInvoiceForm() {
        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/invoiceForm.html",
            controller: "invoiceFormController"
        });
    }

}]);
