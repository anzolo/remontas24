var remontas24Site = angular.module('remontas24Site', ['ui.router', 'ngStorage', 'remBackend', 'angularModalService', 'ui.mask', 'ngSanitize', 'ngFileUpload']);

remontas24Site.config(function($stateProvider, $urlRouterProvider, $locationProvider, USER_ROLES, $httpProvider) {
    // $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('remontas', {
            templateUrl: "/remontas/public/templates/mainPage.html",
            abstract: true,
            url: "/"
        })
        .state('remontas.searchPage', {
            url: "",
            templateUrl: "/remontas/public/templates/searchMasters.html"
        })
        .state('remontas.profile', {
            url: "master/:id",
            templateUrl: "/remontas/public/templates/master.html",
            controller: "masterController"
        })
        .state('remontas.lk', {
            url: "lk",
            templateUrl: "/remontas/public/templates/lk.html",
            controller: "lkController"
        })
        .state('remontas.compareList', {
            url: "compare",
            templateUrl: "/remontas/public/templates/comparison.html",
            controller: 'compareController'
        })
        .state('remontas.about', {
            url: "about",
            templateUrl: "/remontas/public/templates/about.html"
        })
        .state('remontas.check-reg-code', {
            url: "check-reg-code/:code",
            templateUrl: "/remontas/public/templates/checkRegCode.html",
            controller: 'checkRegCodeController'
        })
        .state('remontas.howWorks', {
            url: "how_works",
            templateUrl: "/remontas/public/templates/howWorks.html"
        })
        .state('remontas.agreement', {
            url: "agreement",
            templateUrl: "/remontas/public/templates/agreement.html"
        });

    $urlRouterProvider.otherwise(function($injector, $location) {
        console.log("Could not find " + $location.absUrl());
        $location.path('/');
    });

    $httpProvider.interceptors.push('AuthInterceptor');

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

remontas24Site.run(function(Session) {

    if (Session.favourites() == undefined) Session.initFavourites();

})

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