remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', function ($scope, lkData, masterMainData) {

    $scope.data = lkData.init({}, function (value, responseHeaders) {
        $scope.masterData = value.master;
        $scope.categories = value.categories;
        //        $scope.onlyCategoriesArray = $scope.createCategoriesArray($scope.categories);
        $scope.tempMasterCategories = value.master.categories.slice();
        $scope.tempAdditional_service = value.master.additional_service.slice();
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

    // Функции для меню категорий
    $scope.showCategoriesMenu = function () {
        $scope.interfaceOptions.showAddServices = false
        if (!$scope.interfaceOptions.showCategory) {
            $scope.tempMasterCategories = $scope.masterData.categories.slice()
        }
        return $scope.interfaceOptions.showCategory = !$scope.interfaceOptions.showCategory;
    }

    $scope.selectCategories = function () {
        $scope.masterData.categories = $scope.tempMasterCategories.slice();
        $scope.interfaceOptions.showCategory = false;
    }

    $scope.isCheckedCategory = function (element) {
        return $scope.tempMasterCategories.indexOf(element._id) >= 0;
    }


    $scope.checkCategory = function (element) {
        var numberPosition = $scope.tempMasterCategories.indexOf(element._id)
        if (numberPosition >= 0) {
            $scope.tempMasterCategories.splice(numberPosition, 1);
        } else {
            $scope.tempMasterCategories.push(element._id);
        }
    }

    //    $scope.calcCategories = function (arrayCategories) {
    //        var calc = 0;
    //        for (var element in arrayCategories) {
    //            if ($scope.onlyCategoriesArray.indexOf(arrayCategories[element]) >= 0) {
    //                calc++;
    //            }
    //        }
    //        return calc
    //    }

    //    $scope.createCategoriesArray = function (categories) {
    //        var resultCategoriesArray = [];
    //        for (var element in categories) {
    //            if (categories[element].type == "category") {
    //                resultCategoriesArray.push(categories[element]._id);
    //            }
    //        }
    //        return resultCategoriesArray;
    //    }


    // Функции для меню дополнительных видов работ
    $scope.showAdditionalServiceMenu = function () {
        $scope.interfaceOptions.showCategory = false
        if (!$scope.interfaceOptions.showAddServices) {
            $scope.tempAdditional_service = $scope.masterData.additional_service.slice();
        }
        return $scope.interfaceOptions.showAddServices = !$scope.interfaceOptions.showAddServices;
    }

    $scope.selectAdditionalService = function () {
        $scope.masterData.additional_service = $scope.tempAdditional_service.slice();
        $scope.interfaceOptions.showAddServices = false;
    }

    $scope.isCheckedAdditionalService = function (element) {
        return $scope.tempAdditional_service.indexOf(element) >= 0;
    }

    $scope.checkAdditionalService = function (element) {
        var numberPosition = $scope.tempAdditional_service.indexOf(element)
        if (numberPosition >= 0) {
            $scope.tempAdditional_service.splice(numberPosition, 1);
        } else {
            $scope.tempAdditional_service.push(element);
        }
    }

}]);