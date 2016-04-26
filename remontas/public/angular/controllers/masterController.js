remontas24Site.controller('masterController', ['$scope', 'masterOpenProfile', '$stateParams', function ($scope, masterOpenProfile, $stateParams) {

    $scope.model = {
        master: undefined
    };

    $scope.getNameMaster = getNameMaster;

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

    }

}]);
