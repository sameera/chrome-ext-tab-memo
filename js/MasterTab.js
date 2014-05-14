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
    },
    config: {
        TABID_PREFIX : 'T_',
    },
};

MasterTab.isSupportedPage = function(url) {
	return url.substring(0, 4) == 'http'
		&& url != MasterTab.pages.listPage.url;
}	

MasterTab.getTabKey = function (tabId) {
    return this.session.id + '_' + tabId;
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
        return this[MasterTab.config.TABID_PREFIX + tabId];
    },

    add: function(nTabId, sUrl){
            var tabInfo = {
                session: MasterTab.session.id,
                storageKey: MasterTab.getTabKey(nTabId),
                url: sUrl,
                title: sUrl,
                favIconUrl: null,
				lastUpdatd: new Date(),
            }
            this[MasterTab.config.TABID_PREFIX + nTabId] = tabInfo;
            return tabInfo;
        },

    remove: function(tabId) {
        var key = MasterTab.getTabKey(tabId);
        MasterTab.history.remove(key);
        delete this[MasterTab.config.TABID_PREFIX + tabId];
    }
};

MasterTab.history = {
	storage: chrome.storage.local,
	
    save: function(tabInfo) {
        var data = {};
        data[tabInfo.storageKey] = tabInfo;

        this.storage.set(data, function () {
            console.log('Saved %s to storage', tabInfo.url);
            MasterTab.pages.listPage.open();
        });
    },

    remove: function (key) {
        this.storage.remove(key, function () {
            console.log('Removed %s from storage', key);
            MasterTab.pages.listPage.open();
        });
    },

    getAll: function(callback) {
        this.storage.get(
			null,
            callback);
    },

    clear: function () {
        // Remove the items that are in memory
        var tabs = MasterTab.session.tabs;
        for (var id in tabs) {
            if (tabs.hasOwnProperty(id) && id.substring(0, MasterTab.config.TABID_PREFIX.length) == MasterTab.config.TABID_PREFIX) {
                tabs.remove(id.substring(MasterTab.config.TABID_PREFIX.length));
            }
        };
        // Clear the history
        this.storage.clear(function () {
            console.log('Tab history was cleared.');
        });
    },
};