chrome.runtime.onInstalled.addListener(function() {
  console.log('Salesforce Bookmark Manager installed');
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openOrgBookmarks") {
    chrome.tabs.create({
      url: chrome.runtime.getURL(`orgBookmarks.html?org=${request.orgUrl}`)
    });
  }
  // ... other message handlers ...
});