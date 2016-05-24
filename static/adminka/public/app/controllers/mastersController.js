remontas24App.controller('mastersController', ['$scope', 'masters', '$state', function ($scope, masters, $state) {

    $scope.model = {};

    $scope.result = masters.get({}, function (data) {
        $scope.model.masters = JSON.parse(JSON.stringify(data.masters));
        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
    });

    $scope.newMaster = function () {
        $state.go('adminka.newMaster');
    }

    $scope.editMaster = function (masterId) {
        $state.go('adminka.editMaster');
    }



}]);
