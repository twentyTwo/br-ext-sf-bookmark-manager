document.addEventListener('DOMContentLoaded', function() {
  const toggleBanner = document.getElementById('toggleBanner');
  const toggleRecentlyVisited = document.getElementById('toggleRecentlyVisited');

  chrome.storage.sync.get(['showBanner', 'showRecentlyVisited'], function(result) {
    toggleBanner.checked = result.showBanner !== false;
    toggleRecentlyVisited.checked = result.showRecentlyVisited !== false;
  });

  toggleBanner.addEventListener('change', function() {
    chrome.storage.sync.set({showBanner: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBanner", show: toggleBanner.checked});
    });
  });

  toggleRecentlyVisited.addEventListener('change', function() {
    chrome.storage.sync.set({showRecentlyVisited: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleRecentlyVisited", show: toggleRecentlyVisited.checked});
    });
  });

  // Add this: Update visited links when popup is opened
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "updateVisitedLinks"});
  });
});