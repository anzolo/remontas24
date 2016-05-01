remontas24Site.controller('authRegFormController', ['$scope', '$rootScope', 'close', 'AuthService', 'AUTH_EVENTS', '$state', '$document', 'masterRegister', function ($scope, $rootScope, close, AuthService, AUTH_EVENTS, $state, $document, masterRegister) {

    $scope.model = {};

    $scope.model.activeTab = "auth";
    $scope.model.wrongCredentials = false;
    $scope.model.registerError = false;

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

    var bodyRef = angular.element($document[0].body)
    bodyRef.addClass('ovh');



    $scope.$on(AUTH_EVENTS.loginSuccess, function () {
        bodyRef.removeClass('ovh');
        close();
        $state.go('remontas.lk');
    });

    /////////////////////////////////////////////////////////////////////////////////

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
        masterRegister.save({}, $scope.model.regForm, function (value, responseHeaders) {
            //success
            if (value.status == "error") {
                $scope.model.errorMessage = value.description;
                $scope.model.registerError = true;
            }
        }, function (httpResponse) {
            //fail
            console.log("Error: " + httpResponse)
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
