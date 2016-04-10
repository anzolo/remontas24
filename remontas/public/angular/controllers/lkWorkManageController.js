remontas24Site.controller('lkWorkManageController', ['$scope', '$rootScope', 'close', 'data', function ($scope, $rootScope, close, data) {
    //Убрать скролл главного окна

    $scope.closeWindow = closeWindow;

    $scope.setCurrentPhoto = setCurrentPhoto;

    $scope.model = {
        master: data.master,
        configUrl: data.configUrl,
        uploadData: data.uploadDat,
        currentPhoto: undefined
    }

    if (data.editedWork != undefined) $scope.model.work = data.editedWork
    else {
        var newWork = {
            'description': "",
            'photos': []
        };

        $scope.model.master.works.push(newWork);

        $scope.model.work = $scope.model.master.works[$scope.model.master.works.indexOf(newWork)];
    }

    function setCurrentPhoto(value) {
        $scope.model.currentPhoto = value;
    }

    function closeWindow() {
        if ($scope.model.work.photos.length == 0) {
            var indexWork = $scope.model.work.photos.indexOf($scope.model.work);

            $scope.model.master.works.splice(indexWork, 1)
        }

        close();
    }


}]);
