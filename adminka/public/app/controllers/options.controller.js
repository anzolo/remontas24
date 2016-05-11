remontas24App.controller('optionsController', ['$scope', 'options', function ($scope, options) {

    $scope.model = {};

    loadData();

    $scope.saveOption = saveOption;

    /////////////////////////////////////////////////////////////////////////////////

    function loadData() {

        options.getAll({}, function (data) {
            $scope.model.options = JSON.parse(JSON.stringify(data));
            //        $scope.model.configUrl = JSON.parse(JSON.stringify(data.configUrl));
        });

    }

    function saveOption(option) {

        options.save(option, function () {
            loadData();
        });

    }


}]);
