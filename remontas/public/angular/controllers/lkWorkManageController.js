remontas24Site.controller('lkWorkManageController', ['$scope', '$rootScope', 'close', 'data', 'Upload', function ($scope, $rootScope, close, data, Upload) {
    //Убрать скролл главного окна

    $scope.closeWindow = closeWindow;

    $scope.setCurrentPhoto = setCurrentPhoto;

    $scope.addPhoto = addPhoto;

    $scope.model = {
        master: data.master,
        configUrl: data.configUrl,
        uploadData: data.uploadData,
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

    function addPhoto(file, errFiles, work) {
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            var newPhoto = {
                'description': "",
                'filename': null
            };

            newPhoto.filename = createFileName(file.name);
            newPhoto.new = true;

            Upload.rename(file, newPhoto.filename);

            $scope.model.uploadData[newPhoto.filename] = file;

            $scope.model.work.photos.push(newPhoto);
        }
    }

    function closeWindow() {
        if ($scope.model.work.photos.length == 0) {
            var indexWork = $scope.model.work.photos.indexOf($scope.model.work);

            $scope.model.master.works.splice(indexWork, 1)
        }

        close();
    }

    var createFileName = function (filename) {

        var newFileName = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var fileExt = filename.split('.').pop();

        return newFileName + '.' + fileExt;

    }


}]);
