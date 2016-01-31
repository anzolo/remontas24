remontas24App.controller('mastersController', ['$scope', 'masters', function ($scope, masters) {
    $scope.result = masters.get();
}]);
