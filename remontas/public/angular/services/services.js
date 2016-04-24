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

remBackend.factory('masterData', ['$resource',
  function ($resource) {
        return function (masterId) {
            return $resource('/api/master', {}, {
                "init": {
                    method: 'GET',
                    params: {
                        id: masterId
                    }
                }
            });
        }
}]);

//Это вообще нужно ????
remBackend.factory('masterMainData', ['$resource',
  function ($resource) {
        return $resource('/api/lk/mainDataSave');
                }]);