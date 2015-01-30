'use strict';

angular.module('starter.controllers', ['firebase', 'ngCordova'])
    .controller('DashCtrl', function ($scope, $firebase, fireBaseData) {
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
                var today = new Date();
                var dd = today.getDate();
                var mm = today.getMonth() + 1; //January is 0!
                var yyyy = today.getFullYear();

                if (dd < 10) {
                    dd = '0' + dd
                }

                if (mm < 10) {
                    mm = '0' + mm
                }

                today = mm + '/' + dd + '/' + yyyy;

                $scope.userThreads.$add({
                    creator: $scope.user.password.email,
                    title: userThread.title,
                    desc: userThread.desc,
                    location: pos,
                    date: today
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
        if (snapshot.val() == null) {
            ref.set({
                Food: "thread",
                Entertainment: "thread",
                Shopping: "thread",
                Weather: "thread",
                Education: "thread"
            });
        }
    });

})

.controller('CategoryCtrl', function ($scope, localThreadsCopy, $stateParams, $firebase, fireBaseData, $location, $anchorScroll, $window) {
    $scope.category = $stateParams.categoryId;
    $scope.show;
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/categories/" + $stateParams.categoryId);
    var pos = navigator.geolocation.getCurrentPosition(function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
    }, function (err) {
        console.log("There was an error getting current position.");
    });
    var sync = $firebase(ref);

    $scope.user = fireBaseData.ref().getAuth();

    $scope.nearbyThreads = sync.$asArray();

    $scope.$watch(function () {
            return $scope.nearbyThreads.length;
        },function () {
            $location.hash('bottom');
            $anchorScroll();

            console.log("scroll to bottom");
        }
    );

    $scope.copy = [];

    $scope.add = function (nearbyThread) {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        var HH = today.getHours();
        var MM = today.getMinutes();
        var SS = today.getSeconds();

        if (dd < 10) {
            dd = '0' + dd
        }
        if (HH < 10) {
            HH = '0' + HH
        }
        if (MM < 10) {
            MM = '0' + MM
        }
        if (SS < 10) {
            SS = '0' + SS
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd + ' ' + HH + ':' + MM + ':' + SS;
        console.log(today);


        if (nearbyThread.desc) {
            $scope.nearbyThreads.$add({
                creator: $scope.user.password.email,
                desc: nearbyThread.desc,
                location: pos,
                date: today,
                votes: 0
            });
            nearbyThread.desc = "";
        }
    }
    $scope.addVote = function (thread) {
        thread.votes++;
        $scope.nearbyThreads.$save(thread);
    }

    $scope.findDistance = function () {
        localThreadsCopy.clear();
        // onError Callback receives a PositionError object
        //
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        };


        var distance = function (pos, thread) {
            var show;
            var rad = function (degrees) {
                return degrees * (Math.PI / 180); //convert degrees to radians
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
            var id = thread.id;

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2); //the distance between two coordinates
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var d = R * c; //to km
            //            console.log(thread.desc + " distance is + " + d);
            var dis = 5;
            if (d < dis) {
                show = true;
            } else {
                show = false;
            }
            return show;
        };
        angular.forEach($scope.nearbyThreads, function (thread) {
            navigator.geolocation.getCurrentPosition(onSuccess, onError);

            function onSuccess(position) {
                pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                $scope.show = distance(pos, thread);
                console.log($scope.show);
                if ($scope.show) {
                    localThreadsCopy.add(thread);
                    $scope.copy = localThreadsCopy.get();
                } else {
                    localThreadsCopy.remove(thread);
                }

            };
        });
        //        console.log($scope.copy);
        return $scope.copy;
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
    var thread = $stateParams.threadId;
    console.log(thread);
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread + "/comments/");
    var sync = $firebase(ref);
    $scope.comments = sync.$asArray();

    $scope.submitPost = function (post) {
        $scope.comments.$add({
            user: $scope.user.password.email,
            message: post.content,
            votes: 0
        });
        post.content = null;
        $scope.$apply();
    };

})