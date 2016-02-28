var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('searchMasters', ['$resource',
  function ($resource) {
        return $resource('/api/main/searchMasters');
                }]);

remBackend.factory('lkData', ['$resource',
  function ($resource) {
        return $resource('/api/lk/initData');
                }]);