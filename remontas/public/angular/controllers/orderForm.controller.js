remontas24Site.controller('orderFormController', ['$scope', 'close', '$document', 'ordersService', function ($scope, close, $document, ordersService) {

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');

    $scope.closeWindow = closeWindow;

    $scope.model = {
        "activeTab": "email",
        "categories": ordersService.getCategories(),
        showComboBox: false,
        form: {
            comment: "",
            selectedCategory: {},
            email: "",
            phone: ""
        },
        loading: false,
        showInfoMessage: false

    }

    $scope.selectCategory = selectCategory;
    $scope.sendOrder = sendOrder;


    ///////////////////////////////////////////////////////////////////////////////////

    function selectCategory(category) {
        $scope.model.form.selectedCategory.name = category.val;
        $scope.model.form.selectedCategory._id = category._id;
        $scope.model.showComboBox = false;
    };

    function sendOrder() {
        $scope.model.loading = true;
        ordersService.sendOrder($scope.model.form, function (data) {
            console.log('send order')

            $scope.model.showInfoMessage = true;

        }).$promise.finally(function () {
            // called no matter success or failure
            $scope.model.loading = false;
        })
    }

    function closeWindow() {

        bodyRef.removeClass('ovh');

        close();
    }

}]);
