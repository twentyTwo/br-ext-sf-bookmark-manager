let showBanner = true;
let showBookmark = true;

function addSalesforceBanner() {
  console.log('addSalesforceBanner called');

  function setHeaderBackground() {
    const headerElement = document.querySelector('span[role="navigation"].button-container-a11y[aria-label="Global Header"]');
    
    if (!headerElement) {
      console.log('Header element not found, will retry');
      return false;
    }

    console.log('Header element found, setting background color');
    const url = window.location.href.toLowerCase();
    
    if (url.includes('sandbox') && url.includes('full')) {
      headerElement.style.backgroundColor = 'orange';
    } else if (url.includes('sandbox')) {
      headerElement.style.backgroundColor = 'green';
    } else if (url.includes('dev-ed')) {
      headerElement.style.backgroundColor = 'blue';
    } else {
      headerElement.style.backgroundColor = 'darkred';
    }

    addBookmarkItem();
    return true;
  }

  // Try to set the background immediately
  if (setHeaderBackground()) {
    console.log('Background set successfully');
    return;
  }

  // If immediate attempt fails, set up a MutationObserver
  const observer = new MutationObserver((mutations, obs) => {
    if (setHeaderBackground()) {
      console.log('Background set successfully after DOM mutation');
      obs.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('MutationObserver started');

  // Set up a timeout as a fallback
  setTimeout(() => {
    if (setHeaderBackground()) {
      console.log('Background set successfully after timeout');
      observer.disconnect();
    } else {
      console.error('Failed to set background color after timeout');
      observer.disconnect();
    }
  }, 5000); // 5 second timeout
}

function addBookmarkItem() {
  if (!showBookmark) return;

  const notificationIcon = document.querySelector('.slds-global-actions__item_notification');
  if (notificationIcon && !document.querySelector('.custom-bookmark-item')) {
    
    const bookmarkItemHtml = `
      <li class="slds-global-actions__item slds-dropdown-trigger slds-dropdown-trigger_click custom-bookmark-item" style="position: relative; top: -2px;">
        <div class="forceHeaderButton">
          <button aria-expanded="false" aria-haspopup="true" type="button" class="slds-button slds-button_icon slds-button_icon-container slds-button_icon-small slds-global-actions__item-action">
            <div class="tooltipTrigger tooltip-trigger uiTooltip">
              <lightning-icon class="slds-button__icon slds-global-header__icon">
                <svg focusable="false" data-key="bookmark" aria-hidden="true" viewBox="0 0 18.46 18.46" class="slds-icon slds-icon_x-small" style="fill: #808080; height: 16px;">
                  <path d="M13.845 18.46l-4.615-4.615c-.215-.215-.565-.215-.78 0L3.845 18.46c-.43.43-1.165.125-1.165-.48V1.845C2.68 1.125 3.265.54 3.985.54h10.49c.72 0 1.305.585 1.305 1.305v16.135c0 .605-.735.91-1.165.48z"></path>
                </svg>
              </lightning-icon>
              <span role="tooltip" class="tooltip-invisible">Bookmarks</span>
            </div>
          </button>
        </div>
      </li>
    `;
    notificationIcon.insertAdjacentHTML('afterend', bookmarkItemHtml);
    
    // Add click event listener to the new bookmark item
    const bookmarkItem = document.querySelector('.custom-bookmark-item');
    bookmarkItem.addEventListener('click', handleBookmarkItemClick);
  }
}

function handleBookmarkItemClick(event) {
  event.preventDefault();
  console.log('Custom bookmark item clicked');
  toggleBookmarkPanel();
}

function toggleBookmarkPanel() {
  let panel = document.querySelector('.bookmark-panel');
  if (panel) {
    panel.remove();
  } else {
    createBookmarkPanel();
  }
}

function createBookmarkPanel() {
  const panelHtml = `
    <div class="bookmark-panel container" style="position: fixed; top: 50px; right: 10px; width: 300px; background: white; border: 1px solid #d8dde6; border-radius: 0.25rem; box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16); z-index: 9999;">
      <div class="panel-header" style="padding: 0.5rem; border-bottom: 1px solid #d8dde6; display: flex; justify-content: space-between; align-items: center;">
        <button type="button" class="add-bookmark-btn slds-button slds-button_neutral" style="font-size: 0.8rem; padding: 0 0.5rem;">
          Bookmark this page
        </button>
        <button type="button" class="close-btn slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Close" title="Close bookmark panel" style="margin-left: 0.5rem;">
          <svg class="slds-button__icon" aria-hidden="true" viewBox="0 0 52 52" width="14" height="14">
            <path fill="#706e6b" d="M31.6 25.8l13.1-13.1c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0L27.4 21.6c-.4.4-1 .4-1.4 0L12.9 8.4c-.6-.6-1.5-.6-2.1 0l-2.1 2.1c-.6.6-.6 1.5 0 2.1l13.1 13.1c.4.4.4 1 0 1.4L8.7 40.3c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L26 31.4c.4-.4 1-.4 1.4 0l13.1 13.1c.6.6 1.5.6 2.1 0l2.1-2.1c.6-.6.6-1.5 0-2.1L31.6 27.2c-.4-.4-.4-1 0-1.4z"/>
          </svg>
          <span class="slds-assistive-text">Close</span>
        </button>
      </div>
      <div class="panel-content scrollable" style="max-height: 300px; overflow-y: auto; padding: 0.5rem;">
        <ul id="bookmarkList" style="list-style-type: none; padding: 0; margin: 0;"></ul>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  // Add event listeners
  const closeBtn = document.querySelector('.bookmark-panel .close-btn');
  closeBtn.addEventListener('click', () => {
    document.querySelector('.bookmark-panel').remove();
  });

  const addBookmarkBtn = document.querySelector('.bookmark-panel .add-bookmark-btn');
  addBookmarkBtn.addEventListener('click', addCurrentPageBookmark);

  // Load and display existing bookmarks
  displayBookmarks();
}

function addCurrentPageBookmark() {
  const url = window.location.href;
  const title = document.title;
  const orgUrl = getCurrentOrgUrl();
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks;
    if (!bookmarks.some(bookmark => bookmark.url === url)) {
      bookmarks.push({url, title, orgUrl});
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark added');
        displayBookmarks();
        showConfirmationMessage('Bookmark added successfully');
      });
    } else {
      console.log('Bookmark already exists');
      showConfirmationMessage('Bookmark already exists');
    }
  });
}

function displayBookmarks() {
  const bookmarkList = document.getElementById('bookmarkList');
  const currentOrgUrl = getCurrentOrgUrl();
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    const bookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
    
    if (bookmarks.length === 0) {
      bookmarkList.innerHTML = '<li class="no-bookmarks">No bookmarks for this org yet.</li>';
    } else {
      bookmarkList.innerHTML = bookmarks.map((bookmark, index) => `
        <li class="bookmark-item">
          <a href="${bookmark.url}" class="bookmark-link" title="${bookmark.url}">
            <span class="bookmark-title">${bookmark.title}</span>
          </a>
          <div class="bookmark-actions">
            <button class="edit-bookmark" data-url="${bookmark.url}" title="Edit bookmark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#0070d2"/>
              </svg>
            </button>
            <button class="remove-bookmark" data-url="${bookmark.url}" title="Remove bookmark">
              <svg width="12" height="12" viewBox="0 0 52 52">
                <path fill="#c23934" d="M31.6 25.8l13.1-13.1c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0L27.4 21.6c-.4.4-1 .4-1.4 0L12.9 8.4c-.6-.6-1.5-.6-2.1 0l-2.1 2.1c-.6.6-.6 1.5 0 2.1l13.1 13.1c.4.4.4 1 0 1.4L8.7 40.3c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L26 31.4c.4-.4 1-.4 1.4 0l13.1 13.1c.6.6 1.5.6 2.1 0l2.1-2.1c.6-.6.6-1.5 0-2.1L31.6 27.2c-.4-.4-.4-1 0-1.4z"/>
              </svg>
            </button>
          </div>
        </li>
      `).join('');

      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-bookmark').forEach(button => {
        button.addEventListener('click', function(e) {
          e.stopPropagation();
          removeBookmark(this.dataset.url);
        });
      });

      // Add event listeners for edit buttons
      document.querySelectorAll('.edit-bookmark').forEach(button => {
        button.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          const bookmarkItem = this.closest('.bookmark-item');
          const titleSpan = bookmarkItem.querySelector('.bookmark-title');
          titleSpan.contentEditable = true;
          titleSpan.focus();
        });
      });

      // Add event listeners for editable titles
      document.querySelectorAll('.bookmark-title').forEach(titleSpan => {
        titleSpan.addEventListener('blur', function() {
          this.contentEditable = false;
          updateBookmarkTitle(this.textContent, this.closest('.bookmark-link').href);
        });
        titleSpan.addEventListener('keydown', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            this.blur();
          }
        });
      });
    }
  });
}

function updateBookmarkTitle(newTitle, url) {
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks;
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === url);
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].title = newTitle;
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark title updated');
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

function updateBannerVisibility() {
  const headerElement = document.querySelector('span[role="navigation"].button-container-a11y[aria-label="Global Header"]');
  if (headerElement) {
    if (showBanner) {
      // Set the background color based on the current URL
      const url = window.location.href.toLowerCase();
      if (url.includes('sandbox') && url.includes('full')) {
        headerElement.style.backgroundColor = 'orange';
      } else if (url.includes('sandbox')) {
        headerElement.style.backgroundColor = 'green';
      } else if (url.includes('dev-ed')) {
        headerElement.style.backgroundColor = 'blue';
      } else {
        headerElement.style.backgroundColor = 'darkred';
      }
    } else {
      headerElement.style.backgroundColor = ''; // This will reset to the original color
    }
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleBanner") {
    showBanner = request.show;
    updateBannerVisibility();
  } else if (request.action === "toggleBookmark") {
    showBookmark = request.show;
    if (showBookmark) {
      addBookmarkItem();
    } else {
      const bookmarkItem = document.querySelector('.custom-bookmark-item');
      if (bookmarkItem) {
        bookmarkItem.remove();
      }
    }
  } else if (request.action === "resetBookmarks") {
    // Clear the bookmarks in the panel if it's open
    const bookmarkList = document.getElementById('bookmarkList');
    if (bookmarkList) {
      bookmarkList.innerHTML = '<li class="no-bookmarks">No bookmarks for this org yet.</li>';
    }
    console.log('Bookmarks have been reset');
  }
});

chrome.storage.sync.get(['showBanner', 'showBookmark'], function(result) {
  showBanner = result.showBanner !== false;
  showBookmark = result.showBookmark !== false;
  
  // Ensure the DOM is ready before calling addSalesforceBanner
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addSalesforceBanner();
  } else {
    document.addEventListener('DOMContentLoaded', addSalesforceBanner);
  }
});

// Add a listener for URL changes
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, re-running addSalesforceBanner');
    addSalesforceBanner();
    addBookmarkItem(); // Updated this line
  }
}).observe(document, {subtree: true, childList: true});

function getCurrentOrgUrl() {
  const url = new URL(window.location.href);
  return url.origin; // This will return the full org URL (e.g., https://myorg.my.salesforce.com)
}

function showConfirmationMessage(message) {
  const confirmationMessage = document.createElement('div');
  confirmationMessage.className = 'sf-extension-confirmation-message';
  confirmationMessage.textContent = message;
  document.body.appendChild(confirmationMessage);

  // Force a reflow to trigger the transition
  confirmationMessage.offsetHeight;

  // Add the 'show' class to trigger the fade-in
  confirmationMessage.classList.add('show');

  setTimeout(() => {
    confirmationMessage.classList.remove('show');
    setTimeout(() => {
      confirmationMessage.remove();
    }, 300); // Wait for the fade-out transition to complete before removing
  }, 3000);
}