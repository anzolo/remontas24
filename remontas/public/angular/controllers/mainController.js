remontas24Site.controller('mainController', ['$scope', 'searchMasters', function ($scope, searchMasters) {
    $scope.searchResult = searchMasters.get();

}]);
