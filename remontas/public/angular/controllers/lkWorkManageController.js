remontas24Site.controller('lkWorkManageController', ['$scope', '$rootScope', 'close', 'data', 'Upload', function ($scope, $rootScope, close, data, Upload) {
    //Убрать скролл главного окна

    $scope.closeWindow = closeWindow;

    $scope.setCurrentPhoto = setCurrentPhoto;

    $scope.addPhoto = addPhoto;

    $scope.deletePhoto = deletePhoto;

    $scope.addFiles = addFiles;

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

    function addPhoto(file, errFiles, photo) {
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            var replace = false;

            if (photo) {
                var newPhoto = photo;

                if (photo.new) delete $scope.model.uploadData[photo.filename];

                replace = true;

            } else {
                var newPhoto = {
                    'description': "",
                    'filename': null
                };
            }

            newPhoto.filename = createFileName(file.name);
            newPhoto.new = true;

            Upload.rename(file, newPhoto.filename);

            $scope.model.uploadData[newPhoto.filename] = file;

            if (!replace) $scope.model.work.photos.push(newPhoto);
        }
    }

    function deletePhoto(photo) {

        if (photo.new) delete $scope.model.uploadData[photo.filename];

        var delIndex = $scope.model.work.photos.indexOf(photo);

        $scope.model.work.photos.splice(delIndex, 1)

    }

    function addFiles(files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {

                if ($scope.model.work.photos.length == 12) return;

                var newPhoto = {
                    'description': "",
                    'filename': null
                };

                newPhoto.filename = createFileName(files[i].name);
                newPhoto.new = true;

                Upload.rename(files[i], newPhoto.filename);

                $scope.model.uploadData[newPhoto.filename] = files[i];

                $scope.model.work.photos.push(newPhoto);

            };
        }

    };



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
