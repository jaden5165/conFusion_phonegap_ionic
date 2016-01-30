'use strict';

angular.module('conFusion.controllers', [])
    .controller('AppCtrl', ['$scope', '$timeout', '$ionicModal', '$localStorage', function($scope, $timeout, $ionicModal, $localStorage){

        $scope.loginData = $localStorage.getObject('userinfo', '{}');
        $scope.reservation = {};

        //Create login modal
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.loginform = modal;
        });

        // Triggered in the reserve modal to close it
        $scope.closeLogin = function() {
            $scope.loginform.hide();
        };

        // Open the reserve modal
        $scope.login = function() {
            $scope.loginform.show();
        };

        // Perform the reserve action when the user submits the reserve form
        $scope.doLogin = function() {

            if($scope.loginData.username !== undefined)
            {
                console.log('Log in with ' + $scope.loginData.username + ' ' + $scope.loginData.password);
                $localStorage.storeObject('userinfo', $scope.loginData);

                // Simulate a reservation delay. Remove this and replace with your reservation
                // code if using a server system
                $timeout(function() {
                    $scope.closeLogin();
                }, 1000);                    
            }
            else{
                alert("Please insert name and password");
            }

        };    

        $ionicModal.fromTemplateUrl('templates/reserve.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.reserveform = modal;
        });

        // Triggered in the reserve modal to close it
        $scope.closeReserve = function() {
            $scope.reserveform.hide();
        };

        // Open the reserve modal
        $scope.reserve = function() {
            $scope.reserveform.show();
        };

        // Perform the reserve action when the user submits the reserve form
        $scope.doReserve = function() {
            console.log('Doing reservation', $scope.reservation);

            // Simulate a reservation delay. Remove this and replace with your reservation
            // code if using a server system
            $timeout(function() {
                $scope.closeReserve();
            }, 1000);
        };    

    }])

    .controller('MenuController', ['$scope', 'dishes', 'favoriteFactory', 'baseURL',  '$ionicListDelegate', '$ionicPlatform', '$cordovaLocalNotification', '$cordovaToast', function($scope, dishes, favoriteFactory, baseURL, $ionicListDelegate, $ionicPlatform, $cordovaLocalNotification, $cordovaToast) {

        $scope.baseURL = baseURL;
        $scope.tab = 1;
        $scope.filtText = '';
        $scope.showDetails = false;
        $scope.showMenu = false;
        $scope.message = "Loading ...";

        $scope.dishes = dishes;


        $scope.select = function(setTab) {
            $scope.tab = setTab;

            if (setTab === 2) {
                $scope.filtText = "appetizer";
            }
            else if (setTab === 3) {
                $scope.filtText = "mains";
            }
            else if (setTab === 4) {
                $scope.filtText = "dessert";
            }
            else {
                $scope.filtText = "";
            }
        };

        $scope.isSelected = function (checkTab) {
            return ($scope.tab === checkTab);
        };

        $scope.toggleDetails = function() {
            $scope.showDetails = !$scope.showDetails;
        };

        $scope.addFavorite = function(index){
            console.log("index is " + index);
            favoriteFactory.addToFavorites(index);
            $ionicListDelegate.closeOptionButtons();   
            
            $ionicPlatform.ready(function(){
                
               $cordovaLocalNotification.schedule({
                   id: 1,
                   title: "Added Favourite",
                   text: $scope.dishes[index].name
               }).then(function(){
                   console.log("Added Favorite " + $scope.dishes[index].name);
               }, function(){
                   console.log("Fail to add Favorite");                   
               });
                
                $cordovaToast.show("Added Favorite " + $scope.dishes[index].name, 'long', 'center') //long = show longer period
                .then(function(){
                    //success
                }, function(){
                    //error
                });
            });
        };
    }])

    .controller('FavoritesController', ['$scope', 'dishes', 'favorites', 'favoriteFactory', 'baseURL', '$ionicListDelegate', '$ionicPopup', function ($scope, dishes, favorites, favoriteFactory, baseURL, $ionicListDelegate, $ionicPopup) {

        $scope.baseURL = baseURL;
        $scope.shouldShowDelete = false;

        $scope.favorites = favorites;

        $scope.dishes = dishes;

        console.log($scope.dishes, $scope.favorites);

        $scope.toggleDelete = function () {
            $scope.shouldShowDelete = !$scope.shouldShowDelete;
            console.log($scope.shouldShowDelete);
        };

        $scope.deleteFavorite = function (index) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm Delete',
                template: 'Are you sure you want to delete this item?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    console.log('Ok to delete');
                    favoriteFactory.deleteFromFavorites(index);
                } else {
                    console.log('Canceled delete');
                }
            });
            $scope.shouldShowDelete = false;

        };
    }])

    .filter('favoriteFilter', function () {
    return function (dishes, favorites) {
        var out = [];
        for (var i = 0; i < favorites.length; i++) {
            for (var j = 0; j < dishes.length; j++) {
                if (dishes[j].id === favorites[i].id)
                    out.push(dishes[j]);
            }
        }
        return out; 
    };
})

    .controller('ContactController', ['$scope', function($scope) {

        $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };

        var channels = [{value:"tel", label:"Tel."}, {value:"Email",label:"Email"}];

        $scope.channels = channels;
        $scope.invalidChannelSelection = false;

    }])

    .controller('FeedbackController', ['$scope', 'feedbackFactory', function($scope,feedbackFactory) {

        $scope.sendFeedback = function() {

            console.log($scope.feedback);

            if ($scope.feedback.agree && ($scope.feedback.mychannel == "")) {
                $scope.invalidChannelSelection = true;
                console.log('incorrect');
            }
            else {
                $scope.invalidChannelSelection = false;
                feedbackFactory.save($scope.feedback);
                $scope.feedback = {mychannel:"", firstName:"", lastName:"", agree:false, email:"" };
                $scope.feedback.mychannel="";
                $scope.feedbackForm.$setPristine();
                console.log($scope.feedback);
            }
        };
    }])

    .controller('DishDetailController', ['$scope', '$stateParams', 'dish', 'menuFactory', 'baseURL', '$ionicPopover', 'favoriteFactory', '$ionicModal', '$filter', function($scope, $stateParams, dish, menuFactory, baseURL, $ionicPopover, favoriteFactory, $ionicModal, $filter) {


        console.log("$stateParams is:" );
        console.log($stateParams);


        $scope.baseURL = baseURL;
        $scope.dish = {};
        $scope.comment = {};
        $scope.showDish = false;
        $scope.message="Loading ...";

        $scope.dish = dish;

        $ionicPopover.fromTemplateUrl("templates/dish-detail-popover.html", {
            scope: $scope
        }).then(function(popover){
            $scope.popover = popover;
        });

        $scope.showMore = function($event)
        {
            $scope.popover.show($event);
        };

        $scope.addToFavorites = function(){
            console.log("index is " + $scope.dish.id);
            $scope.index = parseInt($stateParams.id,10);
            console.log("index:" + $scope.index);
            favoriteFactory.addToFavorites($scope.dish.id);
            $scope.popover.hide();
        };

        $ionicModal.fromTemplateUrl('templates/dish-comment.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.commentForm = modal;
        });

        // Triggered in the reserve modal to close it
        $scope.closeComment = function() {
            $scope.commentForm.hide();
            $scope.popover.hide();
        };

        // Open the reserve modal
        $scope.addComment = function() {
            console.log("add comment")
            $scope.commentForm.show();
        };

        $scope.submitComment = function(){
            var date =  $filter('date')(Date.now(), "MMM. dd, yyyy");
            var commentResult = {
                "rating": $scope.comment.rating,
                "comment": $scope.comment.text,
                "author": $scope.comment.name,
                "date": date
            };
            console.log("Rating:" + $scope.comment.rating);
            console.log("Name:" + $scope.comment.text);
            console.log("Comment:" + $scope.comment.name);
            console.log("Date:" + date);
            $scope.dish.comments.push(commentResult);
            $scope.closeComment();
        };
    }])

    .controller('DishCommentController', ['$scope', 'menuFactory', function($scope,menuFactory) {

        $scope.mycomment = {rating:5, comment:"", author:"", date:""};

        $scope.submitComment = function () {

            $scope.mycomment.date = new Date().toISOString();
            console.log($scope.mycomment);

            $scope.dish.comments.push($scope.mycomment);
            menuFactory.getDishes().update({id:$scope.dish.id},$scope.dish);

            $scope.commentForm.$setPristine();

            $scope.mycomment = {rating:5, comment:"", author:"", date:""};
        };
    }])

// implement the IndexController and About Controller here

    .controller('IndexController', ['$scope', 'dish', 'leader', 'baseURL', 'promotion', function($scope, dish, leader, baseURL, promotion) {

        console.log(baseURL);
        $scope.baseURL = baseURL;
        $scope.leader = leader;
        $scope.showDish = false;
        $scope.message="Loading ...";
        $scope.dish = dish;
        $scope.promotion = promotion;
    }])

    .controller('AboutController', ['$scope', 'leaders', 'baseURL', function($scope, leaders, baseURL) {
        $scope.baseURL = baseURL;
        $scope.leaders = leaders;
        console.log($scope.leaders);

    }])
;
