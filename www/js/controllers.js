'use strict';

angular.module('starter.controllers', ['firebase'])

.controller('DashCtrl', function ($scope, $firebase, fireBaseData) {

    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.userThreads = sync.$asArray();

    var pos;
    //fix later, doesn't work yet

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

    $scope.add = function (userThread) {
        $scope.userThreads.$add({
            creator: $scope.user.password.email,
            title: userThread.title,
            desc: userThread.desc,
            location: pos,
            date: 0,
            category: 'Soon to come'
        });

        userThread.title = "";
        userThread.desc = "";
    }

    $scope.joinThread = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        childRef.push($scope.user.password.email);
    }

    $scope.checkIfMember = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        var exists = false;
        childRef.on('value', function (snapshot) {
            snapshot.forEach(function (secondSnapshot) {
                if ($scope.user.password.email === secondSnapshot.val()) {
                    exists = true;
                }
            });
        });
        if (!exists) {
            childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/creator");
            childRef.on('value', function (snapshot) {
                if($scope.user.password.email === snapshot.val()){
                    exists = true;
                }
            });
        }
        return exists;
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

.controller('FriendDetailCtrl', function ($scope, $stateParams, Friends, $ionicPopup) {
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
        if (em && pwd) {
            fireBaseData.ref().authWithPassword({
                email: em,
                password: pwd
            }, function (error, authData) {
                if (error === null) {
                    $scope.showError = false;
                    $scope.hideCreateaccount = true;
                    console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
                    $scope.user = fireBaseData.ref().getAuth();
                    $scope.showLoginForm = false;
                    $scope.login.em = null;
                    $scope.login.pwd = null;
                    $scope.$apply();
                } else {
                    console.log("Error authenticating user: ", error);
                    $scope.showError = true;
                    $scope.$apply();
                }
            });
        } else {
            $scope.showError = true;
            $scope.$apply();
        };
    };

    //Logout method
    $scope.logout = function () {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
        $scope.hideCreateaccount = false;
    };
    
    //create account please help 
    /*
$scope.showCreateaccount = function() {
    var myPopup = $ionicPopup.show({
        template: <input type="text" ng-model="help username???",
        template: <input type="email" ng-model="idk what this is",
        template: <input type="passowrd" ng-model="serioiusly what is this",
        title: 'Create Account',
        scope: $scope,
         buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.data.wifi) {
            //don't allow the user to close unless he enters wifi password
            e.preventDefault();
          } else {
            return $scope.data.wifi;
          }
        }
      }
    ]
  });
 */       
})

.controller('ThreadViewController', function ($scope) {
    //    $scope.thread = $scope.feeds.get($stateParams.feedId);
    //    $scope.thread = $scope.feed.feedId;
});