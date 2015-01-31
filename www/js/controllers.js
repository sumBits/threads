/**
    This file contains all of the angular controllers necessary for the application.
**/

'use strict';

angular.module('starter.controllers', ['firebase', 'ngCordova'])

// Controller for the main user threads tab
.controller('DashCtrl', function ($scope, $firebase, fireBaseData) {

    // Sets up the reference to the Firebase database
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/");
    var sync = $firebase(ref);

    var pos; // Stores the location of the user

    // Success callback for the getCurrentPosition function
    var onSuccess = function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
        console.log(pos);
    };

    // Error callback for the getCurrentPosition function
    function onError(error) {
        alert('code: ' + error.code + '\n' +
            'message: ' + error.message + '\n');
    }

    // Retrieves the user's current location
    navigator.geolocation.getCurrentPosition(onSuccess, onError);

    // Holds the user object that the user creates on login; is useful for checking the authentication
    $scope.user = fireBaseData.ref().getAuth();

    // Synchronizes local data with firebase data
    $scope.userThreads = sync.$asArray();

    // Debugging function to monitor status changes in the user threads data
    $scope.$watch('userThreads', function () {
        console.log("It changed");
    })


    // Adds a user thread object to the database
    $scope.add = function (userThread) {
        if (userThread.title && userThread.desc) {

            // Gets the current date to add to the user object
            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1; //January is 0
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd
            }
            if (mm < 10) {
                mm = '0' + mm
            }
            today = mm + '/' + dd + '/' + yyyy;

            // Adds the new user thread to the Firebase database
            $scope.userThreads.$add({
                    creator: $scope.user.password.email,
                    title: userThread.title,
                    desc: userThread.desc,
                    location: pos,
                    date: today
                })
                // Clears the form for creating a new user thread
            userThread.title = "";
            userThread.desc = "";
        }
    }

    // Allows users to follow threads
    $scope.joinThread = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        childRef.push($scope.user.password.email);
    }

    // Checks if a user is already following a thread or if he/she is the creator of that thread
    $scope.checkIfMember = function (thread) {
        var childRef = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread.$id + "/members");
        var exists = false;

        // Checks if current user is a member of the thread
        childRef.on('value', function (snapshot) {
            snapshot.forEach(function (secondSnapshot) {
                if ($scope.user.password.email === secondSnapshot.val()) {
                    exists = true;
                }
            });
        });

        // If not a member, checks if user is creator of the thread
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


// Controller for the nearby threads tab
.controller('NearbyCtrl', function ($scope, $firebase, fireBaseData) {

    // Establishes Firebase synchronization
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/categories");
    var sync = $firebase(ref);

    // Gets current user object
    $scope.user = fireBaseData.ref().getAuth();

    // Retrieves categories
    $scope.categories = sync.$asArray();

    // This function ensures that the app has a basic set of categories even if the database fails by setting up some default categories
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

// Controller for the posts inside of a nearby thread category
.controller('CategoryCtrl', function ($scope, localThreadsCopy, $stateParams, $firebase, fireBaseData, $location, $anchorScroll, $window) {

    // Gets the category the user is viewing
    $scope.category = $stateParams.categoryId;

    // Variable keeps track of whether to show a particular nearby thread post
    $scope.show;

    // Establishes Firebase connection
    var ref = new Firebase("https://threadstsa.firebaseio.com/nearbyThreads/categories/" + $stateParams.categoryId);
    var sync = $firebase(ref);

    // Gets user's current location
    var pos = navigator.geolocation.getCurrentPosition(function (position) {
        pos = new google.maps.LatLng(position.coords.latitude,
            position.coords.longitude);
    }, function (err) {
        console.log("There was an error getting current position.");
    });

    // Gets current user object
    $scope.user = fireBaseData.ref().getAuth();

    // Synchronizes local data with remote nearby thread data
    $scope.nearbyThreads = sync.$asArray();

    // Makes page scroll to the bottom on the addition of a new post
    $scope.$watch(function () {
        return localThreadsCopy.get().length;
    }, function () {
        $location.hash('bottom');
        $anchorScroll();

        console.log("scroll to bottom");
    });

    // Variable keeps a local copy of the posts within the user's 5km radius
    $scope.copy = [];

    // Adds a nearby thread post 
    $scope.add = function (nearbyThread) {

        // Retrieves current date and time
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0
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

        // Adds the post to the nearby thread on the database
        if (nearbyThread.desc) {
            $scope.nearbyThreads.$add({
                creator: $scope.user.password.email,
                desc: nearbyThread.desc,
                location: pos,
                date: today,
                votes: 0
            });
            // Clears the form to submit a post
            nearbyThread.desc = "";
        }
    }

    // Allows users to up-vote posts they agree with or find helpful
    $scope.addVote = function (thread) {
        thread.votes++;
        $scope.nearbyThreads.$save(thread);
    }

    // Distance finds the threads within 5km of the user's position
    $scope.findDistance = function () {
        //clears the local copy of threads to reprocess and recalculate
        localThreadsCopy.clear();

        // Error callback for getCurrentPosition function
        function onError(error) {
            alert('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
        };

        // Calculates distance between user's current position and a given thread using the distance formula
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

        // This function calculates the distance between the user and each of the nearby thread posts
        angular.forEach($scope.nearbyThreads, function (thread) {

            // Gets user's current location
            navigator.geolocation.getCurrentPosition(onSuccess, onError);

            // Success callback for getCurrentPosition function
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
        console.log($scope.copy);
        return $scope.copy;
    }
})

// Controller for user accounts and login
.controller('AccountCtrl', function ($scope, fireBaseData) {
    
    // Variable controlls if login form is displayed
    $scope.showLoginForm = false;
    
    // Gets user object
    $scope.user = fireBaseData.ref().getAuth();
    
    // If the user isn't logged in, the login form is displayed
    if (!$scope.user) {
        $scope.showLoginForm = true; 
    }

    // Login method
    $scope.login = function (em, pwd) {
        loginFunction(em, pwd);
    };

    // Logout method
    $scope.logout = function () {
        fireBaseData.ref().unauth();
        $scope.showLoginForm = true;
        $scope.hideCreateaccount = false;
    };

    // Create Account method
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

    // Logs a user in; function has been separated from above login function to enable modular usage in the create account function
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

// Controller for the chats inside a user thread
.controller('ThreadViewCtrl', function ($scope, $firebase, $stateParams) {
    
    // Gets the id of the user thread being viewed by the user
    var thread = $stateParams.threadId;
    console.log(thread);
    
    // Sets up Firebase synchronization
    var ref = new Firebase("https://threadstsa.firebaseio.com/userThreads/" + thread + "/comments/");
    var sync = $firebase(ref);
    $scope.comments = sync.$asArray();

    // Function enables users to post something to a user thread
    $scope.submitPost = function (post) {
        $scope.comments.$add({
            user: $scope.user.password.email,
            message: post.content,
            votes: 0
        });
        
        // Clears the submit form
        post.content = null;
        $scope.$apply();
    };

})