document.addEventListener('DOMContentLoaded', function() {
  const toggleBanner = document.getElementById('toggleBanner');
  const toggleBookmark = document.getElementById('toggleBookmark');
  const hideSandboxBanner = document.getElementById('hideSandboxBanner');
  const setupIcon = document.getElementById('setupIcon');
  const colorPicker = document.getElementById('colorPicker');
  const orgUrlInput = document.getElementById('orgUrl');
  const colorOptions = document.getElementById('colorOptions');
  const saveOrgColorBtn = document.getElementById('saveOrgColor');
  const mainOptions = document.getElementById('mainOptions');
  const showAllBookmarksBtn = document.getElementById('showAllBookmarks');

  // Check if all elements exist
  if (!toggleBanner || !toggleBookmark || !hideSandboxBanner || !setupIcon || !colorPicker || 
      !orgUrlInput || !colorOptions || !saveOrgColorBtn || !mainOptions || !showAllBookmarksBtn) {
    console.error('One or more elements not found in the DOM');
    return;
  }

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
    const hide = this.checked;
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "hideSandboxBanner", hide: hide});
    });
    chrome.storage.sync.set({hideSandboxBanner: hide});
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

  // Load saved state
  chrome.storage.sync.get(['hideSandboxBanner'], function(result) {
    hideSandboxBanner.checked = result.hideSandboxBanner === true;
  });

  function updateOrgName() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getOrgName" }, function(response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            document.getElementById('orgName').textContent = "Unable to fetch org name";
          } else if (response && response.orgName) {
            document.getElementById('orgName').textContent = response.orgName;
          } else {
            document.getElementById('orgName').textContent = "Unknown org";
          }
        });
      } else {
        document.getElementById('orgName').textContent = "Not a Salesforce org";
      }
    });
  }

  function updateSandboxOption(isSandbox) {
    const sandboxOption = document.querySelector('.sandbox-option');
    if (sandboxOption) {
      if (isSandbox) {
        sandboxOption.classList.remove('fade-out');
        hideSandboxBanner.disabled = false;
      } else {
        sandboxOption.classList.add('fade-out');
        hideSandboxBanner.checked = false;
        hideSandboxBanner.disabled = true;
        chrome.storage.sync.set({hideSandboxBanner: false});
      }
    }
  }

  // Call updateOrgName immediately when the popup opens
  updateOrgName();

  function displayBookmarks() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0] && tabs[0].url) {
        const currentOrgUrl = new URL(tabs[0].url).origin;
        chrome.storage.local.get({bookmarks: []}, function(result) {
          const bookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
          const bookmarkList = document.createElement('ul');
          bookmarkList.className = 'bookmark-list';

          if (bookmarks.length === 0) {
            bookmarkList.innerHTML = '<li class="no-bookmarks">No bookmarks for this org yet.</li>';
          } else {
            bookmarks.forEach(bookmark => {
              const bookmarkItem = document.createElement('li');
              bookmarkItem.className = 'bookmark-item';
              bookmarkItem.innerHTML = `
                <a href="${bookmark.url}" class="bookmark-link" title="${bookmark.url}" target="_blank">
                  ${bookmark.title}
                </a>
                <button class="remove-bookmark" data-url="${bookmark.url}">×</button>
              `;
              bookmarkList.appendChild(bookmarkItem);
            });
          }

          const existingBookmarkList = document.querySelector('.bookmark-list');
          if (existingBookmarkList) {
            existingBookmarkList.replaceWith(bookmarkList);
          } else {
            document.getElementById('mainOptions').appendChild(bookmarkList);
          }

          // Add event listeners for remove buttons
          document.querySelectorAll('.remove-bookmark').forEach(button => {
            button.addEventListener('click', function(e) {
              e.stopPropagation();
              removeBookmark(this.dataset.url);
            });
          });
        });
      }
    });
  }

  function removeBookmark(url) {
    chrome.storage.local.get({bookmarks: []}, function(result) {
      let bookmarks = result.bookmarks;
      bookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark removed');
        displayBookmarks();
      });
    });
  }

  // Call displayBookmarks when the popup opens
  displayBookmarks();

  showAllBookmarksBtn.addEventListener('click', function() {
    const allBookmarksUrl = chrome.runtime.getURL('allBookmarks.html');
    chrome.tabs.create({ url: allBookmarksUrl });
  });
});