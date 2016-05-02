remontas24Site.controller('authRegFormController', ['$scope', '$rootScope', 'close', 'AuthService', 'AUTH_EVENTS', '$state', '$document', 'masterRegister', 'masterResetPassword', function ($scope, $rootScope, close, AuthService, AUTH_EVENTS, $state, $document, masterRegister, masterResetPassword) {

    $scope.model = {};

    $scope.model.activeTab = "auth";
    $scope.model.wrongCredentials = false;
    $scope.model.registerError = false;
    $scope.model.showResgisterMessage = false;
    $scope.model.showWhyPopup = false;
    $scope.model.loading = false;
    $scope.model.showPasswordRecovery = false;
    $scope.model.showRecoveryPasswordMessage = false;

    $scope.model.passwordRecoverForm = {
        email: ""
    };


    $scope.model.credentials = {
        username: '',
        password: ''
    };

    $scope.model.regForm = {
        kind_profile: "phys",
        email: "",
        password: ""
    };

    $scope.closeWindow = closeWindow;
    $scope.login = login;
    $scope.sendRegisterRequest = sendRegisterRequest;
    $scope.registerOnceMore = registerOnceMore;
    $scope.sendPasswordRecoveryRequest = sendPasswordRecoveryRequest;

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');



    $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        bodyRef.removeClass('ovh');
        close();
        $state.go('remontas.lk');
    });

    /////////////////////////////////////////////////////////////////////////////////

    function sendPasswordRecoveryRequest() {
        $scope.model.loading = true;
        masterResetPassword.save({}, $scope.model.passwordRecoverForm, function (value, responseHeaders) {
            //success
            //            if (value.status == "error") {
            //                $scope.model.errorMessage = value.description;
            //                $scope.model.registerError = true;
            //            } else {
            //                $scope.model.showResgisterMessage = true;
            //            }

            $scope.model.showRecoveryPasswordMessage = true;

        }, function (httpResponse) {
            //fail
            console.log("Error: " + httpResponse)
        }).$promise.finally(function () {
            // called no matter success or failure
            $scope.model.loading = false;
        })
    };

    function closeWindow() {
        bodyRef.removeClass('ovh');
        close();
    };

    function login(credentials) {
        AuthService.login(credentials).then(function () {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);

                //$scope.currentUser = Session.username();

            },
            function () {
                //                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                $scope.wrongCredentials = true;
            });
    };

    function sendRegisterRequest() {
        $scope.model.loading = true;
        masterRegister.save({}, $scope.model.regForm, function (value, responseHeaders) {
            //success
            if (value.status == "error") {
                $scope.model.errorMessage = value.description;
                $scope.model.registerError = true;
            } else {
                $scope.model.showResgisterMessage = true;
            }
        }, function (httpResponse) {
            //fail
            console.log("Error: " + httpResponse)
        }).$promise.finally(function () {
            // called no matter success or failure
            $scope.model.loading = false;
        })
    };

    function registerOnceMore() {
        $scope.model.regForm = {
            kind_profile: "phys",
            email: "",
            password: "",
            name: "",
            sername: "",
            patronymic: ""
        };
        $scope.model.registerError = false;
    }
            }]);
