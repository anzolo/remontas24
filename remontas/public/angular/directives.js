remontas24Site.directive('mastersSearchBox', function() {
    return {
        restrict: 'E',
        scope: {
            data: '=data'
        },
        link: function(scope, element) {
            scope.getNumber = function(num) {
                return new Array(num);
            };

            scope.getIdForMaster = function(master) {
                if (master.alias_id !== undefined && master.alias_id !== "")
                    return master.alias_id;
                else return master._id;
            }

        },
        templateUrl: '/remontas/public/angular/directives/mastersSearchBox.html'
    };
});