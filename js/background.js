
// Listen to the tabs being updated and save each tab's latest URL local storage.
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // In the check below, we are only checking whether the ULR is not null. We are not checking changeInfo.status because,
    // we don't need that to minimize the hit count. The method will be called with non-null url once per navigation. Refreshes etc. will all be null as well.
    var listPageUrl = MasterTab.pages.listPage.url;
    if (changeInfo
            && !tab.pinned
            && changeInfo.url
            && changeInfo.url.substring(0, 4) == 'http'
            && changeInfo.url != listPageUrl) {

        // Keep inmemory until the page has finished loading
        MasterTab.session.tabs.add(tabId, changeInfo.url);

    } else if (!tab.pinned && changeInfo.status == 'complete'
            && MasterTab.session.tabs.get(tabId)
            && changeInfo.url != listPageUrl) {
        var tabInfo = MasterTab.session.tabs.get(tabId);
        tabInfo.title = tab.title;
        tabInfo.favIconUrl = tab.favIconUrl;
        MasterTab.history.save(tabInfo);
    }
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    if (!removeInfo.isWindowClosing && MasterTab.session.tabs.get(tabId)){
        MasterTab.session.tabs.remove(tabId);
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

                if (!tabInfo && tab.url.substring(0, 4) == 'http') {
                    var newTab = sessionTabs.add(tab.id, tab.url);
                    newTab.title = tab.title;
                    newTab.favIconUrl = tab.favIconUrl;
                    MasterTab.history.save(newTab);
                }
            }
        });
    }
});