(function() {
    'use strict';

    angular
        .module('remontas24Site')
        .controller('checkRegCodeController', checkRegCodeController);

    checkRegCodeController.$inject = ['$rootScope', '$stateParams', 'checkRegCode', 'Session', 'AUTH_EVENTS', '$state'];

    function checkRegCodeController($rootScope, $stateParams, checkRegCode, Session, AUTH_EVENTS, $state) {
        var vm = this;

        activate();

        ////////////////

        function activate() {

            //проверяем код активации на сервере

            checkRegCode.get({
                "code": $stateParams.code
            }, function(data) {
                if (data.status == "OK") {
                    Session.create(data.session_token, "");
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                } else {
                    $state.go('remontas.searchPage');
                }
            })

        }
    }
})();