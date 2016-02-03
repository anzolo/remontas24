remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', function ($scope, masters, $state, Upload) {
    $scope.name = "";
    $scope.works = 0;
    $scope.avatarPict = "";


    $scope.cancel = function () {
        $state.go('adminka.masters');
    }

    $scope.newMaster = function () {
        var master = {};
        master.name = $scope.name;
        master.works = $scope.works;
        //master.avatarPict = Upload.jsonBlob($scope.avatarPict);

        //masters.save(master);

        $scope.avatarPict.upload = Upload.upload({
            url: 'http://0.0.0.0:8080/api/adminka/masters',
            data: {
                file: $scope.avatarPict,
                name: $scope.name,
                works: $scope.works
            },
        });


    }
}]);
