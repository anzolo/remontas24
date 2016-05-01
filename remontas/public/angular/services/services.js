var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('searchMasters', ['$resource',
  function ($resource) {
        return $resource('/api/main/searchMasters');
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
