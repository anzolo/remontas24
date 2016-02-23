remontas24App.controller('masterController', ['$scope', 'masters', '$state', 'Upload', 'CONFIG', '$stateParams', function ($scope, masters, $state, Upload, CONFIG, $stateParams) {
    $scope.master = {
        name: "",
        sername: "",
        patronymic: "",
        email: "",
        jobs_count: 0,
        avatar: "",
        kind_profile: "phys"
    };

    //    $scope.model = {
    //        avatarPic: ""
    //    };

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
        }, function (data) {
            if (data.status == "OK") {
                //$scope.master = data;
                $scope.master = JSON.parse(JSON.stringify(data));

                Upload.urlToBlob(data.avatar).then(function (blob) {
                    $scope.master.avatar = blob;
                    $scope.master.avatar.lastModifiedDate = new Date();
                    $scope.master.avatar.name = data.avatar;
                });

                //delete $scope.master.$promise;
                //delete $scope.master.$resolved;
            } else if (data.status == "Error") {
                console.error("Error:", data.note);
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
            console.log("new master=", $scope.master);
            Upload.upload({
                url: 'http://' + CONFIG.app_url + '/api/adminka/masters',
                data: $scope.master,
            });
            $state.go('adminka.masters');
        } else if ($scope.mode == "edit") {
            console.log("edit master=", $scope.master);
            Upload.upload({
                url: 'http://' + CONFIG.app_url + '/api/adminka/masters/' + masterID,
                data: $scope.master,
            });
            $state.go('adminka.masters');
        };
    }
}]);
