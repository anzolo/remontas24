remontas24Site.controller('masterController', ['$scope', 'masterData', '$stateParams', function ($scope, masterData, $stateParams) {
    console.log("---> " + $stateParams.id);
    loadData($stateParams.id);

    /////////////////////////////////////////////////////////////////////////

    function loadData(masterId) {
        masterData(masterId).init({}, function (data) {
            if (data.status == "OK") {
                console.log("Ссервера -> " + data.back);
            } else if (data.status == "Error") {
                console.error("Error:", data.note);
            }
        });
    }

}]);