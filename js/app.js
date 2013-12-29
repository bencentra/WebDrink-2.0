// Have the navbar collapse (on mobile) after a page is selected
document.addEventListener("DOMContentLoaded", function() {
	jQuery('.navitem').click(function() {
		if (jQuery(window).width() <= 768)
			jQuery('#navbar').collapse("hide");
	});
}, true);

// Register the app with angular
var app = angular.module("WebDrink", ['ngRoute', 'ngAnimate']);

// Routes
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/machines', {
			templateUrl: 'partials/machines.html',
			controller: 'MachineCtrl'
		}).
		when('/drops', {
			templateUrl: 'partials/drops.html',
			controller: 'DropCtrl'
		}).
		otherwise({
			redirectTo: '/machines'
		});
}]);

// Drop Service - retrieve a user's drop history, etc.
app.factory("DropService", function($http, $window, $log) {
	return {
		// Get a user's drop history
		getDrops: function(uid, limit, offset, successCallback, errorCallback) {
			var url = "api/v1/users/getDrops/uid/"+uid;
			if (limit > 0) {
				url += "/limit/"+limit;
			}
			if (limit > 0 && offset > 0) {
				url += "/offset/"+offset;
			}
			$http.get(url).success(successCallback).error(errorCallback);
			//$log.log(url);
		}
	};
});

// Machine Service - Get and update data about the drink machines, machine stock, etc
app.factory("MachineService", function($http, $window, $log) {
	return {
		// Get a list of information about all drink machines
		getMachineAll: function(successCallback, errorCallback) {
			$http.get("api/v1/machines/getMachineAll").success(successCallback).error(errorCallback);
		},
		// Get the stock of all drink machines
		getStockAll: function(successCallback, errorCallback) {
			$http.get("api/v1/machines/getStockAll").success(successCallback).error(errorCallback);
		},
		// Get a list of all drink items
		getItemAll: function(successCallback, errorCallback) {
			$http.get("api/v1/machines/getItemAll").success(successCallback).error(errorCallback);
		},
		// Update the items and state of a slot in a drink machine
		updateSlot: function(data, successCallback, errorCallback) {
			var url = "api/v1/machines/updateSlot/uid/"+$window.current_user.uid+"/slotNum/"+data.slot_num+"/machineId/"+data.machine_id;
			if (data.hasOwnProperty("item_id"))
				url += "/itemId/"+data.item_id;
			if (data.hasOwnProperty("available")) 
				url += "/available/"+data.available;
			if (data.hasOwnProperty("status")) 
				url += "/status/"+data.status;
			$http.post(url, {}).success(successCallback).error(errorCallback);
		}
	};
});

/*
// Machine directive, template for drink machine tables
app.directive("machines", function() {
	return {
		restrict: "AE",
		templateUrl: "templates/machines.html"
	};
});

// Item List directive, template for item dropdown (for editing slots)
app.directive("itemlist", function() {
	return {
		restrict: "AE",
		templateUrl: "templates/itemList.html"
	};
});
*/

// Root controller - for shared data/services
function RootCtrl($scope, $log, $window, $location) {
	$scope.current_user = $window.current_user;
	$scope.location = $location;

	if ($scope.current_user.admin) {
		$scope.toggleAdminDropdown = function() {
			jQuery("#adminDropdown").dropdown('toggle');
		}
	}
}

