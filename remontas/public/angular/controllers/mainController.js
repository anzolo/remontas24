remontas24Site.controller('mainController', ['$scope', 'searchMasters', 'ModalService', function ($scope, searchMasters, ModalService) {
    $scope.searchResult = searchMasters.get();

    $scope.showMasteramPodmenu = false;

    $scope.setMasteramPodmenuVisible = function (value) {
        $scope.showMasteramPodmenu = value;
    };

    $scope.showAuthRegForm = function () {
        //console.log("show auth modal");
        // Just provide a template url, a controller and call 'showModal'.
        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/authRegForm.html",
            //            templateUrl: "/remontas/public/templates/modals/test.html",
            controller: "authRegFormController"
        }).then(function (modal) {
            // The modal object has the element built, if this is a bootstrap modal
            // you can call 'modal' to show it, if it's a custom modal just show or hide
            // it as you need to.
            //modal.element.show();
            modal.close.then(function (result) {
                //$scope.message = result ? "You said Yes" : "You said No";
                console.log(result)
            });
        });

    };

}]);
