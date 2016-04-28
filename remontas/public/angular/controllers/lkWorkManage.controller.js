remontas24Site.controller('lkWorkManageController', ['$scope', '$rootScope', 'close', 'data', 'Upload', function ($scope, $rootScope, close, data, Upload) {
    //Убрать скролл главного окна

    $scope.closeWindow = closeWindow;

    $scope.setCurrentPhoto = setCurrentPhoto;

    $scope.addPhoto = addPhoto;

    $scope.deletePhoto = deletePhoto;

    $scope.addFiles = addFiles;

    $scope.deleteWork = deleteWork;

    $scope.model = {
        master: data.master,
        configUrl: data.configUrl,
        uploadData: data.uploadData,
        currentPhoto: undefined,
        modeName: "",
        errorMsg: ""
    }


    if (data.editedWork != undefined) {
        $scope.model.work = data.editedWork;
        $scope.model.modeName = "Редактирование работы";
    } else {
        var newWork = {
            'description': "",
            'photos': []
        };

        $scope.model.master.works.push(newWork);

        $scope.model.work = $scope.model.master.works[$scope.model.master.works.indexOf(newWork)];

        $scope.model.modeName = "Добавление работы";

    }

    ///////////////////////////////////////////////////////////////////////////////////


    function deleteWork() {
        $scope.model.work.photos.forEach(function (photo, i, arr) {
            if (photo.new) delete $scope.model.uploadData[photo.filename];
        });

        var delIndex = $scope.model.master.works.indexOf($scope.model.work);

        $scope.model.master.works.splice(delIndex, 1)

        closeWindow(true);
    }

    function setCurrentPhoto(value) {
        $scope.model.currentPhoto = value;
    }

    function addPhoto(file, errFiles, photo) {
        $scope.model.errorMsg = "";

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
        };

        if (errFiles.length > 0) {

            $scope.model.errorMsg = "Не добавлено фото: " + errFiles[0].name + "."

            if (errFiles[0].$error == "maxSize") {
                $scope.model.errorMsg += " Размер файла больше допустимого. Максимальный размер: " + errFiles[0].$errorParam + ". Необходимо уменьшить файл перед добавлением.";
            };
            if (errFiles[0].$error == "pattern") {
                $scope.model.errorMsg += " Добавлять можно только изображения. Данный файл не является изображением.";
            };

        }

    }

    function deletePhoto(photo) {

        if (photo.new) delete $scope.model.uploadData[photo.filename];

        var delIndex = $scope.model.work.photos.indexOf(photo);

        $scope.model.work.photos.splice(delIndex, 1)

    }

    function addFiles(files, invalidFiles) {
        $scope.model.errorMsg = "";

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
        };

        if (invalidFiles.length > 0) {
            for (var i = 0; i < invalidFiles.length; i++) {

                $scope.model.errorMsg += "Не добавлено фото: " + invalidFiles[i].name + "."

                if (invalidFiles[i].$error == "maxSize") {
                    $scope.model.errorMsg += " Размер файла больше допустимого. Максимальный размер: " + invalidFiles[i].$errorParam + ". Необходимо уменьшить файл перед добавлением.";
                };
                if (invalidFiles[i].$error == "pattern") {
                    $scope.model.errorMsg += " Добавлять можно только изображения. Данный файл не является изображением.";
                };

            }
        }
    };



    function closeWindow(result) {
        if ($scope.model.work.photos.length == 0) {
            var indexWork = $scope.model.work.photos.indexOf($scope.model.work);

            $scope.model.master.works.splice(indexWork, 1)
        }

        close(result);
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
