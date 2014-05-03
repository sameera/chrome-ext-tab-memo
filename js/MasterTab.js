var MasterTab = {
    session: {
        id: new Date().toISOString(),
        startTime: new Date(),
    },
    pages: {
        listPage: {
            name: 'list.html',
            url: chrome.extension.getURL('list.html'),
            open: function () {
                MasterTab.pages.open(this);
            },
        }
    }
};

MasterTab.getTabKey = function (tabId) {
    return this.id + '_' + tabId;
};

MasterTab.pages.open = function (page) {
    var optionsUrl = page.url;
    chrome.tabs.query({}, function (extensionTabs) {
        var found = false;
        for (var i = 0; i < extensionTabs.length; i++) {
            if (optionsUrl == extensionTabs[i].url) {
                found = true;
                console.log("tab id: " + extensionTabs[i].id);
                chrome.tabs.reload(extensionTabs[i].id, null, null);
            }
        }
        if (found == false) {
            chrome.tabs.create({ url: page.url });
        }
    });
};

MasterTab.session.tabs = {
    get: function(tabId){
        return this['_' + tabId];
    },

    add: function(nTabId, sUrl){
            var tabInfo = {
                session: MasterTab.session.id,
                storageKey: MasterTab.getTabKey(nTabId),
                url: sUrl,
                title: sUrl,
                favIconUrl: null,
            }
            this['_' + nTabId] = tabInfo;
            return tabInfo;
        },

    remove: function(tabId) {
        var key = MasterTab.getTabKey(tabId);
        MasterTab.history.remove(key);
        delete this['_' + tabId];
    }
};

MasterTab.history = {
    save: function(tabInfo) {
        var data = {};
        data[tabInfo.storageKey] = tabInfo;

        chrome.storage.local.set(data, function () {
            console.log('Saved %s to storage', tabInfo.url);
            MasterTab.pages.listPage.open();
        });
    },

    remove: function (key) {
        chrome.storage.local.remove(key, function () {
            console.log('Removed %s from storage', key);
            MasterTab.pages.listPage.open();
        });
    },

    getAll: function(callback) {
        chrome.storage.local.get(
			null,
            callback);
    },

    clear: function () {
        chrome.storage.local.clear(function () {
            console.log('Tab history was cleared.');
        });
    },
};