let showBanner = true;
let showRecentlyVisited = true;

let visitedLinks = {};

function addSalesforceBanner() {
  const banner = document.createElement('div');
  banner.id = 'salesforce-banner';
  
  const url = window.location.href.toLowerCase();
  
  if (url.includes('sandbox') && url.includes('full')) {
    banner.style.backgroundColor = 'orange';
    banner.textContent = 'Salesforce Full Sandbox Org';
  } else if (url.includes('sandbox')) {
    banner.style.backgroundColor = 'green';
    banner.textContent = 'Salesforce Sandbox Org';
  } else {
    banner.style.backgroundColor = 'darkred';
    banner.textContent = 'Salesforce Production Org';
  }
  
  document.body.insertBefore(banner, document.body.firstChild);
  updateBannerVisibility();

  // Add "Recently visited" menu item if on the specific page
  if (url.includes('/setup/')) {
    console.log('Correct URL detected, calling addRecentlyVisitedMenuItem');
    addRecentlyVisitedMenuItem();
  } else {
    console.log('URL does not match, not adding Recently Visited menu item');
  }
}

function updateBannerVisibility() {
  const banner = document.getElementById('salesforce-banner');
  if (banner) {
    banner.style.display = showBanner ? 'block' : 'none';
  }
}

function updateRecentlyVisitedVisibility() {
  const recentlyVisitedMenuItem = document.querySelector('[data-tabid="recently-visited-tab"]');
  if (recentlyVisitedMenuItem) {
    recentlyVisitedMenuItem.closest('li').style.display = showRecentlyVisited ? 'block' : 'none';
  }
}

function trackVisitedLink() {
  const currentUrl = window.location.pathname + window.location.search;
  if (currentUrl.includes('/setup/')) {
    chrome.storage.local.get('visitedLinks', function(result) {
      let visitedLinks = result.visitedLinks || {};
      visitedLinks[currentUrl] = {
        count: (visitedLinks[currentUrl]?.count || 0) + 1,
        lastVisited: Date.now()
      };
      chrome.storage.local.set({visitedLinks: visitedLinks}, function() {
        console.log('Visited links updated:', visitedLinks);
        updateRecentlyVisitedDropdown();
      });
    });
  }
}

function updateRecentlyVisitedDropdown() {
  chrome.storage.local.get('visitedLinks', function(result) {
    const visitedLinks = result.visitedLinks || {};
    const dropdownContent = document.querySelector('[data-dropdown-id="recently-visited-dropdown"] ul');
    if (dropdownContent) {
      // Sort links by most recent first
      const sortedLinks = Object.entries(visitedLinks)
        .sort((a, b) => b[1].lastVisited - a[1].lastVisited)
        .slice(0, 5); // Get top 5 most recently visited links

      dropdownContent.innerHTML = '';
      sortedLinks.forEach(([link, count]) => {
        const li = document.createElement('li');
        li.role = 'presentation';
        li.className = 'slds-dropdown__item uiMenuItem';
        
        let displayText = 'Setup Home';
        let fullUrl = link;
        
        if (link.startsWith('/')) {
          // If the link is a relative path, we need to construct the full URL
          fullUrl = window.location.origin + link;
        }
        
        try {
          const url = new URL(fullUrl);
          const setupIndex = url.pathname.indexOf('/setup/');
          if (setupIndex !== -1) {
            const pathAfterSetup = url.pathname.substring(setupIndex + 7); // +7 to skip '/setup/'
            const firstPart = pathAfterSetup.split('/')[0];
            displayText = firstPart || 'Setup Home';
          }
        } catch (error) {
          console.error('Error parsing URL:', fullUrl, error);
          displayText = 'Unknown Page';
        }
        
        li.innerHTML = `
          <a role="menuitem" href="${fullUrl}" title="${fullUrl}">
            <span class="uiOutputText">${displayText} (${count})</span>
          </a>
        `;
        dropdownContent.appendChild(li);
      });
      console.log('Dropdown updated with sorted links:', sortedLinks);
    } else {
      console.error('Dropdown content element not found');
    }
  });
}

