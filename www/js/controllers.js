'use strict';

angular.module('starter.controllers', ['firebase'])

.controller('DashCtrl', function ($scope, $firebase, fireBaseData) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.userThreads = sync.$asArray();

    var pos;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }
    }

    $scope.add = function (thread) {
        if (thread.title && thread.desc) {
            $scope.userThreads.$add({
                user: $scope.user,
                title: thread.title,
                desc: thread.desc,
                location: pos,
                date: 0,
                category: 'Soon to come'
            });
            thread.title = "";
            thread.desc = "";
        }
    }
})

.controller('ChatsCtrl', function ($scope, $firebase, fireBaseData) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/");
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.nearbyThreads = sync.$asArray();

    var pos;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
        }, function () {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
        } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
        }
    }

    $scope.add = function (thread) {
        if (thread.title && thread.desc) {
            $scope.nearbyThreads.$add({
                user: $scope.user,
                title: thread.title,
                desc: thread.desc,
                location: pos,
                date: 0,
                category: 'Soon to come'
            });
            thread.title = "";
            thread.desc = "";
        }
    }
    $scope.findDistance = function (thread) {
//        console.log(thread.location);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
            }, function () {
                handleNoGeolocation(true);
            });
        } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
        }

        function handleNoGeolocation(errorFlag) {
            if (errorFlag) {
                var content = 'Error: The Geolocation service failed.';
            } else {
                var content = 'Error: Your browser doesn\'t support geolocation.';
            }
        }
        var rad = function (x) {
            return x * Math.PI / 180;
        };
        var R = 6378137; // Earth’s mean radius in meter
        var dLat = rad(thread.location.D - pos.D);
        var dLong = rad(thread.location.k - pos.k);
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rad(thread.location.D)) * Math.cos(rad(pos.D)) *
            Math.sin(dLong / 2) * Math.sin(dLong / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        console.log(d);
    }

})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('FriendsCtrl', function ($scope, Friends) {
    $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
    $scope.friend = Friends.get($stateParams.friendId);
})

.controller('AccountCtrl', function ($scope, fireBaseData) {
    $scope.showLoginForm = false;
    $scope.user = fireBaseData.ref().getAuth();
    if (!$scope.user) {
        $scope.showLoginForm = true; //checks if the user has logged in; if true, the user is not logged in and the login form will be displayed
    }

    //Login method
    $scope.login = function (em, pwd) {
        fireBaseData.ref().authWithPassword({
            email: em,
            password: pwd
        }, function (error, authData) {
            if (error === null) {
                console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                $scope.user = fireBaseData.ref().getAuth();
                $scope.showLoginForm = false;
                $scope.login.em = null;
                $scope.login.pwd = null;
                $scope.$apply();
            } else {
                console.log("Error authenticating user: ", error);
            }
        });
    };

    //Logout method
    $scope.logout = function () {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
    };
})

.controller('ThreadViewController', function ($scope) {
    //    $scope.thread = $scope.feeds.get($stateParams.feedId);
    //    $scope.thread = $scope.feed.feedId;
});