var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('masters', ['$resource',
  function ($resource) {
        return $resource('/api/adminka/masters/:id', {}, {
            "deleteMaster": {
                method: 'GET',
                params: {
                    method: "deleteMaster"
                }
            }
        });
}]);

remBackend.factory('usersManage', ['$resource',
  function ($resource) {
        return $resource('/api/adminka/usersManage', {}, {
            "getAllUsersMasters": {
                method: 'GET',
                params: {
                    method: "getAllUsersMasters"
                }
            }
        });
}]);

remBackend.factory('Operations', ['$resource',
  function ($resource) {
        return $resource('/api/adminka/Operations');
}]);

remBackend.factory('category', ['$resource',
  function ($resource) {
        return $resource('/api/adminka/categories', {}, {
            "getAll": {
                method: 'GET',
                isArray: true,
                params: {
                    method: "getAll"
                }
            },
            "saveNew": {
                method: 'POST',
                params: {
                    method: "saveNew"
                }
            },
            "saveEdited": {
                method: 'POST',
                params: {
                    method: "saveEdited"
                }
            },
            "delete": {
                method: 'POST',
                params: {
                    method: "delete"
                }
            }
        });
                }]);
