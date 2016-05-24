remontas24App.controller('categoriesController', ['$scope', '$state', 'category', function ($scope, $state, category) {
    $scope.categoriesData = category.getAll();
    $scope.selectedCategory = null;
    $scope.selectedService = null;
    $scope.selectedJob = null;
    $scope.selectedElementr = null;

    $scope.selectCategory = function (element) {
        if (element == $scope.selectedCategory) $scope.selectedCategory = null
        else $scope.selectedCategory = element;
        $scope.selectedService = null
        $scope.selectedJob = null
    }

    $scope.selectService = function (element) {
        if (element == $scope.selectedService) $scope.selectedService = null
        else
            $scope.selectedService = element;
        $scope.selectedJob = null
    }

    $scope.selectJob = function (element) {
        if (element == $scope.selectedJob) $scope.selectedJob = null
        else
            $scope.selectedJob = element;
    }

    $scope.showAddElementForm = function () {
        $state.go('adminka.category', {
            categoriesData: $scope.categoriesData
        });
    }
}]);
