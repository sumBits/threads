angular.module('starter.controllers', ['firebase'])

.controller('DashCtrl', function ($scope, $firebase) {
    var ref = new Firebase("https://threadstsa.firebaseio.com/");
    var sync = $firebase(ref);
    
    $scope.feeds = sync.$asArray();
    
    $scope.add = function(post) {
        $scope.feeds.$add({
            user: 'Guest',
            name: post.name,
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

.controller('AccountCtrl', function ($scope) {
    $scope.settings = {
        enableFriends: true
    };
});