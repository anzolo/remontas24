var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('searchMasters', ['$resource',
  function ($resource) {
        return $resource('/api/main/searchMasters', {}, {
            "searchMasters": {
                method: 'POST'
            }
        });
}]);

remBackend.factory('lkData', ['$resource',
  function ($resource) {
        return $resource('/api/lk', {}, {
            "init": {
                method: 'GET',
                params: {
                    method: "init"
                }
            }

        });
}]);

remBackend.factory('masterOpenProfile', ['$resource',
  function ($resource) {
        return $resource('/api/masterOpenProfile/:masterId');
}]);

remBackend.factory('masterRegister', ['$resource',
  function ($resource) {
        return $resource('/api/masterRegister');
}]);

remBackend.factory('masterResetPassword', ['$resource',
  function ($resource) {
        return $resource('/api/masterResetPassword');
}]);

remBackend.factory('compareService', ['$resource',
  function ($resource) {
        return $resource('/api/compareService', {}, {
            "compare": {
                method: 'POST'
            }
        });
}]);
