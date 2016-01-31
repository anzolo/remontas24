var remontas24Site = angular.module('remontas24Site', ['ngRoute', 'ngStorage', 'remBackend']);

remontas24Site.config(function ($routeProvider, $locationProvider, USER_ROLES, $httpProvider) {
    $routeProvider
    //        .when('/adminka', {
    //            controller: 'adminkaMainPageController',
    //            templateUrl: '/adminka/restricted/views/adminka_page.html'
    //        })
        .otherwise({
        redirectTo: '/'
    });

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
