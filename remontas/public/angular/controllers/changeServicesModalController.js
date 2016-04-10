remontas24Site.controller('changeServicesModalController', ['$scope', '$rootScope', '$sce', 'close', 'data', function ($scope, $rootScope, $sce, close, data) {

    $scope.close = close;
    $scope.model = {
        categories: data.categories,
        kindService: data.kindService,
        master: data.master,
        newService: false,
        canAddNewService: false,
        onlyNotMasterServices: []
    }

    $scope.selectService = selectService;

    $scope.showPopup = showPopup;

    $scope.addNewService = addNewService;

    $scope.removeService = removeService;


    ////////////////////////

    $scope.model.canAddNewService = onlyNewServices().length > 0;


    function onlyNewServices() {
        var result = $scope.model.categories.filter(function (el1) {
            return el1.parent_id == $scope.model.kindService._id
        }).filter(function (el2) {
            return $scope.model.kindService.services.filter(function (el3) {
                return el3._id == el2._id;
                //                console.log(el3._id + '==' + el2._id + '->' + (el3._id == el2._id))
            }).length < 1;
            //            console.log(qqq);
        });
        //
        //        console.log(result);
        return result;
    }

    function addNewService() {
        $scope.model.newService = true;
        $scope.model.canAddNewService = false;
    }

    function showPopup() {
        $scope.model.onlyNotMasterServices = onlyNewServices();
        $scope.model.showPopup = !$scope.model.showPopup;
    }

    function selectService(service) {

        var category_id = $scope.model.categories.find(function (el) {
            return el._id == $scope.model.kindService._id
        }).parent_id;


        var categoryIndex = $scope.model.master.categories.findIndex(function (el) {
            return el._id == category_id
        });

        var kindServiceIndex = $scope.model.master.categories[categoryIndex].kind_services.findIndex(function (el) {
            return el._id == $scope.model.kindService._id
        });

        var newService = {
            _id: service._id,
            measure: service.measure,
            name: service.val,
            order: service.order,
            price: 0
        }


        //console.log(categoryIndex, kindServiceIndex, newService);
        if (kindServiceIndex < 0) {
            var newKindService = {
                _id: $scope.model.kindService._id,
                name: $scope.model.kindService.val,
                order: $scope.model.kindService.order,
                services: []
            };
            newKindService.services.push(newService);

            $scope.model.master.categories[categoryIndex].kind_services.push(newKindService);

        } else $scope.model.kindService.services.push(newService);

        $scope.model.showPopup = false;
        $scope.model.newService = false;

        $scope.model.canAddNewService = onlyNewServices().length > 0;

    };

    function removeService(service) {
        var serviceIndex = $scope.model.kindService.services.findIndex(function (el) {
            return el._id == service._id
        });

        try {
            $scope.model.kindService.services.splice(serviceIndex, 1);

            if ($scope.model.kindService.services.length == 0) {

                var category_id = $scope.model.categories.find(function (el) {
                    return el._id == $scope.model.kindService._id
                }).parent_id;


                var categoryIndex = $scope.model.master.categories.findIndex(function (el) {
                    return el._id == category_id
                });

                var kindServiceIndex = $scope.model.master.categories[categoryIndex].kind_services.findIndex(function (el) {
                    return el._id == $scope.model.kindService._id
                });

                $scope.model.master.categories[categoryIndex].kind_services.splice(kindServiceIndex, 1);
            }

        } catch (ex) {
            console.error("Error: ", ex.message);
        }
    }

    $scope.preparePriceHTML = function (measure) {
        var newValue = $sce.trustAsHtml(measure);
        return newValue;
    };

}]);
