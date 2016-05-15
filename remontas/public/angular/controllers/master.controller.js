remontas24Site.controller('masterController', ['$scope', '$sce', 'masterOpenProfile', '$stateParams', 'ModalService', 'Session', function($scope, $sce, masterOpenProfile, $stateParams, ModalService, Session) {

    $scope.interfaceOptions = {
        checkKind_services: null,
        mouseOverService: []
    }

    $scope.model = {
        master: undefined
    };

    $scope.getNameMaster = getNameMaster;
    $scope.haveAdditionalService = haveAdditionalService;
    $scope.getImgLink = getImgLink;
    $scope.shrinkText = shrinkText;
    $scope.openViewer = openViewer;
    $scope.compareOrder = compareOrder;
    $scope.preparePriceHTML = preparePriceHTML;
    $scope.shrinkServiceText = shrinkServiceText;
    $scope.mouseOverService = mouseOverService;
    $scope.checkMouseOverService = checkMouseOverService;
    $scope.clearMouseOverService = clearMouseOverService;
    $scope.selectKindServices = selectKindServices;
    $scope.showPhone = showPhone;
    $scope.addToFavorites = addToFavorites;
    $scope.masterInFavorites = masterInFavorites;
    $scope.getFavoritesStatus = getFavoritesStatus;

    loadData($stateParams.id);

    /////////////////////////////////////////////////////////////////////////

    function loadData(masterId) {
        masterOpenProfile.get({
            'masterId': masterId
        }, function(value, responseHeaders) {
            if (value.status == "OK") {
                $scope.model.master = JSON.parse(JSON.stringify(value.master));

                $scope.model.configUrl = JSON.parse(JSON.stringify(value.configUrl));

                $scope.model.kind_services = masterKindServiceArray();
            }
        });
    };

    function addToFavorites(id) {
        Session.addToFavourites(id);
    };

    function masterInFavorites(master) {
        return Session.masterInFavourites(master._id);
    };

    function getFavoritesStatus(master) {

        if (Session.masterInFavourites(master._id)) {
            return "В сравнении"
        } else return "К сравнению";

    };

    function getNameMaster() {
        try {
            if ($scope.model.master.kind_profile == "phys") {
                return $scope.model.master.sername + " " + $scope.model.master.name + " " + $scope.model.master.patronymic;

            } else if ($scope.model.master.kind_profile == "org") {
                return $scope.model.master.name
            } else return ""
        } catch (ex) {
            console.error("Error: ", ex.message);
        }

    };

    function haveAdditionalService(service) {
        return $scope.model.master.additional_service.indexOf(service) >= 0;
    }

    function shrinkText(title) {
        if (title.length > 50) {
            return title.substring(0, 50) + "..."
        } else return title;
    }

    function getImgLink(work) {
        var result;

        if (work.photos.length > 0) {
            result = $scope.model.configUrl.img_url_work_path + work.photos[0].filename;
        }

        return result;
    }

    function openViewer(work) {

        var data = {
            work: work,
            configUrl: $scope.model.configUrl
        };

        ModalService.showModal({
            templateUrl: "/remontas/public/templates/modals/workViewer.html",
            controller: "workViewerController",
            inputs: {
                data: data
            }
        });
    };

    function compareOrder(a, b) {
        if (a.order < b.order) return -1;
        else if (a.order > b.order) return 1;
        else return 0;
    }

    function masterKindServiceArray() {
        var result = [];
        var category = $scope.model.master.categories.sort(compareOrder);
        category.forEach(function(cat, i, arr) {
            var kindService = cat.kind_services.sort(compareOrder);
            kindService.forEach(function(kser, i, arr) {
                result.push(kser)
            });
        });
        return result;
    };

    function shrinkServiceText(kind_service, service, title) {
        if (title.length > 67) {
            //        if (title.length > 20) {
            if ($scope.interfaceOptions.mouseOverService[kind_service] == undefined) $scope.interfaceOptions.mouseOverService[kind_service] = [];
            $scope.interfaceOptions.mouseOverService[kind_service][service] = {
                "text": title,
                "visible": false
            };
            return title.substring(0, 66) + "..."
                //            return title.substring(0, 20) + "..."
        } else return title;
    }

    function clearMouseOverService() {
        $scope.interfaceOptions.mouseOverService.forEach(function(kind_service, i, arr) {
            kind_service.forEach(function(service, i, arr) {
                service.visible = false
            })
        });
    }

    function checkMouseOverService(kind_service, service) {
        if ($scope.interfaceOptions.mouseOverService[kind_service] != undefined)
            if ($scope.interfaceOptions.mouseOverService[kind_service][service] != undefined)
                return $scope.interfaceOptions.mouseOverService[kind_service][service].visible
        return false
    }

    function mouseOverService(kind_service, service, type) {
        if (type == undefined) type = false
        clearMouseOverService();
        if ($scope.interfaceOptions.mouseOverService[kind_service] != undefined)
            if ($scope.interfaceOptions.mouseOverService[kind_service][service] != undefined)
                $scope.interfaceOptions.mouseOverService[kind_service][service].visible = type;
    }

    function preparePriceHTML(price, measure) {
        var newValue = $sce.trustAsHtml(price + "<span>" + measure + "</span>");
        return newValue;
    };

    function selectKindServices(id) {
        if ($scope.interfaceOptions.checkKind_services != id) $scope.interfaceOptions.checkKind_services = id;
        else $scope.interfaceOptions.checkKind_services = null
    }

    function showPhone(phone) {
        if (phone != "") {
            return "+7 (" + phone.substr(0, 3) + ") " + phone.substr(3, 3) + " " + phone.substr(6, 2) + " " + phone.substr(8, 2);
        }
        return phone;
    }

}]);