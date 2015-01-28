'use strict';

angular.module('starter.controllers', ['firebase', 'ngCordova'])
    .controller('DashCtrl', function ($scope, $firebase, fireBaseData, $cordovaGeolocation) {
        var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
        var sync = $firebase(ref);
        var pos;
        var onSuccess = function (position) {
            pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            console.log(pos);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError);

        $scope.user = fireBaseData.ref().getAuth();

        $scope.userThreads = sync.$asArray();

        $scope.$watch('userThreads', function () {
            console.log("It changed");
        })


        $scope.add = function (userThread) {
            if (userThread.title && userThread.desc) {
                $scope.userThreads.$add({
                    creator: $scope.user.password.email,
                    title: userThread.title,
                    desc: userThread.desc,
                    location: pos,
                    date: 0,
                    category: 'Soon to come'
                })
                userThread.title = "";
                userThread.desc = "";
            }
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
                    if ($scope.user.password.email === snapshot.val()) {
                        exists = true;
                    }
                });
            }
            return exists;
        }
    })

.controller('NearbyCtrl', function ($scope, $firebase, fireBaseData) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/categories");
    var sync = $firebase(ref);
    $scope.user = fireBaseData.ref().getAuth();
    $scope.categories = sync.$asArray();
    ref.on('value', function (snapshot) {
        console.log(snapshot.val());
        if (snapshot.val() == null) {
            ref.set({
                Food: "thread",
                Entertainment: "thread",
                Shopping: "thread",
                Weather: "thread",
                Gasoline: "thread"
            });
        }
    });

})

.controller('CategoryCtrl', function ($scope, $stateParams, $firebase, fireBaseData) {
    console.log($stateParams.categoryId);
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/categories/" + $stateParams.categoryId);
    var pos;
    var onSuccess = function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.nearbyThreads = sync.$asArray();

    $scope.add = function (nearbyThread) {

        if (nearbyThread.title && nearbyThread.desc) {
            $scope.nearbyThreads.$add({
                creator: $scope.user.password.email,
                title: nearbyThread.title,
                desc: nearbyThread.desc,
                location: pos,
                date: 0,
                category: 'Soon to come'
            });
            nearbyThread.title = "";
            nearbyThread.desc = "";
        }
    }
    $scope.findDistance = function (thread) {
        //        console.log(thread.location);
        var pos;
        var onSuccess = function (position) {
            pos = new google.maps.LatLng(position.coords.latitude,
                position.coords.longitude);
            distance(pos, thread);
        };

        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        }
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
        var distance = function (pos, thread) {
            var rad = function (x) {
                return x * (Math.PI / 180); //convert degrees to radians
            };
            var R = 6371; // Earth's mean radius in meters
            var lat1 = thread.location.k;
            var lat2 = pos.k;
            var lon1 = thread.location.D;
            var lon2 = pos.D;
            var φ1 = rad(lat1); //lat1
            var φ2 = rad(lat2); //lat2
            var Δφ = rad(lat2 - lat1); //lat
            var Δλ = rad(lon2 - lon1); //lon

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2); //the distance between two coordinates
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var d = R * c; //to km
            var dis = 1;
            if (d < dis) {
                console.log(thread.title + "less than " + dis);
                return false;
            } else {
                console.log(thread.title + " more than " + dis);
                return true;
            }
        }
    }

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
        loginFunction(em, pwd);
    };

    //Logout method
    $scope.logout = function () {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
        $scope.hideCreateaccount = false;
    };


    $scope.createAccount = function (em, pwd) {
        fireBaseData.ref().createUser({
            email: em,
            password: pwd
        }, function (error) {
            if (error == null) {
                console.log("User created successfully.");
                loginFunction(em, pwd);
            } else {
                console.log("Error creating user: ", error);
            }
        });
    };

    var loginFunction = function (em, pwd) {
        if (em && pwd) {
            fireBaseData.ref().authWithPassword({
                email: em,
                password: pwd
            }, function (error, authData) {
                if (error === null) {
                    $scope.showError = false;
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
        };
    }

})

.controller('ThreadViewCtrl', function ($scope, $firebase, $stateParams) {
    var a = $stateParams.threadId;
    console.log(a);
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + a + "/comments/");
    var sync = $firebase(ref);
    $scope.comments = sync.$asArray();

    $scope.submitPost = function (post) {
        $scope.comments.$add({
            user: $scope.user.password.email,
            message: post.content,
            votes: 0
        });
    };
    $scope.addVote = function (comment) {
        comment.votes++;
        $scope.comments.$save(comment);
    }
})