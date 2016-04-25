remontas24Site.controller('changeServicesModalController', ['$scope', '$rootScope', '$sce', 'close', 'data', function ($scope, $rootScope, $sce, close, data) {

    $scope.close = close;
    $scope.model = {
        categories: data.categories,
        master: data.master,
        newService: false,
        canAddNewService: false,
        onlyNotMasterServices: []
    }

    $scope.model.kindService = findKindService(data.kindService_id);

    //    console.log($scope.model.kindService);

    $scope.model.masterKindService = findMasterKindService($scope.model.kindService);

    $scope.selectService = selectService;

    $scope.showPopup = showPopup;

    $scope.addNewService = addNewService;

    $scope.removeService = removeService;

    $scope.preparePriceHTML = preparePriceHTML;

    $scope.model.canAddNewService = onlyNewServices().length > 0;

    /////////////////////////////////////////////////////////////////////

    function findKindService(id) {
        //        console.log("------------------->" + id);
        return $scope.model.categories.find(function (el) {
            // console.log("el.val = " + el.val + " ;el._id = " + el._id + "; id = " + id + "; result = " + (el._id == id))
            return el._id == id
        });
    }

    function findMasterKindService(kindService) {
        var category_id = $scope.model.categories.find(function (el) {
            return el._id == kindService._id
        }).parent_id;

        var categoryIndex = $scope.model.master.categories.findIndex(function (el) {
            return el._id == category_id
        });

        var masterKindService = $scope.model.master.categories[categoryIndex].kind_services.find(function (el) {
            return el._id == kindService._id
        });

        return masterKindService
    }

    function onlyNewServices() {

        var result = $scope.model.categories.filter(function (el1) {
            return el1.parent_id == $scope.model.kindService._id
        });

        if ($scope.model.masterKindService == undefined) return result
        else {
            return result.filter(function (el2) {
                return $scope.model.masterKindService.services.filter(function (el3) {
                    return el3._id == el2._id;
                    //                console.log(el3._id + '==' + el2._id + '->' + (el3._id == el2._id))
                }).length < 1;
                //            console.log(qqq);
            });
        }


        //
        //        console.log(result);
        //        return result;
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
        var newService = {
            _id: service._id,
            measure: service.measure,
            name: service.val,
            order: service.order,
            price: 0
        }

        //console.log(newService);
        if ($scope.model.masterKindService == undefined) {
            var newKindService = {
                _id: $scope.model.kindService._id,
                name: $scope.model.kindService.val,
                order: $scope.model.kindService.order,
                services: []
            };
            newKindService.services.push(newService);

            var categoryIndex = $scope.model.master.categories.findIndex(function (el) {
                return el._id == $scope.model.kindService.parent_id
            });

            $scope.model.master.categories[categoryIndex].kind_services.push(newKindService);
            $scope.model.masterKindService = findMasterKindService($scope.model.kindService);
        } else {
            $scope.model.masterKindService.services.push(newService);
        };

        $scope.model.showPopup = false;
        $scope.model.newService = false;

        $scope.model.canAddNewService = onlyNewServices().length > 0;
    };

    function removeService(service) {
        var serviceIndex = $scope.model.masterKindService.services.findIndex(function (el) {
            return el._id == service._id
        });

        try {
            $scope.model.masterKindService.services.splice(serviceIndex, 1);

            if ($scope.model.masterKindService.services.length == 0) {

                var category_id = $scope.model.categories.find(function (el) {
                    return el._id == $scope.model.masterKindService._id
                }).parent_id;


                var categoryIndex = $scope.model.master.categories.findIndex(function (el) {
                    return el._id == category_id
                });

                var kindServiceIndex = $scope.model.master.categories[categoryIndex].kind_services.findIndex(function (el) {
                    return el._id == $scope.model.masterKindService._id
                });

                $scope.model.master.categories[categoryIndex].kind_services.splice(kindServiceIndex, 1);
            }

        } catch (ex) {
            console.error("Error: ", ex.message);
        }
    }

    function preparePriceHTML(measure) {
        var newValue = $sce.trustAsHtml(measure);
        return newValue;
    };

}]);
