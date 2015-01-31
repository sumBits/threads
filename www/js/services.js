/** 
    This file sets up the angular services required by the application.
**/

angular.module('starter.services', [])

// This service gives us a clean way to retrieve the general Firebase database reference
.factory('fireBaseData', function ($firebase) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/");
    return {
        ref: function () {
            return ref;
        }
    }
})

// This service allows for the management of the array of the threads that have been found to be within 5km of the user's location(see controllers findDistance() method for more info). 
.factory('localThreadsCopy', function ($firebase) {
    var localThreads = [];
    return {
        // This function pushes a thread to the array
        add: function (thread) {
            if (localThreads.indexOf(thread) === -1) {
                localThreads.push(thread);
            }
        },
        // This is a get method that serves the array
        get: function () {
            return localThreads;
        },
        // This function removes a thread from the array
        remove: function (thread) {
            if (localThreads.indexOf(thread) !== -1) {
                localThreads.splice(localThreads.indexOf(thread), 1);
            }
        },
        // This function clears the contents of the array
        clear: function () {
            localThreads = [];
        }
    };
});