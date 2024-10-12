document.addEventListener('DOMContentLoaded', function() {
  const bookmarksContainer = document.getElementById('bookmarksContainer');
  const resetAllBookmarksBtn = document.getElementById('resetAllBookmarks');

  function displayBookmarks() {
    chrome.storage.local.get({bookmarks: [], orgAliases: {}}, function(result) {
      const bookmarks = result.bookmarks;
      const orgAliases = result.orgAliases;
      const orgBookmarks = {};

      // Group bookmarks by org
      bookmarks.forEach(bookmark => {
        if (!orgBookmarks[bookmark.orgUrl]) {
          orgBookmarks[bookmark.orgUrl] = [];
        }
        orgBookmarks[bookmark.orgUrl].push(bookmark);
      });

      // Clear existing content
      bookmarksContainer.innerHTML = '';

      // Display bookmarks for each org
      Object.keys(orgBookmarks).forEach(orgUrl => {
        const orgSection = document.createElement('div');
        orgSection.className = 'org-section';

        const orgHeader = document.createElement('div');
        orgHeader.className = 'org-header';

        const orgAlias = document.createElement('h2');
        orgAlias.className = 'org-alias';
        orgAlias.textContent = orgAliases[orgUrl] || orgUrl;
        orgAlias.contentEditable = true;
        orgAlias.dataset.orgUrl = orgUrl;
        orgAlias.addEventListener('blur', updateOrgAlias);
        orgAlias.addEventListener('keydown', function(event) {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
          }
        });

        const orgUrlDisplay = document.createElement('p');
        orgUrlDisplay.className = 'org-url';
        orgUrlDisplay.textContent = orgUrl;

        const resetOrgButton = document.createElement('button');
        resetOrgButton.className = 'reset-org-button';
        resetOrgButton.textContent = 'Delete Bookmarks';
        resetOrgButton.addEventListener('click', function() {
          resetOrgBookmarks(orgUrl);
        });

        orgHeader.appendChild(orgAlias);
        orgHeader.appendChild(orgUrlDisplay);
        orgHeader.appendChild(resetOrgButton);
        orgSection.appendChild(orgHeader);

        const bookmarkList = document.createElement('ul');
        bookmarkList.className = 'bookmark-list';

        orgBookmarks[orgUrl].forEach(bookmark => {
          const bookmarkItem = document.createElement('li');
          bookmarkItem.className = 'bookmark-item';

          const bookmarkLink = document.createElement('a');
          bookmarkLink.href = bookmark.url;
          bookmarkLink.className = 'bookmark-link';
          bookmarkLink.textContent = bookmark.title;
          bookmarkLink.target = '_blank';

          bookmarkItem.appendChild(bookmarkLink);
          bookmarkList.appendChild(bookmarkItem);
        });

        orgSection.appendChild(bookmarkList);
        bookmarksContainer.appendChild(orgSection);
      });

      if (Object.keys(orgBookmarks).length === 0) {
        bookmarksContainer.innerHTML = '<p class="no-bookmarks">No bookmarks found.</p>';
      }
    });
  }

  function updateOrgAlias(event) {
    const newAlias = event.target.textContent.trim();
    const orgUrl = event.target.dataset.orgUrl;

    chrome.storage.local.get({orgAliases: {}}, function(result) {
      let orgAliases = result.orgAliases;
      orgAliases[orgUrl] = newAlias;
      chrome.storage.local.set({orgAliases: orgAliases}, function() {
        console.log(`Org alias updated for ${orgUrl}`);
        // Update bookmarks with new alias
        updateBookmarksWithNewAlias(orgUrl, newAlias);
      });
    });
  }

  function updateBookmarksWithNewAlias(orgUrl, newAlias) {
    chrome.storage.local.get({bookmarks: []}, function(result) {
      let bookmarks = result.bookmarks;
      bookmarks.forEach(bookmark => {
        if (bookmark.orgUrl === orgUrl) {
          bookmark.orgAlias = newAlias;
        }
      });
      chrome.storage.local.set({bookmarks: bookmarks}, function() {
        console.log(`Bookmarks updated with new alias for ${orgUrl}`);
      });
    });
  }

  function resetOrgBookmarks(orgUrl) {
    if (confirm(`Are you sure you want to delete all bookmarks for ${orgUrl}? This action cannot be undone.`)) {
      chrome.storage.local.get({bookmarks: []}, function(result) {
        let bookmarks = result.bookmarks;
        bookmarks = bookmarks.filter(bookmark => bookmark.orgUrl !== orgUrl);
        chrome.storage.local.set({bookmarks: bookmarks}, function() {
          console.log(`Bookmarks for ${orgUrl} have been deleted`);
          displayBookmarks();
        });
      });
    }
  }

  function resetAllBookmarks() {
    if (confirm('Are you sure you want to delete all bookmarks across all orgs? This action cannot be undone.')) {
      chrome.storage.local.set({bookmarks: []}, function() {
        console.log('All bookmarks have been deleted');
        displayBookmarks();
      });
    }
  }

  resetAllBookmarksBtn.addEventListener('click', resetAllBookmarks);

  displayBookmarks();
});
