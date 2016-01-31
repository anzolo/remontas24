var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('masters', ['$resource',
  function ($resource) {
        return $resource('http://0.0.0.0:8080/api/adminka/masters');
                }]);
