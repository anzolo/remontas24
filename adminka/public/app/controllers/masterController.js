remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', 'CONFIG', '$stateParams', function ($scope, masters, $state, Upload, CONFIG, $stateParams) {
    $scope.master = {};

    $scope.master.name = "";
    $scope.master.jobs_count = 0;
    $scope.master.avatar = "";

    var masterID = $stateParams.id;

    $scope.mode = null;

    if (masterID == undefined) {
        $scope.mode = "new"
    } else {
        $scope.mode = "edit"
    };

    //console.log("mode = ", $scope.mode);

    if ($scope.mode == "edit") {
        var editMaster = masters.get({
            id: masterID
        }, function () {
            if (editMaster.status == "OK") {
                $scope.master.name = editMaster.name;
                $scope.master.jobs_count = editMaster.jobs_count;

                Upload.urlToBlob(editMaster.avatar).then(function (blob) {
                    $scope.master.avatar = blob;
                    //                    $scope.master.avatar.name = "avatarPict"
                    //                    console.log("$scope.master.avatar = ", $scope.master.avatar);
                });
            } else if (editMaster.status == "Error") {
                console.error("Error:", editMaster.note);
                $state.go('adminka.masters');
            } else {
                $state.go('adminka.masters');
            }
        });

    }

    $scope.cancel = function () {
        $state.go('adminka.masters');
        //        console.log("$scope.master.avatar = ", $scope.master.avatar);
    }

    $scope.saveMaster = function () {

        if ($scope.mode == "new") {
            Upload.upload({
                url: 'http://' + CONFIG.app_url + '/api/adminka/masters',
                data: {
                    avatar: $scope.master.avatar,
                    name: $scope.master.name,
                    jobs_count: $scope.master.jobs_count
                },
            });
            $state.go('adminka.masters');
        } else if ($scope.mode == "edit") {
            Upload.upload({
                url: 'http://' + CONFIG.app_url + '/api/adminka/masters/' + masterID,
                data: {
                    avatar: $scope.master.avatar,
                    name: $scope.master.name,
                    jobs_count: $scope.master.jobs_count
                },
            });
            $state.go('adminka.masters');
        };
    }
}]);
