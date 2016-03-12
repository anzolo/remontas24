remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', function ($scope, lkData, masterMainData) {

    $scope.data = lkData.init({}, function (value, responseHeaders) {
        $scope.masterData = value.master;
        $scope.categories = value.categories;
        $scope.countCategories = $scope.calcCategories();
    });


    //$scope.masterData = $scope.data["master"];

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

    $scope.isCheckedCategory = function (element) {
        return $scope.masterData.category_service.indexOf(element._id) >= 0;
    }

    $scope.checkCategory = function (element) {
        var numberPosition = $scope.masterData.category_service.indexOf(element._id)
        if (numberPosition >= 0) {
            $scope.masterData.category_service.splice(numberPosition, 1);
        } else {
            $scope.masterData.category_service.push(element._id);
        }
    }

    $scope.calcCategories = function () {
        var calc = 0;
        // $scope.masterData.categories
        for (var element in $scope.masterData.category_service) {
            //, $scope.categories.indexOf(element._id)
            console.log($scope.masterData.category_service[element], $scope.categories.indexOf("_id" = $scope.masterData.category_service[element]));
        }


    }

}]);
