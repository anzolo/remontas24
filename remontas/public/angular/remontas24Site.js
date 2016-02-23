var remontas24Site = angular.module('remontas24Site', ['ui.router', 'ngStorage', 'remBackend', 'angularModalService']);

remontas24Site.config(function ($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES, $httpProvider) {
    //$urlRouterProvider.otherwise("/");

    $stateProvider
        .state('remontas', {
            //            url: "/",
            templateUrl: "/remontas/public/templates/mainPage.html"
                //            templateUrl: "/remontas/public/templates/master.html"
                //            views: {
                //                "content": {
                //                    templateUrl: "/adminka/restricted/views/dashboard.html"
                //                }
                //            }
        })
        .state('remontas.searchPage', {
            url: "/",
            templateUrl: "/remontas/public/templates/searchMasters.html"
        })
        .state('remontas.profile', {
            url: "master/:id",
            templateUrl: "/remontas/public/templates/master.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('remontas.lk', {
            url: "lk",
            templateUrl: "/adminka/restricted/views/masters.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('remontas.compareList', {
            url: "compare",
            templateUrl: "/adminka/restricted/views/master.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('remontas.about', {
            url: "adminka/masters/edit/:id",
            templateUrl: "/adminka/restricted/views/master.html",
            controller: function ($scope) {
                $scope.mode = "edit";
            }
        })
        .state('remontas.oferta', {
            url: "adminka/masters/edit/:id",
            templateUrl: "/adminka/restricted/views/master.html",
            controller: function ($scope) {
                $scope.mode = "edit";
            }
        })

    //$httpProvider.interceptors.push('AuthInterceptor');

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

remontas24Site.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

remontas24Site.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    master: 'master'
})
