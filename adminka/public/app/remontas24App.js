var remontas24App = angular.module('remontas24App', ['ui.router', 'ngStorage', 'remBackend']);

remontas24App.config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
    //    $routeProvider
    //        .when('/adminka', {
    //            controller: 'adminkaMainPageController',
    //            templateUrl: '/adminka/restricted/views/adminka_page.html'
    //        })
    ////        .when('/adminka/masters', {
    ////            controller: 'adminkaMainPageController',
    ////            templateUrl: '/adminka/restricted/views/adminka_page.html'
    ////        })
    //        .otherwise({
    //            redirectTo: '/'
    //        });

    //    $httpProvider.interceptors.push([
    //    '$injector',
    //    function ($injector) {
    //            return $injector.get('AuthInterceptor');
    //    }
    //  ]);

    $urlRouterProvider.otherwise("/adminka/login");

    $stateProvider
        .state('adminka', {
            //url: "/adminka",
            templateUrl: "/adminka/restricted/views/adminka_page.html"
                //            views: {
                //                "content": {
                //                    templateUrl: "/adminka/restricted/views/dashboard.html"
                //                }
                //            }
        })
        .state('adminka.dashboard', {
            url: "/adminka",
            templateUrl: "/adminka/restricted/views/dashboard.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('adminka.masters', {
            url: "/adminka/masters",
            templateUrl: "/adminka/restricted/views/masters.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('adminka.masters.edit', {
            url: "/adminka/masters",
            templateUrl: "/adminka/restricted/views/masters.html",
            controller: function ($scope) {
                //                $scope.items = ["A", "List", "Of", "Items"];
            }
        })
        .state('login', {
            url: "/adminka/login",
            templateUrl: "/adminka/public/views/login.html"
        })

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
