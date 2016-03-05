var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('masters', ['$resource',
  function ($resource) {
        return $resource('/api/adminka/masters/:id');
                }]);
