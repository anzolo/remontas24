remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', 'CONFIG', function ($scope, masters, $state, Upload, CONFIG) {
    $scope.name = "";
    $scope.works = 0;
    $scope.avatarPict = "";


    $scope.cancel = function () {
        $state.go('adminka.masters');
    }

    $scope.newMaster = function () {

        $scope.avatarPict.upload = Upload.upload({
            url: 'http://' + CONFIG.app_url + '/api/adminka/masters',
            data: {
                avatarPict: $scope.avatarPict,
                name: $scope.name,
                works: $scope.works
            },
        });


    }
}]);
