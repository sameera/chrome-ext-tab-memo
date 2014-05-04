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
		$scope.$apply(function () {
			$scope.savedTabs = items;
		})
	});

    $scope.clearHistory = function () {
        var backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.MasterTab.history.clear();
    }

    $scope.removeFromHistory = function (key) {
        var backgroundPage = chrome.extension.getBackgroundPage();
        backgroundPage.MasterTab.history.remove(key);
    };
});