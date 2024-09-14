document.addEventListener('DOMContentLoaded', function() {
  const toggleBanner = document.getElementById('toggleBanner');
  const toggleBookmark = document.getElementById('toggleBookmark');
  const hideSandboxBanner = document.getElementById('hideSandboxBanner');
  const resetBookmarks = document.getElementById('resetBookmarks');

  chrome.storage.sync.get(['showBanner', 'showBookmark', 'hideSandboxBanner'], function(result) {
    toggleBanner.checked = result.showBanner !== false;
    toggleBookmark.checked = result.showBookmark !== false;
    hideSandboxBanner.checked = result.hideSandboxBanner === true;
  });

  toggleBanner.addEventListener('change', function() {
    chrome.storage.sync.set({showBanner: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBanner", show: toggleBanner.checked});
    });
  });

  toggleBookmark.addEventListener('change', function() {
    chrome.storage.sync.set({showBookmark: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBookmark", show: toggleBookmark.checked});
    });
  });

  hideSandboxBanner.addEventListener('change', function() {
    chrome.storage.sync.set({hideSandboxBanner: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "hideSandboxBanner", hide: hideSandboxBanner.checked});
    });
  });

  resetBookmarks.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset all bookmarks? This action cannot be undone.')) {
      chrome.storage.local.set({bookmarks: []}, function() {
        console.log('All bookmarks have been reset');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {action: "resetBookmarks"});
        });
      });
    }
  });

  // Add this: Update visited links when popup is opened
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "updateVisitedLinks"});
  });
});