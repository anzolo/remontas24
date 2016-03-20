//remontas24App.controller('blogElementController', ['$scope', '$log', '$sce', '$routeParams', 'Blog', function ($scope, $log, $sce, $routeParams, Blog) {
//
//    $scope.article = Blog.get({
//        id: $routeParams.id
//    }, function () {
//    $scope.blogText = $sce.trustAsHtml($scope.article.text);
//});

remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', '$sce', function ($scope, lkData, masterMainData, $sce) {

    $scope.interfaceOptions = {
        showCategory: false,
        showAddServices: false
    };

    $scope.countKindServices = 0;
    $scope.maxCountKindServices = 0;


    $scope.data = lkData.init({}, function (value, responseHeaders) {
        $scope.categories = value.categories;
        $scope.masterData = prepareMasterCategories(value.master, value.categories); //value.master;
        $scope.maxCountKindServices = value.categories.filter(function (el) {
            return el.type == "service"
        }).length;



        $scope.tempMasterCategories = value.master.categories.slice();
        $scope.tempMasterCategoriesSelect = [];
        $scope.tempAdditional_service = value.master.additional_service.slice();



    });


    //$scope.masterData = $scope.data["master"];

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
        //$scope.masterData.categories = $scope.tempMasterCategoriesSelect.slice();
        $scope.interfaceOptions.showCategory = false;
    }

    function prepareMasterCategories(master, categories) {
        var onlyCategories = categories.filter(function (el) {
            return el.type == "category"
        });
        for (var i = 0; i < onlyCategories.length; i++) {
            var categoryKey = master.categories.findIndex(function (el) {
                return el._id == onlyCategories[i]._id
            })

            if (categoryKey < 0) {
                var newKind_services = [];
                var tempNewKind_services = categories.filter(function (el) {
                    return el.parent_id == onlyCategories[i]._id
                });
                for (var x = 0; x < tempNewKind_services.length; x++) {
                    var kind_service = {
                        "_id": tempNewKind_services[x]._id,
                        "name": tempNewKind_services[x].val,
                        "order": tempNewKind_services[x].order,
                        "services": []
                    };
                    newKind_services.push(kind_service);
                }
                var newCategory = {
                    "_id": onlyCategories[i]._id,
                    "name": onlyCategories[i].val,
                    "order": onlyCategories[i].order,
                    "visible": false,
                    "kind_services": newKind_services
                };
                master.categories.push(newCategory);
            } else {

                master.categories[categoryKey].visible = true;
                var kindServices = categories.filter(function (el) {
                    return el.parent_id == master.categories[categoryKey]._id
                });
                for (var y = 0; y < kindServices.length; y++) {
                    if (master.categories[categoryKey].kind_services.findIndex(function (el) {
                            return el._id == kindServices[y]._id
                        }) < 0) {
                        var kind_service = {
                            "_id": kindServices[y]._id,
                            "name": kindServices[y].val,
                            "order": kindServices[y].order,
                            "services": []
                        };
                        master.categories[categoryKey].kind_services.push(kind_service);
                    }
                }
            }
        }
        // НУЖНО отсортировать категории и виды работ
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
        return $scope.masterData.categories.find(function (el) {
            return el._id == element._id;
        }).visible;
    }

    $scope.checkCategory = function (element) {
        var category = $scope.masterData.categories.find(function (el) {
            return el._id == element._id;
        })
        category.visible = !category.visible;
    }

    $scope.countCheckCategories = function () {
        if ($scope.masterData != undefined) {
            var category = $scope.masterData.categories.filter(function (el) {
                return el.visible
            });
            return category.length;
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
    $scope.preparePriceHTML = function (price, measure) {
        var newValue = $sce.trustAsHtml(price + " " + measure);
        return newValue;
    };

    $scope.filtrMasterCategories = function (element) {
        console.log(element)
        return element.visible;
    };

    $scope.firstRepeat = function () {
            if ($scope.countKindServices == $scope.maxCountKindServices) {
                $scope.countKindServices = 0
            }
            $scope.countKindServices++;
            console.log($scope.countKindServices, $scope.countKindServices % 4 == 0)
            return (($scope.countKindServices % 4 == 0) || ($scope.countKindServices == 1))

        }
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
