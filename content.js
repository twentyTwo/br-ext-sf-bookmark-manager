let showBookmark = true;
let extensionId = chrome.runtime.id;

// Add these variables at the top of your file
let draggedItem = null;
let placeholder = document.createElement('li');
placeholder.className = 'placeholder';

function addSalesforceBanner() {
  console.log('addSalesforceBanner called');

  function setHeaderBackground() {
    const headerElement = document.querySelector('span[role="navigation"].button-container-a11y[aria-label="Global Header"]');
    
    if (!headerElement) {
      console.log('Header element not found, will retry');
      return false;
    }

    console.log('Header element found');
    addBookmarkButton();
    return true;
  }

  // Try to set the background immediately
  if (setHeaderBackground()) {
    console.log('Header setup completed successfully');
    return;
  }

  // If immediate attempt fails, set up a MutationObserver
  const observer = new MutationObserver((mutations, obs) => {
    if (setHeaderBackground()) {
      console.log('Header setup completed successfully after DOM mutation');
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
      console.log('Header setup completed successfully after timeout');
      observer.disconnect();
    } else {
      console.error('Failed to set up header after timeout');
      observer.disconnect();
    }
  }, 5000); // 5 second timeout
}

function addBookmarkItem() {
  if (!showBookmark) return;

  const notificationIcon = document.querySelector('.slds-global-actions__item_notification');
  if (notificationIcon && !document.querySelector('.custom-bookmark-item')) {
    
    const bookmarkItemHtml = `
      <li class="slds-global-actions__item slds-dropdown-trigger slds-dropdown-trigger_click custom-bookmark-item">
        <div class="forceHeaderButton">
          <button aria-expanded="false" aria-haspopup="true" type="button" class="slds-button slds-button_icon slds-button_icon-container slds-button_icon-small slds-global-actions__item-action">
            <div class="tooltipTrigger tooltip-trigger uiTooltip">
              <svg focusable="false" aria-hidden="true" viewBox="0 0 520 520" part="icon" class="slds-icon slds-icon_x-small">
                <path d="M130 0h260c17 0 30 13 30 30v460c0 6-7 10-13 7l-147-86-147 86c-6 3-13-1-13-7V30c0-17 13-30 30-30z" fill="#919191"></path>
              </svg>
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
  createBookmarkPanel(); // This will create and show the bookmark panel immediately
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
  let panel = document.querySelector('.bookmark-panel');
  if (panel) {
    panel.remove();
  }

  const isSandboxOrg = window.location.hostname.includes('.sandbox.');
  const topPosition = isSandboxOrg ? '87px' : '50px';

  const panelHtml = `
    <div class="bookmark-panel container" style="position: fixed; top: ${topPosition}; right: 10px; width: 300px; background: white; border: 1px solid #d8dde6; border-radius: 0.25rem; box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16); z-index: 9999; font-family: Arial, sans-serif;">
      <div class="panel-header" style="padding: 0.75rem; border-bottom: 1px solid #d8dde6;">
        <div class="button-group" style="display: flex; gap: 0.5rem;">
          <button id="addBookmarkBtn" class="slds-button slds-button_neutral" style="padding: 0.25rem 0.5rem;">
            Bookmark this page
          </button>
          <button id="showDetailsBtn" class="slds-button slds-button_neutral" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background-color: #f4f6f9; color: #16325c; border: 1px solid #d8dde6; border-radius: 0.25rem; cursor: pointer;">
            Details
          </button>
        </div>
        <button type="button" class="close-btn slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Close" title="Close bookmark panel" style="position: absolute; top: 0.75rem; right: 0.75rem; background: none; border: none; cursor: pointer;">
          <svg width="14" height="14" viewBox="0 0 52 52">
            <path fill="#706e6b" d="M31.6 25.8l13.1-13.1c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0L27.4 21.6c-.4.4-1 .4-1.4 0L12.9 8.4c-.6-.6-1.5-.6-2.1 0l-2.1 2.1c-.6.6-.6 1.5 0 2.1l13.1 13.1c.4.4.4 1 0 1.4L8.7 40.3c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L26 31.4c.4-.4 1-.4 1.4 0l13.1 13.1c.6.6 1.5.6 2.1 0l2.1-2.1c.6-.6.6-1.5 0-2.1L31.6 27.2c-.4-.4-.4-1 0-1.4z"/>
          </svg>
        </button>
      </div>
      <div class="panel-content scrollable" style="max-height: 300px; overflow-y: auto; padding: 0.75rem;">
        <ul id="bookmarkList" style="list-style-type: none; padding: 0; margin: 0;"></ul>
      </div>
    </div>
    <style>
      .bookmark-item {
        display: flex;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #e0e0e0;
        cursor: default;
      }
      .drag-handle {
        cursor: move;
        cursor: grab;
        padding: 0 8px;
        color: #999;
        flex-shrink: 0;
      }
      .bookmark-item.dragging {
        opacity: 0.5;
        cursor: grabbing !important;
      }
      .bookmark-item.dragging * {
        cursor: grabbing !important;
      }
      .bookmark-link {
        flex-grow: 1;
        min-width: 0; /* This allows the text to shrink below its content size */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }
      .bookmark-title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      }
      .bookmark-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }
      .bookmark-actions button {
        padding: 2px;
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .bookmark-actions svg {
        width: 14px;
        height: 14px;
      }
    </style>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  // Add event listeners
  const closeBtn = document.querySelector('.bookmark-panel .close-btn');
  closeBtn.addEventListener('click', () => {
    document.querySelector('.bookmark-panel').remove();
  });

  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  addBookmarkBtn.addEventListener('click', addCurrentPageBookmark);

  const showDetailsBtn = document.getElementById('showDetailsBtn');
  showDetailsBtn.addEventListener('click', openOrgBookmarksDetails);

  // Load and display existing bookmarks
  displayBookmarks();
}

