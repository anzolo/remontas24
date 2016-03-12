remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', function ($scope, lkData, masterMainData) {

    $scope.masterData = lkData.get();

    $scope.interfaceOptions = {
        showCategory: false,
        showAddServices: false
    };


    $scope.saveMainData = function () {
        var master = {
            detail: $scope.masterData.detail,
            phone1: $scope.masterData.phone1,
            phone2: $scope.masterData.phone2
        };
        masterMainData.save(master);
    }


}]);
