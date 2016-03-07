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


remontas24App.controller('categoryController', ['$scope', '$state', 'category', '$stateParams', function ($scope, $state, category, $stateParams) {
    $scope.categoriesData = $stateParams.categoriesData;
    $scope.element = $stateParams.element;

    $scope.typeArray = [
        {
            id: 'category',
            name: 'Категория'
        },
        {
            id: 'service',
            name: 'Вид работ'
        },
        {
            id: 'job',
            name: 'Работа'
        }
    ];


    $scope.selected = {
        type: $scope.typeArray[0],
        category: null,
        service: null,
        name: null
    }

    if ($scope.element != null) {
        $scope.selected.name = $scope.element.val;
    }

    $scope.clearFields = function (mode) {
        if (mode == 'type') {
            $scope.selected.category = null;
            $scope.selected.service = null;
        } else if (mode == 'category') {
            $scope.selected.service = null;
        }
    }

    $scope.saveCategory = function () {
        if ($scope.element == null) {
            var newCategory = {

                'type': $scope.selected.type.id,
                'val': $scope.selected.name
            }
            if (newCategory.type == "service") {
                newCategory.parent_id = $scope.selected.category._id
            } else if (newCategory.type == "job") {
                newCategory.parent_id = $scope.selected.service._id
            }
            category.saveNew(newCategory);
        } else {
            var editCategory = {
                '_id': $scope.element._id,
                'val': $scope.selected.name
            }
            category.saveEdited(editCategory);
        }

        $state.go('adminka.categories');
    }
}]);
