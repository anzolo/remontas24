remontas24Site.controller('changeAvatarModalController', ['$scope', '$rootScope', 'close', function ($scope, $rootScope, close) {
    //Убрать скролл главного окна

    $scope.closeWindow = closeWindow;

    $scope.selectPicture = selectPicture;

    $scope.acceptChange = function () {
        close($scope.model.file, 200); // close, but give 200ms for bootstrap to animate

        ////при закрытии ...
    };

    $scope.model = {
        file: null,
        errorMsg: ""
    };

    $scope.canSelect = function () {
        return ($scope.model.file) ? false : true;
    }

    function selectPicture(file, invalidFiles) {


        $scope.model.errorMsg = "";
        $scope.model.file = undefined;
        if (file) {
            $scope.model.file = file;
        };

        if (invalidFiles.length > 0) {

            $scope.model.errorMsg = "Ошибка при выборе файла: " + invalidFiles[0].name + "."

            if (invalidFiles[0].$error == "maxSize") {
                $scope.model.errorMsg += " Размер файла больше допустимого. Максимальный размер: " + invalidFiles[0].$errorParam + ". Необходимо уменьшить файл перед добавлением.";
            };
            if (invalidFiles[0].$error == "pattern") {
                $scope.model.errorMsg += " Выбрать можно только изображения. Данный файл не является изображением.";
            };

        }
    }

    function closeWindow() {
        close()
    }

}]);
