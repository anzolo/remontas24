remontas24App.controller('operationsController', ['$scope', 'Operations', function ($scope, Operations) {

    $scope.model = {};
    //
    //    usersManage.getAllUsersMasters({}, function (data) {
    //        $scope.model.users = JSON.parse(JSON.stringify(data.users));
    //        //        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
    //    });


    $scope.runOperation = runOperation;

    /////////////////////////////////////////////////////////////////////////////////

    function runOperation(operation) {
        Operations.get({
            "operation": operation
        }, function (data) {
            console.log("Операция завершена: " + data.status)
        })
    }


}]);
