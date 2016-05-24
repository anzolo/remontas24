remontas24App.controller('categoryController', ['$scope', '$state', 'category', '$stateParams', function ($scope, $state, category, $stateParams) {
    $scope.model = {};

    $scope.categoriesData = $stateParams.categoriesData;
    $scope.element = $stateParams.element;

    $scope.nameForm = ($scope.element == null) ? "Добавление нового элемента" : "Редактирование элемента";

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
        name: null,
        measure: null
    }

    if ($scope.element != null) {
        $scope.selected.name = $scope.element.val;
        $scope.selected.type = $scope.typeArray.find(function (el) {
            return el.id == $scope.element.type
        });
        $scope.selected.measure = $scope.element.measure;
    }

    $scope.deleteCategory = deleteCategory;


    /////////////////////////////////////////////////////////////////////////////////

    function deleteCategory() {

        category.delete({
            "id": $scope.element._id
        }, function (data) {
            console.log("Удаление элемента справояника категорий: " + data.status);
            $state.go('adminka.categories');
        })

    };


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
                newCategory.parent_id = $scope.selected.service._id;
                newCategory.measure = $scope.selected.measure;
            }
            category.saveNew(newCategory);
        } else {
            var editCategory = {
                '_id': $scope.element._id,
                'val': $scope.selected.name
            }
            if ($scope.selected.type.id == "job") {
                editCategory.measure = $scope.selected.measure;
            }
            category.saveEdited(editCategory);
        }

        $state.go('adminka.categories');
    }
}]);
