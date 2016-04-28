remontas24Site.controller('masterController', ['$scope', 'masterOpenProfile', '$stateParams', 'ModalService', function ($scope, masterOpenProfile, $stateParams, ModalService) {

    $scope.model = {
        master: undefined
    };

    $scope.getNameMaster = getNameMaster;
    $scope.haveAdditionalService = haveAdditionalService;
    $scope.getImgLink = getImgLink;
    $scope.shrinkText = shrinkText;
    $scope.openViewer = openViewer;


    loadData($stateParams.id);

    /////////////////////////////////////////////////////////////////////////

    function loadData(masterId) {
        masterOpenProfile.get({
            'masterId': masterId
        }, function (value, responseHeaders) {
            $scope.model.master = JSON.parse(JSON.stringify(value.master));

            $scope.model.configUrl = JSON.parse(JSON.stringify(value.configUrl));

        });
    }

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

            }]);
