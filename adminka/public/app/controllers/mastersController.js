remontas24App.controller('mastersController', ['$scope', 'masters', '$state', function ($scope, masters, $state) {
    $scope.result = masters.get();

    $scope.newMaster = function () {
        $state.go('adminka.newMaster');
    }

    $scope.editMaster = function (masterId) {
        $state.go('adminka.editMaster');
    }



}]);
