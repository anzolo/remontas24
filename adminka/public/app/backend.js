var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('masters', ['$resource', 'CONFIG',
  function ($resource, CONFIG) {
        return $resource('/api/adminka/masters/:id');
                }]);
