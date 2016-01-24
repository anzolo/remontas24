var remontas24App = angular.module('remontas24App', ['ngRoute', 'ngStorage']);

remontas24App.config(function ($routeProvider, $locationProvider, USER_ROLES, $httpProvider) {
    $routeProvider
        .when('/adminka', {
            controller: 'adminkaMainPageController',
            templateUrl: '/adminka/restricted/views/adminka_page.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    //    $httpProvider.interceptors.push([
    //    '$injector',
    //    function ($injector) {
    //            return $injector.get('AuthInterceptor');
    //    }
    //  ]);

    $httpProvider.interceptors.push('AuthInterceptor');

    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');
});

remontas24App.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});

remontas24App.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    master: 'master'
})
