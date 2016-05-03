remontas24Site.controller('workViewerController', ['$scope', 'close', 'data', '$document', function ($scope, close, data, $document) {

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');

    $scope.closeWindow = closeWindow;
    $scope.nextPhoto = nextPhoto;
    $scope.previousPhoto = previousPhoto;

    $scope.model = {
        work: data.work,
        configUrl: data.configUrl,
        indexCurrentPhoto: 0,
    }


    ///////////////////////////////////////////////////////////////////////////////////

    function nextPhoto() {
        if ($scope.model.indexCurrentPhoto + 1 < $scope.model.work.photos.length)
            ++$scope.model.indexCurrentPhoto;
        else $scope.model.indexCurrentPhoto = 0;
    }

    function previousPhoto() {
        if ($scope.model.indexCurrentPhoto - 1 < 0)
            $scope.model.indexCurrentPhoto = $scope.model.work.photos.length - 1;
        else --$scope.model.indexCurrentPhoto;
    }

    function closeWindow() {

        bodyRef.removeClass('ovh');

        close();
    }

}]);