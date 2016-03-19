remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', function ($scope, lkData, masterMainData) {

    $scope.data = lkData.init({}, function (value, responseHeaders) {
        $scope.categories = value.categories;
        $scope.masterData = replaceMasterCategories(value.master);
        $scope.tempMasterCategories = value.master.categories.slice();
        $scope.tempMasterCategoriesSelect = [];
        $scope.tempAdditional_service = value.master.additional_service.slice();
    });


    //$scope.masterData = $scope.data["master"];

    $scope.interfaceOptions = {
        showCategory: false,
        showAddServices: false
    };

    $scope.checkKind_services = {
        isCheckKind_services: false,
        checkKind_services: null
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
            $scope.tempMasterCategories = $scope.masterData.categories.slice();
            $scope.tempMasterCategoriesSelect = $scope.masterData.categories.slice();
        }
        return $scope.interfaceOptions.showCategory = !$scope.interfaceOptions.showCategory;
    }

    $scope.selectCategories = function () {
        $scope.masterData.categories = $scope.tempMasterCategoriesSelect.slice();
        $scope.interfaceOptions.showCategory = false;
    }

    function replaceMasterCategories(master) {
        var categories = $scope.categories.filter(function (el) {
            return el.type == "category"
        });
        console.log(categories);
        return master;
    }

    // Поиск категории в масстиве мастера по её ID
    function findOfMasterCategoriesById(id) {
        return function (element) {
            return element._id == id;
        }
    }

    // Поиск видов работ по ID категории
    function findByParentId(id) {
        return function (element) {
            return element.parent_id == id;
        }
    }

    $scope.isCheckedCategory = function (element) {
        return $scope.tempMasterCategoriesSelect.findIndex(findOfMasterCategoriesById(element._id)) >= 0;
    }

    $scope.checkCategory = function (element) {
        var category = $scope.tempMasterCategoriesSelect.find(findOfMasterCategoriesById(element._id));
        if (category == undefined) {
            var tempCategory = $scope.tempMasterCategories.find(findOfMasterCategoriesById(element._id));
            if (tempCategory == undefined) {
                var newKind_services = [];
                var tempNewKind_services = $scope.categories.filter(findByParentId(element._id));
                for (var i = 0; i < tempNewKind_services.length; i++) {
                    var kind_service = {
                        "_id": tempNewKind_services[i]._id,
                        "name": tempNewKind_services[i].val,
                        "order": tempNewKind_services[i].order,
                        "services": []
                    };
                    newKind_services.push(kind_service);
                }
                var newCategory = {
                    "_id": element._id,
                    "name": element.val,
                    "order": element.order,
                    "kind_services": newKind_services
                };
                $scope.tempMasterCategoriesSelect.push(newCategory);
            } else {
                $scope.tempMasterCategoriesSelect.push(tempCategory);
            }
        } else {
            $scope.tempMasterCategoriesSelect.splice($scope.tempMasterCategoriesSelect.indexOf(category), 1);
        }
    }


    // Функции для меню дополнительных видов работ
    $scope.showAdditionalServiceMenu = function () {
        $scope.interfaceOptions.showCategory = false;
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
        var numberPosition = $scope.tempAdditional_service.indexOf(element);
        if (numberPosition >= 0) {
            $scope.tempAdditional_service.splice(numberPosition, 1);
        } else {
            $scope.tempAdditional_service.push(element);
        }
    }


    // Функции для работ
    //     $scope.filtrMasterCategories = function (element) {
    //         return $scope.masterData.categories.findIndex(findIndexOfMasterCategoriesById(element.parent_id)) >= 0
    //     }
    //
    //     $scope.filtrMasterKind_services = function (parentIdElement) {
    //         return function (elementServices) {
    //             var filtered = $scope.categories.filter(findById(elementServices._id));
    //             if (filtered.length > 0) {
    //                 if (filtered[0].parent_id == parentIdElement) {
    //                     return true;
    //                 }
    //             }
    //             return false
    //         }
    //     }
    //
    //     function findById(id) {
    //         return function (element) {
    //             return element._id == id;
    //         }
    //     }
    //
    //     $scope.findNameServiceById = function (elementId) {
    //         var filtered = $scope.categories.filter(findById(elementId));
    //         if (filtered.length > 0) {
    //             return filtered[0].val;
    //         }
    //         return ""
    //     }
    //
    //     $scope.selectKindServices = function (element) {
    //         if ($scope.checkKind_services.isCheckKind_services) {
    //             $scope.checkKind_services.checkKind_services = null;
    //         } else {
    //             $scope.checkKind_services.checkKind_services = element;
    //         }
    //         $scope.checkKind_services.isCheckKind_services = !$scope.checkKind_services.isCheckKind_services;
    //
    //
    //     }

}]);
