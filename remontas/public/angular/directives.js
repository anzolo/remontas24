remontas24Site.directive('mastersSearchBox', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=data'
        },
        link: function (scope, element) {
            scope.getNumber = function (num) {
                return new Array(num);
            }
        },
        templateUrl: '/remontas/public/angular/directives/mastersSearchBox.html'
    };
});
