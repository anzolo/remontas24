remontas24Site.controller('lkController', ['$scope', 'lkData', 'masterMainData', '$sce', 'ModalService', 'Upload', '$document', function ($scope, lkData, masterMainData, $sce, ModalService, Upload, $document) {

    $scope.interfaceOptions = {
        showCategory: false,
        showAddServices: false,
        newAvatar: null,
        mouseOverWork: {},
        checkKind_services: null,
        countServices: 0,
        countJobs: 0
    };

    $scope.tempMasterCategoriesSelect = [];

    $scope.data = {
        "uploadData": {}
    }

    $scope.saveMaster = saveMaster;

    $scope.getImgLink = getImgLink;

    $scope.editWorks = editWorks;


    loadData();

    //изменение аватарки

    $scope.changeAvatar = function () {
        var bodyRef = angular.element($document[0].body)
        bodyRef.addClass('ovh'); // перенести в модальное окно аватарки

        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/changeAvatar.html",
            controller: "changeAvatarModalController"
        }).then(function (modal) {
            // The modal object has the element built, if this is a bootstrap modal
            // you can call 'modal' to show it, if it's a custom modal just show or hide
            // it as you need to.
            //            modal.element.modal();
            modal.close.then(function (result) {
                $scope.data.uploadData.avatar = result;
                bodyRef.removeClass('ovh');
            });
        });
    }

    // Функции для меню категорий
    $scope.showCategoriesMenu = function () {
        if ($scope.interfaceOptions.showAddServices == false) {
            $scope.tempMasterCategoriesSelect = $scope.data.master.categories.slice();
            $scope.interfaceOptions.showCategory = true;
        }
        //        $scope.interfaceOptions.showAddServices = false
        //        if (!$scope.interfaceOptions.showCategory) {
        //            $scope.tempMasterCategories = $scope.masterData.categories.slice();
        //            $scope.tempMasterCategoriesSelect = $scope.masterData.categories.slice();
        //        }
        //        return $scope.interfaceOptions.showCategory;
    }

    $scope.selectCategories = function () {
        //$scope.masterData.categories = $scope.tempMasterCategoriesSelect.slice();
        $scope.interfaceOptions.showCategory = false;
        $scope.data.kind_services = masterKindServiceArray();
        calcCountServices();
    }

    $scope.isCheckedCategory = function (element) {
        return $scope.data.master.categories.findIndex(function (el) {
            return el._id == element._id;
        }) >= 0;
    };

    $scope.checkCategory = function (element) {
        var categoryIndex = $scope.data.master.categories.findIndex(function (el) {
            return el._id == element._id
        });

        if (categoryIndex >= 0) {
            $scope.data.master.categories.splice(categoryIndex, 1);
        } else {
            var tempcategoryIndex = $scope.tempMasterCategoriesSelect.findIndex(function (el) {
                return el._id == element._id
            });

            if (tempcategoryIndex >= 0) {
                $scope.data.master.categories.push($scope.tempMasterCategoriesSelect[tempcategoryIndex]);
            } else {
                // var categoryDict = $scope.categories.find();

                var newCategory = {
                    "_id": element._id,
                    "name": element.val,
                    "order": element.order,
                    "kind_services": []
                };
                $scope.data.master.categories.push(newCategory);
            }
        }
        $scope.data.kind_services = masterKindServiceArray();
    }


    // Функции для меню дополнительных видов работ
    $scope.checkAdditionalService = function (element) {
        var categoryIndex = $scope.data.master.additional_service.indexOf(element);

        if (categoryIndex >= 0) {
            $scope.data.master.additional_service.splice(categoryIndex, 1);
        } else {
            // var categoryDict = $scope.categories.find();
            $scope.data.master.additional_service.push(element);
        }
    }

    $scope.isCheckedAdditionalService = function (element) {
        return $scope.data.master.additional_service.indexOf(element) >= 0
    }

    $scope.showAdditionalServiceMenu = function () {
        if ($scope.interfaceOptions.showCategory == false) {
            $scope.interfaceOptions.showAddServices = true;
        }
        //        if (!$scope.interfaceOptions.showAddServices) {
        //            $scope.tempAdditional_service = $scope.masterData.additional_service.slice();
        //        }
        //        return $scope.interfaceOptions.showAddServices
    }

    $scope.selectAdditionalService = function () {
        //        $scope.masterData.additional_service = $scope.tempAdditional_service.slice();
        $scope.interfaceOptions.showAddServices = false;
    }


    // Функции для услуг
    $scope.preparePriceHTML = function (price, measure) {
        var newValue = $sce.trustAsHtml(price + " " + measure);
        return newValue;
    };

    $scope.selectKindServices = function (id) {
        if ($scope.interfaceOptions.checkKind_services != id) $scope.interfaceOptions.checkKind_services = id;
        else $scope.interfaceOptions.checkKind_services = null
    }

    $scope.compareOrder = function (a, b) {
        if (a.order < b.order) return -1;
        else if (a.order > b.order) return 1;
        else return 0;
    }

    $scope.onlyMasterCategory = function () {
        return function (category) {
            return $scope.data.master.categories.findIndex(function (el) {
                return el._id == category._id
            }) >= 0
        };
    };

    /////////////////////


    function loadData() {
        lkData.init({}, function (data) {
            if (data.status == "OK") {
                $scope.data.master = JSON.parse(JSON.stringify(data.master));

                $scope.data.configUrl = JSON.parse(JSON.stringify(data.configUrl));

                $scope.data.categories = JSON.parse(JSON.stringify(data.categories));

                $scope.data.kind_services = masterKindServiceArray();

                calcCountServices();

            } else if (data.status == "Error") {
                console.error("Error:", data.note);
                //                $state.go('adminka.masters');
            }
        });
    }


    function masterKindServiceArray() {
        var result = [];
        var category = $scope.data.categories.filter(function (el) {
            return (el.type == 'category') && categoryInMaster(el)
        }).sort($scope.compareOrder);

        category.forEach(function (cat, i, arr) {
            var kindService = $scope.data.categories.filter(function (el) {
                return el.parent_id == cat._id
            }).sort($scope.compareOrder);

            kindService.forEach(function (kser, i, arr) {
                var kindServiceM = KindServiceInMaster(cat, kser);
                if (kindServiceM != undefined) result.push(kindServiceM)
                else {
                    var newKindService = {
                        "_id": kser._id,
                        "name": kser.val,
                        "order": kser.order,
                        "services": []
                    };
                    result.push(newKindService)
                }
            });
        });
        //        console.log(result)
        return result;
    };

    function categoryInMaster(category) {
        return $scope.data.master.categories.findIndex(function (el) {
            return el._id == category._id
        }) >= 0
    };

    function KindServiceInMaster(category, KindService) {
        var categoryIndex = $scope.data.master.categories.findIndex(function (el) {
            return el._id == category._id
        });
        if (categoryIndex >= 0) {
            var kindServiceIndex = $scope.data.master.categories[categoryIndex].kind_services.findIndex(function (el) {
                return el._id == KindService._id
            });

            if (kindServiceIndex >= 0) return $scope.data.master.categories[categoryIndex].kind_services[kindServiceIndex]
            else return undefined;
        } else return undefined;
    };

    $scope.changeServices = function (kindService) {
        //        $scope.bodyRef = angular.element(document.querySelector('.my'))
        //         angular.element(document.getElementsByClassName("multi-files"));
        var bodyRef = angular.element($document[0].body)
        bodyRef.addClass('ovh');
        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/changeServices.html",
            controller: "changeServicesModalController",
            inputs: {
                data: {
                    kindService: kindService,
                    categories: $scope.data.categories,
                    master: $scope.data.master
                }
            }
        }).then(function (modal) {
            modal.close.then(function (result) {
                bodyRef.removeClass('ovh');
                calcCountServices();
            });
        });
    }

    function saveMaster() {

        var connString = '/api/lk';

        $scope.data.uploadData.master = Upload.json($scope.data.master);
        //$scope.data.uploadData.avatar = $scope.data.avatar;

        Upload.upload({
            url: connString,
            data: $scope.data.uploadData

        }).then(function (resp) {
            //console.log('Success uploaded. Response: ' + resp.data);

            loadData();
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        });

    };

    function calcCountServices() {
        var count = 0;

        $scope.data.master.categories.forEach(function (category, i, arr) {
            category.kind_services.forEach(function (kindService, i, arr) {
                kindService.services.forEach(function (service, i, arr) {
                    count++;
                })
            })
        });

        $scope.interfaceOptions.countServices = count;
    }

    // функции для блока "Работы"

    function getImgLink(work) {
        var srcPath = "";

        if (work.photos.length > 0) {
            srcPath = $scope.data.configUrl.img_url_work_path + work.photos[0].filename;
        }

        return srcPath;
    }

    function editWorks(work) {
        var bodyRef = angular.element($document[0].body)
        bodyRef.addClass('ovh');

        var data = {
            //                    kindService: kindService,
            //                    categories: $scope.data.categories,
            master: $scope.data.master,
            configUrl: $scope.data.configUrl,
            uploadData: $scope.data.uploadData
        };

        if (work != undefined) data.editedWork = work;

        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/lkWorkManage.html",
            controller: "lkWorkManageController",
            inputs: {
                data: data
            }
        }).then(function (modal) {
            modal.close.then(function (result) {
                bodyRef.removeClass('ovh');
            });
        });
    }


    //    $scope.masterServiceArray = function (category, kind_service) {
    //        var categoryIndex = $scope.data.master.categories.findIndex(function (el) {
    //            return el._id == category._id
    //        });
    //        if (categoryIndex >= 0) {
    //            var kindServiceIndex = $scope.data.master.categories[categoryIndex].kind_services.findIndex(function (el) {
    //                return el._id == kind_service._id
    //            });
    //
    //            if (kindServiceIndex >= 0) return $scope.data.master.categories[categoryIndex].kind_services[kindServiceIndex].services
    //            else return [];
    //        } else return [];
    //    };

    //
    //    
    //
    //    function prepareMasterCategories(master, categories) {
    //        var onlyCategories = categories.filter(function (el) {
    //            return el.type == "category"
    //        });
    //        for (var i = 0; i < onlyCategories.length; i++) {
    //            var categoryKey = master.categories.findIndex(function (el) {
    //                return el._id == onlyCategories[i]._id
    //            })
    //
    //            if (categoryKey < 0) {
    //                var newKind_services = [];
    //                var tempNewKind_services = categories.filter(function (el) {
    //                    return el.parent_id == onlyCategories[i]._id
    //                });
    //                for (var x = 0; x < tempNewKind_services.length; x++) {
    //                    var kind_service = {
    //                        "_id": tempNewKind_services[x]._id,
    //                        "name": tempNewKind_services[x].val,
    //                        "order": tempNewKind_services[x].order,
    //                        "services": []
    //                    };
    //                    newKind_services.push(kind_service);
    //                }
    //                var newCategory = {
    //                    "_id": onlyCategories[i]._id,
    //                    "name": onlyCategories[i].val,
    //                    "order": onlyCategories[i].order,
    //                    "visible": false,
    //                    "kind_services": newKind_services
    //                };
    //                master.categories.push(newCategory);
    //            } else {
    //
    //                master.categories[categoryKey].visible = true; //удалять перед сохранением.
    //                var kindServices = categories.filter(function (el) {
    //                    return el.parent_id == master.categories[categoryKey]._id
    //                });
    //                for (var y = 0; y < kindServices.length; y++) {
    //                    if (master.categories[categoryKey].kind_services.findIndex(function (el) {
    //                            return el._id == kindServices[y]._id
    //                        }) < 0) {
    //                        var kind_service = {
    //                            "_id": kindServices[y]._id,
    //                            "name": kindServices[y].val,
    //                            "order": kindServices[y].order,
    //                            "services": []
    //                        };
    //                        master.categories[categoryKey].kind_services.push(kind_service);
    //                    }
    //                }
    //            }
    //        }
    //        // НУЖНО отсортировать категории и виды работ
    //        return master;
    //    }
    //
    //    // Поиск категории в масстиве мастера по её ID
    //    function findOfMasterCategoriesById(id) {
    //        return function (element) {
    //            return element._id == id;
    //        }
    //    }
    //
    //    // Поиск видов работ по ID категории
    //    function findByParentId(id) {
    //        return function (element) {
    //            return element.parent_id == id;
    //        }
    //    }
    //

}]);
