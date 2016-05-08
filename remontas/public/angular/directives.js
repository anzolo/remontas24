remontas24Site.directive('mastersSearchBox', function () {
    return {
        restrict: 'E',
        scope: {
            data: '=data'
        },
        templateUrl: '/remontas/public/angular/directives/mastersSearchBox.html'
    };
});
