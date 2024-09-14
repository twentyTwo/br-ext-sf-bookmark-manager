document.addEventListener('DOMContentLoaded', function() {
  const toggleBanner = document.getElementById('toggleBanner');
  const toggleBookmark = document.getElementById('toggleBookmark');
  const hideSandboxBanner = document.getElementById('hideSandboxBanner');
  const resetBookmarks = document.getElementById('resetBookmarks');
  const setupIcon = document.getElementById('setupIcon');
  const colorPicker = document.getElementById('colorPicker');
  const orgUrlInput = document.getElementById('orgUrl');
  const colorOptions = document.getElementById('colorOptions');
  const saveOrgColorBtn = document.getElementById('saveOrgColor');
  const mainOptions = document.getElementById('mainOptions');

  const colors = [
    '#2C3E50', '#34495E', '#1ABC9C', '#16A085', '#2980B9',
    '#3498DB', '#E74C3C', '#C0392B', '#8E44AD', '#9B59B6',
    '#2ECC71', '#27AE60', '#F39C12', '#E67E22', '#BDC3C7',
    '#7F8C8D', '#ECF0F1', '#95A5A6', '#F1C40F', '#D35400'
  ];
  

  let selectedColor = '';

  chrome.storage.local.get(['showBanner', 'showBookmark', 'hideSandboxBanner'], function(result) {
    toggleBanner.checked = result.showBanner !== false;
    toggleBookmark.checked = result.showBookmark !== false;
    hideSandboxBanner.checked = result.hideSandboxBanner === true;
  });

  colors.forEach(color => {
    const colorDiv = document.createElement('div');
    colorDiv.className = 'color-option';
    colorDiv.style.backgroundColor = color;
    colorDiv.addEventListener('click', () => {
      selectedColor = color;
      colorOptions.querySelectorAll('.color-option').forEach(option => {
        option.style.border = '1px solid #ccc';
      });
      colorDiv.style.border = '2px solid #000';
    });
    colorOptions.appendChild(colorDiv);
  });

  toggleBanner.addEventListener('change', function() {
    chrome.storage.local.set({showBanner: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBanner", show: toggleBanner.checked});
    });
  });

  toggleBookmark.addEventListener('change', function() {
    chrome.storage.local.set({showBookmark: this.checked});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBookmark", show: toggleBookmark.checked});
    });
  });

  hideSandboxBanner.addEventListener('change', function() {
    chrome.storage.local.set({hideSandboxBanner: this.checked});
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

  setupIcon.addEventListener('click', function() {
    toggleBanner.checked = false;
    chrome.storage.local.set({showBanner: false});
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBanner", show: false});
    });
    colorPicker.classList.toggle('show');
    mainOptions.classList.toggle('hidden');
    if (colorPicker.classList.contains('show')) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url) {
          const url = new URL(tabs[0].url);
          if (url.hostname.includes('salesforce.com') || url.hostname.includes('force.com')) {
            orgUrlInput.value = url.origin;
          }
        }
      });
    }
  });

  saveOrgColorBtn.addEventListener('click', function() {
    const orgUrl = orgUrlInput.value.trim();

    if (orgUrl && selectedColor) {
      chrome.storage.local.get({orgColors: {}}, function(result) {
        const orgColors = result.orgColors;
        orgColors[orgUrl] = selectedColor;
        chrome.storage.local.set({orgColors: orgColors}, function() {
          console.log('Org color saved');
          orgUrlInput.value = '';
          selectedColor = '';
          colorOptions.querySelectorAll('.color-option').forEach(option => {
            option.style.border = '1px solid #ccc';
          });
          colorPicker.classList.remove('show');
          mainOptions.classList.remove('hidden');
          toggleBanner.checked = true;
          chrome.storage.local.set({showBanner: true});
          chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "toggleBanner", show: true});
          });
        });
      });
    }
  });
});