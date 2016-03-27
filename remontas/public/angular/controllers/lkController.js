remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', '$sce', 'ModalService', 'Upload', function ($scope, lkData, masterMainData, $sce, ModalService, Upload) {

    $scope.interfaceOptions = {
        showCategory: false,
        showAddServices: false,
        newAvatar: null,
        mouseOverWork: {}
    };

    var loadData = function () {

        lkData.init({}, function (value, responseHeaders) {
            $scope.categories = value.categories;
            $scope.masterData = prepareMasterCategories(value.master, value.categories); //value.master;

            $scope.tempMasterCategories = value.master.categories.slice();
            $scope.tempMasterCategoriesSelect = [];
            $scope.tempAdditional_service = value.master.additional_service.slice();
        })

    }

    loadData();

    $scope.checkKind_services = null;
    $scope.mouseMoveServise = null;

    $scope.saveMaster = function () {

        var connString = '/api/lk';

        Upload.upload({
            url: connString,
            data: {
                avatar: $scope.interfaceOptions.newAvatar,
                master: Upload.json($scope.masterData)
            }

        }).then(function (resp) {
            //console.log('Success uploaded. Response: ' + resp.data);

            loadData();
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        });

    };

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

                master.categories[categoryKey].visible = true; //удалять перед сохранением.
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

    $scope.selectKindServices = function (id) {
        if ($scope.checkKind_services != id) $scope.checkKind_services = id;
        else $scope.checkKind_services = null
    }

    $scope.compareOrder = function (a, b) {
        if (a.order < b.order) return -1;
        else if (a.order > b.order) return 1;
        else return 0;
    }

    //изменение аватарки

    $scope.changeAvatar = function () {
        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/changeAvatar.html",
            controller: "changeAvatarModalController"
        }).then(function (modal) {
            // The modal object has the element built, if this is a bootstrap modal
            // you can call 'modal' to show it, if it's a custom modal just show or hide
            // it as you need to.
            //            modal.element.modal();
            modal.close.then(function (result) {
                $scope.interfaceOptions.newAvatar = result;
            });
        });
    }

    $scope.getImgLink = function (work) {
        return "http://127.0.0.1:8080/storage/331539c3-bfef-4b41-a5a1-5fe1098de837.jpg"
    }

}]);

remontas24Site.controller('changeAvatarModalController', ['$scope', '$rootScope', 'close', function ($scope, $rootScope, close) {
    $scope.close = close;

    $scope.acceptChange = function () {
        close($scope.avatar.file, 200); // close, but give 200ms for bootstrap to animate
    };

    $scope.avatar = {
        file: null
    };

    $scope.canSelect = function () {
        return ($scope.avatar.file) ? false : true;
    }

}]);
