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
    <div class="bookmark-panel container" style="position: absolute; top: 50px; right: 10px; width: 300px; background: white; border: 1px solid #d8dde6; border-radius: 0.25rem; box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16);">
      <div class="panel-header" style="padding: 0.5rem; border-bottom: 1px solid #d8dde6; display: flex; justify-content: space-between; align-items: center;">
        <h2 style="font-size: 1rem; font-weight: bold;">Bookmarks</h2>
        <div>
          <button type="button" class="add-bookmark-btn slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Add Bookmark" title="Add Bookmark">
            <svg class="slds-button__icon" aria-hidden="true" viewBox="0 0 52 52">
              <path d="M30 29h16.5c.8 0 1.5.7 1.5 1.5v3c0 .8-.7 1.5-1.5 1.5H30v16.5c0 .8-.7 1.5-1.5 1.5h-3c-.8 0-1.5-.7-1.5-1.5V35H7.5c-.8 0-1.5-.7-1.5-1.5v-3c0-.8.7-1.5 1.5-1.5H24V12.5c0-.8.7-1.5 1.5-1.5h3c.8 0 1.5.7 1.5 1.5V29z"/>
            </svg>
          </button>
          <button type="button" class="close-btn slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Close">
            <svg class="slds-button__icon" aria-hidden="true" viewBox="0 0 52 52">
              <path d="M31 25.4l13-13.1c.6-.6.6-1.5 0-2.1l-2-2.1c-.6-.6-1.5-.6-2.1 0L26.8 21.2c-.4.4-1 .4-1.4 0L12.3 8c-.6-.6-1.5-.6-2.1 0l-2.1 2.1c-.6.6-.6 1.5 0 2.1l13.1 13.1c.4.4.4 1 0 1.4L8 39.9c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L25.3 31c.4-.4.4-1 0-1.4z"/>
            </svg>
          </button>
        </div>
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
      });
    } else {
      console.log('Bookmark already exists');
    }
  });
}

function displayBookmarks() {
  const bookmarkList = document.getElementById('bookmarkList');
  const currentOrgUrl = getCurrentOrgUrl();
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    const bookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
    
    if (bookmarks.length === 0) {
      bookmarkList.innerHTML = '<li style="padding: 0.5rem;">No bookmarks for this org yet.</li>';
    } else {
      bookmarkList.innerHTML = bookmarks.map((bookmark, index) => `
        <li style="padding: 0.5rem; border-bottom: 1px solid #d8dde6;">
          <a href="${bookmark.url}" style="color: #0070d2; text-decoration: none; display: block; margin-right: 20px;">${bookmark.title}</a>
          <button class="remove-bookmark" data-url="${bookmark.url}" style="background: none; border: none; color: #c23934; cursor: pointer; float: right; margin-top: -20px;">×</button>
        </li>
      `).join('');

      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-bookmark').forEach(button => {
        button.addEventListener('click', function() {
          removeBookmark(this.dataset.url);
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