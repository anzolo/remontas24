remontas24Site.controller('invoiceFormController', ['$scope', 'close', '$document', 'invoiceService', function ($scope, close, $document, invoiceService) {

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');

    $scope.closeWindow = closeWindow;

    $scope.model = {
        "activeTab": "email",
        "categories": invoiceService.getCategories(),
        showComboBox: false,
        form: {
            comment: "",
            selectedCategory: {},
            email: "",
            phone: ""
        }

    }

    $scope.selectCategory = selectCategory;
    $scope.sendInvoice = sendInvoice;


    ///////////////////////////////////////////////////////////////////////////////////

    function selectCategory(category) {
        $scope.model.form.selectedCategory.name = category.val;
        $scope.model.form.selectedCategory._id = category._id;
        $scope.model.showComboBox = false;
    };

    function sendInvoice() {
        invoiceService.sendInvoice($scope.model.form, function (data) {
            console.log('send invoice')
        })
    }

    function closeWindow() {

        bodyRef.removeClass('ovh');

        close();
    }

}]);
