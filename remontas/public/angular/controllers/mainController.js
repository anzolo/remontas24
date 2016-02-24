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
            controller: "authRegFormController"
        });

    };

}]);