function openOrgBookmarksDetails() {
  const currentOrgUrl = getCurrentOrgUrl();
  try {
    chrome.runtime.sendMessage(extensionId, {
      action: "openOrgBookmarks",
      orgUrl: currentOrgUrl
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.log("Extension context invalidated. Reloading page.");
        window.location.reload();
      }
    });
  } catch (e) {
    console.log("Error sending message. Reloading page.");
    window.location.reload();
  }
}

function showNotification(message, duration = 3000) {
  const notificationElement = document.createElement('div');
  notificationElement.textContent = message;
  notificationElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #fff7de;
    color: #6b3c00;
    padding: 10px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;
  
  document.body.appendChild(notificationElement);
  
  setTimeout(() => {
    notificationElement.style.opacity = '0';
    notificationElement.style.transition = 'opacity 0.5s ease-out';
    setTimeout(() => {
      document.body.removeChild(notificationElement);
    }, 500);
  }, duration);
}

function addCurrentPageBookmark() {
  const url = window.location.href;
  const title = document.title;
  const orgUrl = getCurrentOrgUrl();
  const currentTime = Date.now();
  
  chrome.storage.local.get({bookmarks: [], orgAliases: {}}, function(result) {
    let bookmarks = result.bookmarks;
    let orgAliases = result.orgAliases;
    if (!orgAliases[orgUrl]) {
      orgAliases[orgUrl] = orgUrl; // Initially set alias to orgUrl
    }
    if (!bookmarks.some(bookmark => bookmark.url === url)) {
      bookmarks.unshift({
        url,
        title,
        orgUrl,
        orgAlias: orgAliases[orgUrl],
        createdAt: currentTime,
        lastVisited: currentTime,
        visitCount: 0,
        tags: [],
        notes: ""
      });
      chrome.storage.local.set({bookmarks: bookmarks, orgAliases: orgAliases}, function() {
        console.log('Bookmark added');
        displayBookmarks();
        showNotification('Bookmark added');
      });
    } else {
      console.log('Bookmark already exists');
      showNotification('Bookmark already exists');
    }
  });
}

