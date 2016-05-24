remontas24App.controller('usersMastersController', ['$scope', 'usersManage', function ($scope, usersManage) {

    $scope.model = {};

    usersManage.getAllUsersMasters({}, function (data) {
        $scope.model.users = JSON.parse(JSON.stringify(data.users));
        //        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
    });

}]);
