//Functions


/**
* Loads a theme based on an option
* Params:
*  - option - string - theme name
* Returns: None
* Author: hudson
* Date: 01 17 16
**/
function loadTheme(option){
    switch(option){
        case "purple":
            // if theme is purple, modify nav and swap theme css files
            $(".navbar").removeClass("navbar-default").addClass("navbar-inverse");
            //Swapping out theme css files
            $('#purpleThemeCSS').removeAttr('disabled');
            $('#pinkThemeCSS').attr('disabled', 'disabled');
            
            break;
        case "pink":
            // if theme is pink, modify nav and swap theme css files
            $(".navbar").removeClass("navbar-inverse").addClass("navbar-default");
            //Swapping out theme css files
            $('#purpleThemeCSS').attr('disabled', 'disabled');
            $('#pinkThemeCSS').removeAttr('disabled');
            
            break;
    }
}



// Register the app with angular
var app = angular.module("WebDrink", ['ngRoute', 'ngSanitize','ngStorage']);

// Alert directive - quickly display a Bootstrap Alert
// See $scope.Alert in RootCtrl for parameters details
app.directive("alert", function() {
	return {
		restrict: "E",
		templateUrl: "templates/alert.html",
		scope: {
			alert: "=data"
		}
	};
});

// Drops directive - table showing a user's drop history/combined drop log
// See $scope.DropsTable in RootCtrl for parameters details
app.directive("drops", function() {
	return {
		restrict: "E",
		templateUrl: "templates/drops_table.html",
		scope: {
			drops: "=data"
		}
	};
});

// Machine directive - table for displaying a drink machine's stock
app.directive("machine", function() {
	return {
		restrict: "E",
		templateUrl: "templates/machine_table.html",
		scope: {
			machine: "=data",
      user: "=",
      select: "=",
      edit: "="
		}
	};
});

// Modal directive - Outline of a basic Bootstrap modal dialog
app.directive("modal", function() {
  return {
    restrict: "E",
    templateUrl: "templates/modal.html",
    transclude: true,
    scope: {
       modal: "=data",
       submit: "=",
       close: "="
    }
  };
});

// Root controller - for shared data/services
app.controller("RootCtrl", ['$scope', '$log', '$window', '$location', '$localStorage', function ($scope, $log, $window, $location, $localStorage) {
	// Current user data
	$scope.current_user = $window.current_user;
	$scope.current_user.credits = parseInt($scope.current_user.credits);
	// Current page
	$scope.location = $location;
	// Machine data
	$scope.machines = {
		1: {
			"id": 1,
			"name": "littledrink",
			"display_name": "Little Drink",
			"alias": "ld"
		},
		2: {
			"id": 2,
			"name": "bigdrink",
			"display_name": "Big Drink",
			"alias":"d"
		},
		3: {
			"id": 3,
			"name": "snack",
			"display_name": "Snack",
			"alias":"s"
		}
	};

	// Default data for any alert directives
	$scope.Alert = function(config) {
		if (typeof config === 'undefined') config = {};
		this.show = (config.hasOwnProperty("show")) ? config.show : false;
		this.closeable = (config.hasOwnProperty("closeable")) ? config.closeable : true;
		this.type = (config.hasOwnProperty("type")) ? config.type : "alert-warning";
		this.message = (config.hasOwnProperty("message")) ? config.message : "default";
    this.title = (config.hasOwnProperty("title")) ? config.title : "";
	};
	$scope.Alert.prototype = {
		toggle: function() {
			this.show = !this.show;
		}
	};

	// Default data for any drops_table directives
	$scope.DropsTable = function(drops, title, config) {
		if (typeof config === 'undefined') config = {};
		this.drops = drops;
		this.title = title;
		this.config = {
			showUser: (config.hasOwnProperty("showUser")) ? config.showUser : false,
			showMore: (config.hasOwnProperty("showMore")) ? config.showMore : true,
			isCondensed: (config.hasOwnProperty("isCondensed")) ? config.isCondensed : false
		};
	};

  // Default data for any modal directives
  $scope.Modal = function(config) {
    if (typeof config === 'undefined') config = {};
    this.id = (config.hasOwnProperty("id")) ? config.id : "myModal";
    this.title = (config.hasOwnProperty("title")) ? config.title : "My Modal";
    this.cancel_btn = (config.hasOwnProperty("cancel_btn")) ? new $scope.ModalBtn(config.cancel_btn) : new $scope.ModalBtn();
    this.submit_btn = (config.hasOwnProperty("submit_btn")) ? new $scope.ModalBtn(config.submit_btn) : false;
  };

  $scope.ModalBtn = function(config) {
    if (typeof config === 'undefined') config = {};
    this.type = (config.hasOwnProperty("type")) ? config.type : "default";
    this.text = (config.hasOwnProperty("text")) ? config.text : "Cancel";
  }

	// Activate the admin dropdown menu
	if ($scope.current_user.admin) {
		$scope.toggleAdminDropdown = function() {
			jQuery("#adminDropdown").dropdown('toggle');
		}
	}

	// See if a user can afford a drink
	$scope.canAfford = function (price) {
		if (Number($scope.current_user.credits) < Number(price)) 
			return false;
		return true;
	};
    $scope.$storage = $localStorage.$default({
          theme: 'purple'
        });
    $scope.getTheme = function(){
        var storedTheme= $localStorage.theme;
        if(storedTheme == "purple"){
            loadTheme("purple");
        }
        else if(storedTheme == "pink"){
            loadTheme("pink");
        }
    }
    $scope.getTheme();
	
}]);



