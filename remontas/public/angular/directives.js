remontas24Site.directive('mastersSearchBox', function() {
    return {
        restrict: 'E',
        scope: {
            data: '=data'
        },
        link: function(scope, element) {

            scope.getIdForMaster = function(master) {
                if (master.alias_id !== undefined && master.alias_id !== "")
                    return master.alias_id;
                else return master._id;
            }

            scope.getRange = function(start, edge, step) {
                // If only one number was passed in make it the edge and 0 the start.
                if (arguments.length == 1) {
                    edge = start;
                    start = 0;
                }

                // Validate the edge and step numbers.
                edge = edge || 0;
                step = step || 1;

                // Create the array of numbers, stopping befor the edge.
                for (var ret = [];
                    (edge - start) * step > 0; start += step) {
                    ret.push(start);
                }
                return ret;
            }

        },
        templateUrl: '/remontas/public/angular/directives/mastersSearchBox.html'
    };
});