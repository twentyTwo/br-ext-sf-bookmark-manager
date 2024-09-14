document.addEventListener('DOMContentLoaded', function() {
  const toggleBanner = document.getElementById('toggleBanner');
  const toggleBookmark = document.getElementById('toggleBookmark');

  chrome.storage.sync.get(['showBanner', 'showBookmark'], function(result) {
    toggleBanner.checked = result.showBanner !== false;
    toggleBookmark.checked = result.showBookmark !== false;
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

  // Add this: Update visited links when popup is opened
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "updateVisitedLinks"});
  });
});