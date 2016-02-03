remontas24App.controller('mastersController', ['$scope', 'masters', '$state', function ($scope, masters, $state) {
    $scope.result = masters.get();

    $scope.newMaster = function () {
        $state.go('adminka.newMaster');
    }
}]);
