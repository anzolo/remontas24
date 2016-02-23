remontas24Site.controller('authRegFormController', ['$scope', 'close', function ($scope, close) {
    //$scope.close = close("Hello!");
    $scope.close = function () {
        close();
    };
}]);

//remontas24Site.controller('authRegFormController', function ($scope, close) {
//
//    $scope.close = function (result) {
//        $scope.close = close;
//    };
//
//});
