remontas24App.controller('ordersController', ['$scope', 'ordersService', function ($scope, ordersService) {

    $scope.model = {};

    ordersService.getAll({}, function (data) {
        $scope.model.orders = JSON.parse(JSON.stringify(data));
        //        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
    });



    /////////////////////////////////////////////////////////////////////////////////




}]);
