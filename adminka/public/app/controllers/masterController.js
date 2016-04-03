remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', '$stateParams', 'category', function ($scope, masters, $state, Upload, $stateParams, category) {
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

    //categories при создании нового мастера нужно загружать справочник

    $scope.saveStatus = {
        show: false,
        success: true,
        text: "empty"
    };

    $scope.formData = {
        "newService": null,
        "avatar": null,
        "currentPage": 'services',
        "worksCollapse": {},
        "uploadData": {}
    };

    //    var masterID = $stateParams.id;

    $scope.loadMaster = function () {
        var editMaster = masters.get({
            id: $stateParams.id
        }, function (data) {
            if (data.status == "OK") {
                $scope.master = JSON.parse(JSON.stringify(data.master));

                $scope.configUrl = JSON.parse(JSON.stringify(data.configUrl));

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

    if ($stateParams.id != undefined) $scope.loadMaster()
    else $scope.categories = category.getAll();

    $scope.cancel = function () {
        $state.go('adminka.masters');
        //        console.log("$scope.master.avatar = ", $scope.master.avatar);
    }

    $scope.saveMaster = function () {

        var connString = '/api/adminka/masters';

        $scope.formData.uploadData.master = Upload.json($scope.master);
        $scope.formData.uploadData.avatar = $scope.formData.avatar;

        Upload.upload({
            url: connString,
            data: $scope.formData.uploadData

        }).then(function (resp) {
            console.log('Success uploaded. Response: ' + resp.data);
            $scope.saveStatus.show = true;
            $scope.saveStatus.success = true;
            $scope.saveStatus.text = "Мастер успешно сохранен: " + resp.data.note;

            if (resp.data.new_id != undefined) $stateParams.id = resp.data.new_id;

            $scope.loadMaster();
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            $scope.saveStatus.show = true;
            $scope.saveStatus.success = false;
            $scope.saveStatus.text = "При сохранении мастера произошла ошибка: " + resp.status;
        });

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

    //функции для "Дополнительных услуг"

    $scope.checkAdditionalService = function (service) {
        var categoryIndex = $scope.master.additional_service.indexOf(service);

        if (categoryIndex >= 0) {
            $scope.master.additional_service.splice(categoryIndex, 1);
        } else {
            // var categoryDict = $scope.categories.find();

            $scope.master.additional_service.push(service);

        }
    }

    $scope.isCheckedAdditionalService = function (service) {
        return $scope.master.additional_service.indexOf(service) >= 0
    }

    //функции для блока "Работы"

    $scope.deletePhoto = function (photosArray, photo) {

        if (photo.new) delete $scope.formData.uploadData[photo.filename];

        var delIndex = photosArray.indexOf(photo);

        photosArray.splice(delIndex, 1)

    }

    $scope.addWork = function () {
        var newWork = {
            'description': "",
            'photos': []
        };

        $scope.master.works.push(newWork);
    }

    $scope.deleteWork = function (work) {

        work.photos.forEach(function (photo, i, arr) {
            if (photo.new) delete $scope.formData.uploadData[photo.filename];
        });

        var delIndex = $scope.master.works.indexOf(work);

        $scope.master.works.splice(delIndex, 1)
    }

    $scope.addPhoto = function (file, errFiles, work) {
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            var newPhoto = {
                'description': "",
                'filename': null
            };

            newPhoto.filename = createFileName(file.name);
            newPhoto.new = true;

            Upload.rename(file, newPhoto.filename);

            $scope.formData.uploadData[newPhoto.filename] = file;

            work.photos.push(newPhoto);
        }
    }

    var createFileName = function (filename) {

        var newFileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var fileExt = filename.split('.').pop();

        return newFileName + '.' + fileExt;

    }

            }]);
