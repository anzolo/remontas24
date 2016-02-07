var remBackend = angular.module('remBackend', ['ngResource']);

remBackend.factory('masters', ['$resource', 'CONFIG',
  function ($resource, CONFIG) {
        return $resource('http://' + CONFIG.app_url + '/api/adminka/masters/:id');
                }]);
