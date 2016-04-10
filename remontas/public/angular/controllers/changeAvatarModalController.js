remontas24Site.controller('changeAvatarModalController', ['$scope', '$rootScope', 'close', function ($scope, $rootScope, close) {
    //Убрать скролл главного окна

    $scope.close = close;

    $scope.acceptChange = function () {
        close($scope.avatar.file, 200); // close, but give 200ms for bootstrap to animate

        ////при закрытии ...
    };

    $scope.avatar = {
        file: null
    };

    $scope.canSelect = function () {
        return ($scope.avatar.file) ? false : true;
    }

}]);