// Controller for the machines page
function MachineCtrl($scope, $log, $timeout, MachineService) {
	// Initialize scope variables
	$scope.stock = {};			// Stock of all machines
	$scope.items = {};			// All existing drink items (admin only)
	$scope.machines = {};		// List of machines
	$scope.current_slot = {};	// Current slot being dropped/edited
	$scope.new_slot = {};		// New data for slot being edited
	$scope.delay = 0;			// Delay for dropping a drink
	$scope.message = "";		// Message to display after edit

	// Get the initial stock
	MachineService.getStockAll(
		function (response) { 
			if (response.result) {
				$scope.stock = response.data;
			}
			else {
				$log.log(response.message);
			}
		}, 
		function (error) { 
			$log.log(error); 
		}
	);
	// Get the initial machine list
	MachineService.getMachineAll(
		function (response) {
			if (response.result) {
				$scope.machines = response.data;
			}
			else {
				$log.log(response.message);
			}
		},
		function (error) {
			$log.log(error);
		}
	);
	// Admin only functions
	if ($scope.current_user.admin) {
		// Get all items (for editing a slot)
		MachineService.getItemAll(
			function (response) {
				if (response.result) {
					$scope.items = response.data;
					//$log.log($scope.items);
				}
				else {
					$log.log(response.message);
				}
			},
			function (error) {
				$log.log(error);
			}
		);
		// Lookup an item by id
		$scope.lookupItem = function (id) {
			for (var i = 0; i < $scope.items.length; i++) {
				if ($scope.items[i].item_id == id) {
					//$log.log("Found it: "+$scope.items[i].item_name);
					return $scope.items[i];
				}
			}
		}
		// Edit a slot
		$scope.editSlot = function (slot) {
			$scope.current_slot = slot;
			$scope.new_slot.slot_num = $scope.current_slot.slot_num;
			$scope.new_slot.machine_id = $scope.current_slot.machine_id;
			$scope.new_slot.item_id = $scope.current_slot.item_id;
			$scope.new_slot.available = Number($scope.current_slot.available);
			$scope.new_slot.status = $scope.current_slot.status;
			//$log.log("Edit:");
			//$log.log($scope.new_slot);
		};
		// Save a slot
		$scope.saveSlot = function () {
			MachineService.updateSlot($scope.new_slot, 
				function (response) {
					//$log.log(response);
					if (response.result) {
						$scope.current_slot.item_id = $scope.new_slot.item_id;
						$scope.current_slot.available = Number($scope.new_slot.available);
						$scope.current_slot.status = $scope.new_slot.status;
						$scope.current_slot.item_name = $scope.lookupItem($scope.new_slot.item_id).item_name;
						$scope.current_slot.item_price = $scope.lookupItem($scope.new_slot.item_id).item_price;
						$scope.message = "Edit success!";
					}
					else {
						//$log.log(response.message);
						$scope.message = response.message;
					}
					jQuery("#saveSlotModal").modal('show');
				},
				function (error) {
					$log.log(error);
				}
			);
		}
	}
	// Initialize modal data for dropping a drink
	$scope.selectDrink = function (slot) {
		$scope.current_slot = slot;
		$scope.delay = 0;
		//$log.log("Drop:");
		//$log.log($scope.current_slot);
	}; 
	// Drop a drink
	$scope.dropDrink = function() {
		$scope.reduceDelay();
	}
	// Count down the delay until a drink is dropped
	$scope.reduceDelay = function () {
		var i = $timeout(function () {
			if ($scope.delay == 0) {
				$timeout.cancel(i);
				jQuery("#dropModal").modal('hide');
			}
			else {
				$scope.delay -= 1;
				$scope.reduceDelay();
			}
		}, 1000);
	};
}

// Controller for the drops page
function DropCtrl($scope, $window, $log, DropService) {
	// Initialize scope variables
	$scope.drops = new Array();	// List of all user drops
	$scope.pagesLoaded = 0;		// How many pages of drops have been loaded
	$scope.dropsToLoad = 25;	// How many drops to load at a time
	$scope.done = false;

	// Get a user's drop history
	$scope.getDrops = function() {
		DropService.getDrops($window.current_user.uid, $scope.dropsToLoad ,$scope.pagesLoaded * $scope.dropsToLoad,
			function (response) {
				if (response.result) {
					$scope.drops.push.apply($scope.drops, response.data);
					$scope.pagesLoaded += 1;
				}
				else {
					$log.log(response.message);
				}
			},
			function (error) {
				$log.log(error);
			}
		);
	};

	// Get the first page of a user's drops
	$scope.getDrops();
}