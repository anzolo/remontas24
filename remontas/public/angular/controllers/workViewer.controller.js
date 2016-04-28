remontas24Site.controller('workViewerController', ['$scope', 'close', 'data', '$document', function ($scope, close, data, $document) {

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');

    $scope.closeWindow = closeWindow;

    $scope.model = {
        work: data.work,
        configUrl: data.configUrl,
        currentPhoto: data.work.photos[0],
    }


    ///////////////////////////////////////////////////////////////////////////////////

    function closeWindow() {

        bodyRef.removeClass('ovh');

        close();
    }

}]);