function addRecentlyVisitedMenuItem() {
  console.log('addRecentlyVisitedMenuItem function called');

  const observer = new MutationObserver((mutations, obs) => {
    console.log('MutationObserver callback triggered');
    const tabBarItems = document.querySelector('.tabBarItems');
    if (tabBarItems) {
      console.log('tabBarItems found');
      const newMenuItem = document.createElement('li');
      newMenuItem.role = 'presentation';
      newMenuItem.className = 'oneConsoleTabItem tabItem slds-context-bar__item borderRight hasActions navexConsoleTabItem';
      newMenuItem.innerHTML = `
        <a role="tab" tabindex="-1" title="Recently Visited" data-tabid="recently-visited-tab" aria-selected="false" href="#" class="tabHeader slds-context-bar__label-action">
          <span class="title slds-truncate">Recently Visited</span>
        </a>
        <div class="slds-context-bar__label-action slds-p-left--none uiMenu oneNavItemDropdown">
          <div class="uiPopupTrigger" data-trigger-id="recently-visited-dropdown">
            <div>
              <a aria-disabled="false" role="button" aria-haspopup="true" class="slds-button slds-button--icon" href="javascript:void(0);">
                <lightning-icon class="slds-icon-utility-chevrondown trigger-icon slds-button__icon slds-button__icon--hint slds-icon_container forceIcon">
                  <svg focusable="false" aria-hidden="true" viewBox="0 0 520 520" class="slds-icon slds-icon_xx-small">
                    <path d="M476 178L271 385c-6 6-16 6-22 0L44 178c-6-6-6-16 0-22l22-22c6-6 16-6 22 0l161 163c6 6 16 6 22 0l161-162c6-6 16-6 22 0l22 22c5 6 5 15 0 21z"></path>
                  </svg>
                </lightning-icon>
              </a>
            </div>
          </div>
          <div class="popupTargetContainer menu--nubbin-top uiPopupTarget uiMenuList uiMenuList--default" data-dropdown-id="recently-visited-dropdown">
            <div role="menu">
              <ul role="presentation" class="scrollable">
                <li role="presentation" class="slds-dropdown__item uiMenuItem">
                  <a role="menuitem" href="javascript:void(0)" title="Recent 1">
                    <span class="uiOutputText">Recent 1</span>
                  </a>
                </li>
                <li role="presentation" class="slds-dropdown__item uiMenuItem">
                  <a role="menuitem" href="javascript:void(0)" title="Recent 2">
                    <span class="uiOutputText">Recent 2</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      `;
      
      tabBarItems.insertBefore(newMenuItem, tabBarItems.children[2]);
      console.log('New menu item inserted');
      
      // Add click event listener to toggle dropdown
      const dropdownTrigger = newMenuItem.querySelector('[data-trigger-id="recently-visited-dropdown"]');
      const dropdownContent = newMenuItem.querySelector('[data-dropdown-id="recently-visited-dropdown"]');
      
      console.log('Dropdown trigger:', dropdownTrigger);
      console.log('Dropdown content:', dropdownContent);

      if (dropdownTrigger && dropdownContent) {
        dropdownTrigger.addEventListener('click', (e) => {
          console.log('Dropdown trigger clicked');
          e.preventDefault();
          dropdownContent.classList.toggle('slds-is-open');
          
          // Position the dropdown
          const triggerRect = dropdownTrigger.getBoundingClientRect();
          const menuItemRect = newMenuItem.getBoundingClientRect();
          dropdownContent.style.top = `${menuItemRect.bottom}px`;
          dropdownContent.style.left = `${menuItemRect.left}px`;
          
          console.log('Dropdown open state:', dropdownContent.classList.contains('slds-is-open'));
          console.log('Dropdown position:', dropdownContent.style.top, dropdownContent.style.left);
          updateRecentlyVisitedDropdown(); // Call this function when the dropdown is opened
        });
        console.log('Click event listener added to dropdown trigger');
      } else {
        console.error('Dropdown trigger or content not found');
      }
      
      obs.disconnect(); // Stop observing once we've added the menu item
      console.log('MutationObserver disconnected');
    } else {
      console.log('tabBarItems not found yet');
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  console.log('MutationObserver started');
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "toggleBanner") {
    showBanner = request.show;
    updateBannerVisibility();
  } else if (request.action === "toggleRecentlyVisited") {
    showRecentlyVisited = request.show;
    updateRecentlyVisitedVisibility();
  } else if (request.action === "updateVisitedLinks") {
    chrome.storage.local.get('visitedLinks', function(result) {
      visitedLinks = result.visitedLinks || {};
      updateRecentlyVisitedDropdown();
    });
  }
});

chrome.storage.sync.get(['showBanner', 'showRecentlyVisited'], function(result) {
  showBanner = result.showBanner !== false;
  showRecentlyVisited = result.showRecentlyVisited !== false;
  addSalesforceBanner();
  trackVisitedLink();
  updateRecentlyVisitedDropdown(); // Add this line
});

// Add a listener for URL changes
let lastUrl = location.href; 
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes('/setup/')) {
      trackVisitedLink();
    }
  }
}).observe(document, {subtree: true, childList: true});

// Initial check when the script loads
if (location.href.includes('/setup/')) {
  trackVisitedLink();
}