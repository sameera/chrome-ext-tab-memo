var masterTabApp = angular
                    .module('MasterTabExtension', [])
                    .config([
                        '$compileProvider',
                        function( $compileProvider ) {   
                            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
                            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension|data):/);
                        }
                    ]);

masterTabApp.controller('TabListController', function ($scope) {

    var backgroundPage = chrome.extension.getBackgroundPage();
    var masterTab = backgroundPage.MasterTab;

    $scope.savedTabs = [];

    masterTab.history.getAll(function (items) {		
		var savedTabs = [];
		for (var i in items) {
			savedTabs[savedTabs.length] = items[i];
		};
		
		savedTabs.sort(function(t1, t2) {
			if (t1.lastUpdated < t2.lastUpdated)
				return -1;
			else if (t1.lastUpdated > t2.lastUpdated)
				return 1;
			else
				return 0;
		});
		
		$scope.$apply(function () {
			$scope.savedTabs = savedTabs;
		})
	});
	
	$scope.openAndRemove = function(url, key) {
		var backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.MasterTab.pages.open({url: url});
		backgroundPage.MasterTab.history.remove(key);
	}

    $scope.clearHistory = function () {
        var backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.MasterTab.history.clear();
    }

    $scope.removeFromHistory = function (key) {
        var backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.MasterTab.history.remove(key);
		return false;
    };
});