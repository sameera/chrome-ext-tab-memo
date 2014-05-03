var masterTabApp = angular
                    .module('MasterTabExtension', [])
                    .config([
                        '$compileProvider',
                        function( $compileProvider ) {   
                            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension):/);
                            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|chrome-extension):/);
                        }
                    ]);

masterTabApp.controller('TabListController', function ($scope) {
    $scope.savedTabs = [];

    chrome.storage.local.get(
			null,
			function (items) {
			    $scope.$apply(function () {
			        $scope.savedTabs = items;
			    })
			});

    $scope.clearHistory = function () {
        chrome.storage.local.clear(function () {
            console.log('Tab history was cleared.');
        });
    };
});