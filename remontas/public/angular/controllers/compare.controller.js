remontas24Site.controller('compareController', ['$scope', 'Session', 'compareService', function ($scope, Session, compareService) {

    $scope.model = {}

    compareService.compare({
        "masters": Session.favourites()
    }, function (data) {
        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl))
        $scope.model.masters = JSON.parse(JSON.stringify(data.masters))
        $scope.model.categories = JSON.parse(JSON.stringify(data.categories))
    })

}]);
