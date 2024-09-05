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

  // Add "Recently visited" menu item if on the specific page
  if (url.includes('/setup/setuponehome/home')) {
    addRecentlyVisitedMenuItem();
  }
}

function addRecentlyVisitedMenuItem() {
  const observer = new MutationObserver((mutations, obs) => {
    const tabBarItems = document.querySelector('.tabBarItems');
    if (tabBarItems) {
      const newMenuItem = document.createElement('li');
      newMenuItem.role = 'presentation';
      newMenuItem.className = 'oneConsoleTabItem tabItem slds-context-bar__item borderRight';
      newMenuItem.innerHTML = `
        <a role="tab" aria-selected="false" href="#" class="tabHeader slds-context-bar__label-action">
          <span class="title slds-truncate">Recently Visited</span>
        </a>
      `;
      
      tabBarItems.insertBefore(newMenuItem, tabBarItems.children[2]);
      obs.disconnect(); // Stop observing once we've added the menu item
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

addSalesforceBanner();