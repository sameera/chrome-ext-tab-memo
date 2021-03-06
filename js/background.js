
// Listen to the tabs being updated and save each tab's latest URL local storage.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // In the check below, we are only checking whether the ULR is not null. We are not checking changeInfo.status because,
    // we don't need that to minimize the hit count. The method will be called with non-null url once per navigation. Refreshes etc. will all be null as well.
    var listPageUrl = MasterTab.pages.listPage.url;
    if (changeInfo
            && !tab.pinned
            && changeInfo.url
            && MasterTab.isSupportedPage(changeInfo.url)) {

        // Keep inmemory until the page has finished loading
        MasterTab.session.tabs.add(tabId, changeInfo.url);

    } else if (!tab.pinned && changeInfo.status == 'complete'
            && MasterTab.session.tabs.get(tabId)
            && changeInfo.url != listPageUrl) {
        var tabInfo = MasterTab.session.tabs.get(tabId);
        tabInfo.title = tab.title;
        tabInfo.favIconUrl = tab.favIconUrl;
		tabInfo.lastUpdated = new Date();
        MasterTab.history.save(tabInfo);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (!removeInfo.isWindowClosing && MasterTab.session.tabs.get(tabId)){
        MasterTab.session.tabs.remove(tabId);
    }
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
	var tabCache = MasterTab.session.tabs;
	var savedTab = tabCache.get(activeInfo.tabId);
	var isUnsavedTab = !savedTab;
		
	if (isUnsavedTab || (!savedTab.thumbUrl || 5 < Utils.Date.diff(savedTab.lastUpdated, new Date(), 'm'))) {
		chrome.tabs.get(activeInfo.tabId, function(tab){		
			if (!tab.pinned && tab.status === 'complete' && MasterTab.isSupportedPage(tab.url)) {
				
				var capturer = function (tabInfo) {
					chrome.tabs.captureVisibleTab(null, {}, function(imageUrl) {
						console.log('Screen Capture for %s is saved to %s', tabInfo.storageKey, imageUrl);
						tabInfo.thumbUrl = imageUrl;
						tabInfo.lastUpdated = new Date();
						MasterTab.history.save(tabInfo);
					});
				};
				
				if (isUnsavedTab) {
					MasterTab.session.tabs.find(tab.url, function(t) { capturer(t); });
				} else {
					capturer(savedTab);
				}	
			}
		});
	}
});

chrome.browserAction.onClicked.addListener(function (tab) {
    MasterTab.pages.listPage.open();
})

chrome.alarms.create('cron-opentabs', { delayInMinutes: 1, periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name == 'cron-opentabs') {
        // Update all open tabs
        chrome.tabs.query({ pinned: false, status: 'complete' }, function (tabs) {
            for (var key in tabs) {
                var tab = tabs[key];
                var sessionTabs = MasterTab.session.tabs;
                var tabInfo = sessionTabs.get(tab.id);

                if (!tabInfo && MasterTab.isSupportedPage(tab.url)) {
					MasterTab.session.tabs.find(tab.url, function(tabInfo) {
						if (!tabInfo)
							tabInfo = sessionTabs.add(tab.id, tab.url);
						tabInfo.title = tab.title;
						tabInfo.favIconUrl = tab.favIconUrl;
						MasterTab.history.save(tabInfo);
					});
				}
            }
        });
    }
});