function displayBookmarks() {
  const bookmarkList = document.getElementById('bookmarkList');
  const currentOrgUrl = getCurrentOrgUrl();
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
    
    if (bookmarks.length === 0) {
      bookmarkList.innerHTML = '<li class="no-bookmarks">No bookmarks for this org yet.</li>';
    } else {
      bookmarkList.innerHTML = bookmarks.map((bookmark, index) => `
        <li class="bookmark-item" draggable="true" data-index="${index}">
          <div class="drag-handle">☰ [${bookmark.visitCount || 0}]</div>
          <a href="${bookmark.url}" class="bookmark-link" title="${bookmark.title}" target="_blank">
            <span class="bookmark-title">${bookmark.title}</span>
          </a>
          <div class="bookmark-actions">
            <button class="edit-bookmark" data-url="${bookmark.url}" title="Edit bookmark">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="#0070d2"/>
              </svg>
            </button>
            <button class="remove-bookmark" data-url="${bookmark.url}" title="Remove bookmark">
              <svg viewBox="0 0 52 52">
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

      // Add drag and drop functionality
      addDragAndDropListeners();

      // Inside displayBookmarks function, after creating the bookmark items
      document.querySelectorAll('.bookmark-link').forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault(); // Prevent the default link behavior
          updateBookmarkVisit(this.href);
          window.open(this.href, '_blank'); // Open the link in a new tab
        });
      });

      // Add event listeners for details buttons
      document.querySelectorAll('.bookmark-details').forEach(button => {
        button.addEventListener('click', function(e) {
          e.stopPropagation();
          openBookmarkDetails(this.dataset.url);
        });
      });
    }
  });
}

function addDragAndDropListeners() {
  const bookmarkList = document.getElementById('bookmarkList');

  bookmarkList.addEventListener('dragstart', (e) => {
    draggedItem = e.target.closest('.bookmark-item');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedItem.outerHTML);
    draggedItem.classList.add('dragging');
  });

  bookmarkList.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.bookmark-item');
    if (target && target !== draggedItem && target !== placeholder) {
      const targetRect = target.getBoundingClientRect();
      const targetCenter = targetRect.top + targetRect.height / 2;
      if (e.clientY < targetCenter) {
        target.parentNode.insertBefore(placeholder, target);
      } else {
        target.parentNode.insertBefore(placeholder, target.nextSibling);
      }
    }
  });

  bookmarkList.addEventListener('dragend', (e) => {
    e.preventDefault();
    draggedItem.classList.remove('dragging');
    placeholder.parentNode && placeholder.parentNode.replaceChild(draggedItem, placeholder);
    draggedItem = null;
    updateBookmarkOrder();
  });
}

function updateBookmarkOrder() {
  const bookmarkItems = Array.from(document.querySelectorAll('.bookmark-item'));
  const currentOrgUrl = getCurrentOrgUrl();
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let allBookmarks = result.bookmarks;
    let orgBookmarks = allBookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
    
    const newOrder = bookmarkItems.map(item => item.querySelector('.bookmark-link').href);
    orgBookmarks.sort((a, b) => newOrder.indexOf(a.url) - newOrder.indexOf(b.url));
    
    allBookmarks = allBookmarks.filter(bookmark => bookmark.orgUrl !== currentOrgUrl).concat(orgBookmarks);
    
    chrome.storage.local.set({bookmarks: allBookmarks}, function() {
      console.log('Bookmark order updated');
      displayBookmarks(); // Refresh the display
    });
  });
}

function updateBookmarkTitle(newTitle, url) {
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks;
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === url);
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].title = newTitle;
      bookmarks[bookmarkIndex].lastVisited = Date.now();
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark title updated');
        showNotification('Bookmark title updated');
      });
    }
  });
}

function removeBookmark(url) {
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks;
    const initialLength = bookmarks.length;
    bookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
    if (bookmarks.length < initialLength) {
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark removed');
        flashBookmarkIcon('#FF0000'); // Red flash for removal
        displayBookmarks();
        showNotification('Bookmark removed');
      });
    }
  });
}

function updateBookmarkVisit(url) {
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let bookmarks = result.bookmarks;
    const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === url);
    if (bookmarkIndex !== -1) {
      bookmarks[bookmarkIndex].visitCount = (bookmarks[bookmarkIndex].visitCount || 0) + 1;
      bookmarks[bookmarkIndex].lastVisited = Date.now();
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log('Bookmark visit count updated');
        displayBookmarks(); // Refresh the bookmark list to show updated count
      });
    }
  });
}

function openBookmarkDetails(url) {
  const currentOrgUrl = getCurrentOrgUrl();
  chrome.runtime.sendMessage({
    action: "openOrgBookmarks",
    orgUrl: currentOrgUrl,
    bookmarkUrl: url
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleBookmark") {
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
    console.log('Bookmarks for this org have been reset');
  } else if (request.action === "getOrgName") {
    sendResponse({ orgName: getCurrentOrgUrl() });
    return true; // This line is important for asynchronous response
  }
});

chrome.storage.sync.get(['showBookmark'], function(result) {
  showBookmark = result.showBookmark !== false;
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    addSalesforceBanner();
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      addSalesforceBanner();
    });
  }
});

// Update the URL change listener
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    console.log('URL changed, re-running addSalesforceBanner');
    addSalesforceBanner();
  }
}).observe(document, {subtree: true, childList: true});

function getCurrentOrgUrl() {
  const url = new URL(window.location.href);
  const hostname = url.hostname;
  
  // Remove 'www.' if present
  const domainParts = hostname.replace(/^www\./, '').split('.');
  
  // Get the first part (org name)
  const orgName = domainParts[0];
  
  console.log(`Extracted org name: ${orgName}`);
  return orgName;
}

function flashBookmarkIcon(color, duration = 2000) {
  // const bookmarkIcon = document.querySelector('.custom-bookmark-item svg path');
  // if (bookmarkIcon) {
  //   const originalFill = bookmarkIcon.getAttribute('fill');
  //   bookmarkIcon.setAttribute('fill', color);
  //   setTimeout(() => {
  //     bookmarkIcon.setAttribute('fill', originalFill);
  //   }, duration);
  // }
}

// Redefine the message listener
function setupMessageListener() {
  chrome.runtime.onMessage.removeListener(handleMessage);
  chrome.runtime.onMessage.addListener(handleMessage);
}

function handleMessage(request, sender, sendResponse) {
  if (request.action === "updateButton") {
    updateBookmarkButton(request.isBookmarked);
  }
}

// Initial setup
addSalesforceBanner(); // This function should include the call to addBookmarkButton()
setupMessageListener();

// Periodically check if the extension is still valid
setInterval(() => {
  try {
    chrome.runtime.getURL('');
  } catch (e) {
    console.log("Extension context invalidated. Reloading page.");
    window.location.reload();
  }
}, 5000);  // Check every 5 seconds

function addBookmarkButton() {
  if (!showBookmark) return;

  const notificationIcon = document.querySelector('.slds-global-actions__item_notification');
  if (notificationIcon && !document.querySelector('.custom-bookmark-item')) {
    
    const bookmarkItemHtml = `
      <li class="slds-global-actions__item slds-dropdown-trigger slds-dropdown-trigger_click custom-bookmark-item">
        <div class="forceHeaderButton">
          <button aria-expanded="false" aria-haspopup="true" type="button" class="slds-button slds-button_icon slds-button_icon-container slds-button_icon-small slds-global-actions__item-action">
            <div class="tooltipTrigger tooltip-trigger uiTooltip">
              <svg focusable="false" aria-hidden="true" viewBox="0 0 520 520" part="icon" class="slds-icon slds-icon_x-small">
                <path d="M130 0h260c17 0 30 13 30 30v460c0 6-7 10-13 7l-147-86-147 86c-6 3-13-1-13-7V30c0-17 13-30 30-30z" fill="#919191"></path>
              </svg>
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