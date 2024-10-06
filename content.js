let showBookmark = true;

function addSalesforceBanner() {
  console.log('addSalesforceBanner called');

  function setHeaderBackground() {
    const headerElement = document.querySelector('span[role="navigation"].button-container-a11y[aria-label="Global Header"]');
    
    if (!headerElement) {
      console.log('Header element not found, will retry');
      return false;
    }

    console.log('Header element found');
    addBookmarkItem();
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

  const panelHtml = `
    <div class="bookmark-panel container" style="position: fixed; top: 50px; right: 10px; width: 300px; background: white; border: 1px solid #d8dde6; border-radius: 0.25rem; box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.16); z-index: 9999; font-family: Arial, sans-serif;">
      <div id="bookmarkNotification" style="padding: 0.5rem; font-size: 0.8rem; color: #006400; text-align: center; display: none;"></div>
      <div class="panel-header" style="padding: 0.75rem; border-bottom: 1px solid #d8dde6; display: flex; justify-content: space-between; align-items: center;">
        <div class="button-group" style="display: flex; gap: 0.5rem;">
          <button id="addBookmarkBtn" class="slds-button slds-button_neutral" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background-color: #0070d2; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.25rem;">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
            </svg>
            Add Bookmark
          </button>
          <button id="showAllBookmarksBtn" class="slds-button slds-button_neutral" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; background-color: #f4f6f9; color: #16325c; border: 1px solid #d8dde6; border-radius: 0.25rem; cursor: pointer;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-right: 0.25rem;">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" fill="currentColor"/>
            </svg>
            Show All
          </button>
        </div>
        <button type="button" class="close-btn slds-button slds-button_icon slds-button_icon-border-filled" aria-label="Close" title="Close bookmark panel" style="background: none; border: none; cursor: pointer;">
          <svg width="14" height="14" viewBox="0 0 52 52">
            <path fill="#706e6b" d="M31.6 25.8l13.1-13.1c.6-.6.6-1.5 0-2.1l-2.1-2.1c-.6-.6-1.5-.6-2.1 0L27.4 21.6c-.4.4-1 .4-1.4 0L12.9 8.4c-.6-.6-1.5-.6-2.1 0l-2.1 2.1c-.6.6-.6 1.5 0 2.1l13.1 13.1c.4.4.4 1 0 1.4L8.7 40.3c-.6.6-.6 1.5 0 2.1l2.1 2.1c.6.6 1.5.6 2.1 0L26 31.4c.4-.4 1-.4 1.4 0l13.1 13.1c.6.6 1.5.6 2.1 0l2.1-2.1c.6-.6.6-1.5 0-2.1L31.6 27.2c-.4-.4-.4-1 0-1.4z"/>
          </svg>
        </button>
      </div>
      <div class="panel-content scrollable" style="max-height: 300px; overflow-y: auto; padding: 0.75rem;">
        <ul id="bookmarkList" style="list-style-type: none; padding: 0; margin: 0;"></ul>
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
        }
        .bookmark-item.dragging {
          opacity: 0.5;
          cursor: grabbing;
        }
        .bookmark-item.dragging .drag-handle {
          cursor: grabbing;
        }
        /* ... (other existing styles) */
      </style>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  // Add event listeners
  const closeBtn = document.querySelector('.bookmark-panel .close-btn');
  closeBtn.addEventListener('click', () => {
    document.querySelector('.bookmark-panel').remove();
  });

  const addBookmarkBtn = document.getElementById('addBookmarkBtn');
  addBookmarkBtn.addEventListener('click', addCurrentPageBookmark);

  const showAllBookmarksBtn = document.getElementById('showAllBookmarksBtn');
  showAllBookmarksBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({action: "openAllBookmarks"});
  });

  // Load and display existing bookmarks
  displayBookmarks();
}

function showNotification(message, duration = 3000) {
  const notificationElement = document.getElementById('bookmarkNotification');
  if (notificationElement) {
    notificationElement.textContent = message;
    notificationElement.style.display = 'block';
    setTimeout(() => {
      notificationElement.style.display = 'none';
    }, duration);
  }
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
        flashBookmarkIcon('#4CAF50'); // Green flash for successful add
        displayBookmarks();
        showNotification('Bookmark added successfully');
      });
    } else {
      console.log('Bookmark already exists');
      flashBookmarkIcon('#FFA500'); // Orange flash for already existing
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
          <div class="drag-handle">☰</div>
          <a href="${bookmark.url}" class="bookmark-link" title="${bookmark.url}" target="_blank">
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

      // Add drag and drop functionality
      addDragAndDropListeners();
    }
  });
}

function addDragAndDropListeners() {
  const bookmarkList = document.getElementById('bookmarkList');
  let draggedItem = null;

  bookmarkList.addEventListener('dragstart', function(e) {
    draggedItem = e.target.closest('.bookmark-item');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedItem.innerHTML);
    draggedItem.classList.add('dragging');
    
    // Set the drag image to the entire bookmark item
    e.dataTransfer.setDragImage(draggedItem, 0, 0);
    
    // Change cursor to grabbing for the entire document during drag
    document.body.style.cursor = 'grabbing';
  });

  bookmarkList.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetItem = e.target.closest('.bookmark-item');
    if (targetItem && targetItem !== draggedItem) {
      const boundingRect = targetItem.getBoundingClientRect();
      const offset = boundingRect.y + (boundingRect.height / 2);
      if (e.clientY - offset > 0) {
        targetItem.style.borderBottom = 'solid 2px #0070d2';
        targetItem.style.borderTop = '';
      } else {
        targetItem.style.borderTop = 'solid 2px #0070d2';
        targetItem.style.borderBottom = '';
      }
    }
  });

  bookmarkList.addEventListener('dragleave', function(e) {
    e.target.closest('.bookmark-item').style.borderTop = '';
    e.target.closest('.bookmark-item').style.borderBottom = '';
  });

  bookmarkList.addEventListener('drop', function(e) {
    e.preventDefault();
    const targetItem = e.target.closest('.bookmark-item');
    if (targetItem && targetItem !== draggedItem) {
      const items = Array.from(bookmarkList.querySelectorAll('.bookmark-item'));
      const fromIndex = items.indexOf(draggedItem);
      const toIndex = items.indexOf(targetItem);
      
      if (fromIndex < toIndex) {
        bookmarkList.insertBefore(draggedItem, targetItem.nextSibling);
      } else {
        bookmarkList.insertBefore(draggedItem, targetItem);
      }
      
      updateBookmarkOrder();
    }
    targetItem.style.borderTop = '';
    targetItem.style.borderBottom = '';
    
    // Reset cursor
    document.body.style.cursor = '';
  });

  bookmarkList.addEventListener('dragend', function(e) {
    draggedItem.classList.remove('dragging');
    draggedItem = null;
    
    // Reset cursor
    document.body.style.cursor = '';
  });
}

function updateBookmarkOrder() {
  const currentOrgUrl = getCurrentOrgUrl();
  const bookmarkItems = Array.from(document.querySelectorAll('.bookmark-item'));
  
  chrome.storage.local.get({bookmarks: []}, function(result) {
    let allBookmarks = result.bookmarks;
    let orgBookmarks = allBookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
    
    const newOrder = bookmarkItems.map(item => item.querySelector('.bookmark-link').href);
    orgBookmarks.sort((a, b) => newOrder.indexOf(a.url) - newOrder.indexOf(b.url));
    
    allBookmarks = allBookmarks.filter(bookmark => bookmark.orgUrl !== currentOrgUrl).concat(orgBookmarks);
    
    chrome.storage.local.set({bookmarks: allBookmarks}, function() {
      console.log('Bookmark order updated');
      showNotification('Bookmark order updated');
    });
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
        showNotification('Bookmark title updated successfully');
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
        showNotification('Bookmark removed successfully');
      });
    }
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