remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', '$stateParams', function ($scope, masters, $state, Upload, $stateParams) {
    $scope.master = {
        name: "",
        sername: "",
        patronymic: "",
        email: "",
        jobs_count: 0,
        avatar: "",
        kind_profile: "phys",
        detail: "",
        phone1: "",
        phone2: "",
        categories: [],
        additional_service: []
    };

    $scope.saveStatus = {
        show: false,
        success: true,
        text: "empty"
    };

    $scope.popupData = {
        "newService": null
    };

    var masterID = $stateParams.id;

    $scope.loadMaster = function () {
        var editMaster = masters.get({
            id: masterID
        }, function (data) {
            if (data.status == "OK") {
                //$scope.master = data.master;
                $scope.master = JSON.parse(JSON.stringify(data.master));

                Upload.urlToBlob(data.master.avatar).then(function (blob) {
                    $scope.master.avatar = blob;
                    $scope.master.avatar.lastModifiedDate = new Date();
                    $scope.master.avatar.name = data.master.avatar;
                });
                $scope.categories = JSON.parse(JSON.stringify(data.categories));

                if ($scope.master.categories == null) $scope.master.categories = [];
                if ($scope.master.additional_service == null) $scope.master.additional_service = [];

            } else if (data.status == "Error") {
                console.error("Error:", data.note);
                $state.go('adminka.masters');
            } else {
                $state.go('adminka.masters');
            }
        });
    }

    if (masterID != undefined) $scope.loadMaster();

    $scope.cancel = function () {
        $state.go('adminka.masters');
        //        console.log("$scope.master.avatar = ", $scope.master.avatar);
    }

    $scope.saveMaster = function () {

        var connString = '/api/adminka/masters';

        if (masterID != undefined) connString = connString + '/' + masterID;

        Upload.upload({
            url: connString,
            data: {
                avatar: file,
                master: Upload.json($scope.master)
            }
        }).then(function (resp) {
            console.log('Success uploaded. Response: ' + resp.data);
            $scope.saveStatus.show = true;
            $scope.saveStatus.success = true;
            $scope.saveStatus.text = "Мастер успешно сохранен.";
            $scope.loadMaster();
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            $scope.saveStatus.show = true;
            $scope.saveStatus.success = false;
            $scope.saveStatus.text = "При сохранении мастера произошла ошибка: " + resp.status;
        });
        //$state.go('adminka.masters');

    };

    //управление категориями, видами услуг, услугами
    $scope.isMasterCategory = function (category) {
        return $scope.master.categories.findIndex(function (el) {
            return el._id == category._id
        }) >= 0
    }

    $scope.onlyMasterCategory = function () {
        return function (category) {
            return $scope.master.categories.findIndex(function (el) {
                return el._id == category._id
            }) >= 0
        };
    };

    $scope.masterServiceArray = function (category, kind_service) {
        var categoryIndex = $scope.master.categories.findIndex(function (el) {
            return el._id == category._id
        });
        if (categoryIndex >= 0) {
            var kindServiceIndex = $scope.master.categories[categoryIndex].kind_services.findIndex(function (el) {
                return el._id == kind_service._id
            });

            if (kindServiceIndex >= 0) return $scope.master.categories[categoryIndex].kind_services[kindServiceIndex].services
            else return [];

        } else return [];
    };

    $scope.checkCategory = function (category) {
        var categoryIndex = $scope.master.categories.findIndex(function (el) {
            return el._id == category._id
        });

        if (categoryIndex >= 0) {
            $scope.master.categories.splice(categoryIndex, 1);
        } else {
            // var categoryDict = $scope.categories.find();

            var newCategory = {
                "_id": category._id,
                "name": category.val,
                "order": category.order,
                "kind_services": []
            };

            $scope.master.categories.push(newCategory);

        }
    }

    $scope.deleteService = function (category, kind_service, service) {
        var categoryIndex = $scope.master.categories.findIndex(function (el) {
            return el._id == category._id
        });

        var kindServiceIndex = $scope.master.categories[categoryIndex].kind_services.findIndex(function (el) {
            return el._id == kind_service._id
        });

        var serviceIndex = $scope.master.categories[categoryIndex].kind_services[kindServiceIndex].services.findIndex(function (el) {
            return el._id == service._id
        });

        try {
            $scope.master.categories[categoryIndex].kind_services[kindServiceIndex].services.splice(serviceIndex, 1);

            if ($scope.master.categories[categoryIndex].kind_services[kindServiceIndex].services.length == 0) $scope.master.categories[categoryIndex].kind_services.splice(kindServiceIndex, 1);

        } catch (ex) {
            console.error("Error: ", ex.message);
        }
    }

    $scope.addService = function (category, kind_service, data) {
        var categoryIndex = $scope.master.categories.findIndex(function (el) {
            return el._id == category._id
        });

        var kindServiceIndex = $scope.master.categories[categoryIndex].kind_services.findIndex(function (el) {
            return el._id == kind_service._id
        });

        var newService = {
            _id: data.newService._id,
            measure: data.newService.measure,
            name: data.newService.val,
            order: data.newService.order,
            price: data.price
        }


        //console.log(categoryIndex, kindServiceIndex, newService);
        if (kindServiceIndex < 0) {
            var newKindService = {
                _id: kind_service._id,
                name: kind_service.val,
                order: kind_service.order,
                services: []
            };
            newKindService.services.push(newService);

            $scope.master.categories[categoryIndex].kind_services.push(newKindService);

        } else $scope.master.categories[categoryIndex].kind_services[kindServiceIndex].services.push(newService);

        data.showAddBlock = false;
        data.newService = null;
        data.price = 0;

    }

    $scope.onlyNewServices = function (category, kind_service) {
        return function (service) {
            return $scope.masterServiceArray(category, kind_service).findIndex(function (el) {
                return el._id == service._id
            }) < 0
        };
    }

            }]);
