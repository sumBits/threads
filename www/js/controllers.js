'use strict';

angular.module('starter.controllers', ['firebase'])

.controller('DashCtrl', function ($scope, $firebase) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/feeds/");
    var sync = $firebase(ref);

    $scope.feeds = sync.$asArray();

    $scope.add = function (post) {
        //fix later, doesn't work yet
        /*
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = new google.maps.LatLng(position.coords.latitude,
                        position.coords.longitude);
                }, function () {
                    handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleNoGeolocation(false);
            }
        }

        function handleNoGeolocation(errorFlag) {
            if (errorFlag) {
                var content = 'Error: The Geolocation service failed.';
            } else {
                var content = 'Error: Your browser doesn\'t support geolocation.';
            }
        }*/
        $scope.feeds.$add({
            user: 'Guest',
            title: post.title,
            desc: post.desc,
            location: 0,
            date: 0,
            category: 'Soon to come'
        });
    }
})

.controller('ChatsCtrl', function ($scope, Chats) {
    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
        Chats.remove(chat);
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
//    $scope.settings = {
//        enableFriends: true
//    };
    
    $scope.showLoginForm = false; 
    if (!$scope.user) {
        $scope.showLoginForm = true; //checks if the user has logged in; if true, the user is not logged in and the login form will be displayed
    }
    $scope.user = fireBaseData.ref().getAuth();
    
    //Login method
    $scope.login = function(em, pwd){
        console.log(em);
        console.log(pwd);
        fireBaseData.ref().authWithPassword({
            email: em,
            password: pwd
        }, function(error, authData) {
            if(error === null){
                console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                $scope.user = fireBaseData.ref().getAuth();
                $scope.showLoginForm = false;
                $scope.$apply();
            } else {
                console.log("Error authenticating user: ", error);
            }
        });
    };
    
    //Logout method
    $scope.logout = function(){
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
    };
    
});