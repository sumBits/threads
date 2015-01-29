// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'firebase', 'ngCordova'])

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
})

.config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html",
        controller: function ($scope, $firebase, fireBaseData, $window, $location) {
            $scope.user = fireBaseData.ref().getAuth();
            console.log($scope.user + "User");
            if ($scope.user) {
                console.log("Logged In");
                $scope.showThreadAdd = false; //checks if the user has logged in; if true, the user is not logged in and the login form will be displayed
                //                $scope.$apply();
                var ref = null;
                if (sync) {
                    sync.$destroy;
                }
                var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
                var sync = $firebase(ref);

            } else {
                $scope.showThreadAdd = true;
                console.log("logged out.");
                //                $scope.$apply();
            }
            $scope.$on("$locationChangeSuccess", function (args) {
                $scope.user = fireBaseData.ref().getAuth();
                if ($scope.user) {
                        $scope.showLogin = false;
                        $scope.showThreadAdd = false;
                        console.log("Logged In");
                    } else {
                        $scope.showLogin = true;
                        $scope.showThreadAdd = true;
                        console.log("Logged Out");
                    }
                console.log("Location is " + $location.url());

                if ($location.url() === '/tab/dash' && $scope.user) {
                    $window.location.reload();
                }

            })

        }

    })

    // Each tab has its own nav history stack:

    .state('tab.dash', {
            url: '/dash',
            views: {
                'tab-dash': {
                    templateUrl: 'templates/tab-dash.html',
                    controller: 'DashCtrl'
                }
            }
        })
        .state('tab.thread', {
            url: '/userThreads/:threadId',
            views: {
                'tab-dash': {
                    templateUrl: 'templates/tab-thread.html',
                    controller: 'ThreadViewCtrl'
                }
            }
        })

    .state('tab.nearby', {
            url: '/nearby',
            views: {
                'tab-nearby': {
                    templateUrl: 'templates/tab-nearby.html',
                    controller: 'NearbyCtrl'
                }
            }
        })
        .state('tab.nearby-category', {
            url: '/nearby/:categoryId',
            views: {
                'tab-nearby': {
                    templateUrl: 'templates/category.html',
                    controller: 'CategoryCtrl'
                }
            }
        })

    .state('tab.account', {
            url: '/account',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-account.html',
                    controller: 'AccountCtrl'
                }
            }
        })
        .state('tab.license', {
            url: '/license',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-license.html',
                    controler: 'AccountCtrl'
                }
            }
        })
        .state('tab.form', {
            url: '/form',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-form.html',
                    controler: 'AccountCtrl'
                }
            }
        })
        .state('tab.rules', {
            url: '/rules',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-rules.html',
                    controler: 'Account Ctrl'

                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

});