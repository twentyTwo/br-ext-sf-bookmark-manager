document.addEventListener('DOMContentLoaded', function() {
  const showAllBookmarks = document.getElementById('showAllBookmarks');
  const orgName = document.getElementById('orgName');


  showAllBookmarks.addEventListener('click', function() {
    chrome.tabs.create({url: 'allBookmarks.html'});
  });

  // Call updateOrgName immediately when the popup opens
  // updateOrgName();

  // function updateSandboxOption(isSandbox) {
  //   const sandboxOption = document.querySelector('.sandbox-option');
  //   if (sandboxOption) {
  //     if (isSandbox) {
  //       sandboxOption.classList.remove('fade-out');
  //       hideSandboxBanner.disabled = false;
  //     } else {
  //       sandboxOption.classList.add('fade-out');
  //       hideSandboxBanner.checked = false;
  //       hideSandboxBanner.disabled = true;
  //       chrome.storage.sync.set({hideSandboxBanner: false});
  //     }
  //   }
  // }

  // // Call displayBookmarks when the popup opens
  // displayBookmarks();

  // function displayBookmarks() {
  //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //     if (tabs[0] && tabs[0].url) {
  //       const currentOrgUrl = new URL(tabs[0].url).origin;
  //       chrome.storage.local.get({bookmarks: []}, function(result) {
  //         const bookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
  //         const bookmarkList = document.createElement('ul');
  //         bookmarkList.className = 'bookmark-list';

  //         if (bookmarks.length === 0) {
  //           bookmarkList.innerHTML = '<li class="no-bookmarks">No bookmarks for this org yet.</li>';
  //         } else {
  //           bookmarks.forEach(bookmark => {
  //             const bookmarkItem = document.createElement('li');
  //             bookmarkItem.className = 'bookmark-item';
  //             bookmarkItem.innerHTML = `
  //               <a href="${bookmark.url}" class="bookmark-link" title="${bookmark.url}" target="_blank">
  //                 ${bookmark.title}
  //               </a>
  //               <button class="remove-bookmark" data-url="${bookmark.url}">×</button>
  //             `;
  //             bookmarkList.appendChild(bookmarkItem);
  //           });
  //         }

  //         const existingBookmarkList = document.querySelector('.bookmark-list');
  //         if (existingBookmarkList) {
  //           existingBookmarkList.replaceWith(bookmarkList);
  //         } else {
  //           document.getElementById('mainOptions').appendChild(bookmarkList);
  //         }

  //         // Add event listeners for remove buttons
  //         document.querySelectorAll('.remove-bookmark').forEach(button => {
  //           button.addEventListener('click', function(e) {
  //             e.stopPropagation();
  //             removeBookmark(this.dataset.url);
  //           });
  //         });
  //       });
  //     }
  //   });
  // }

  // function removeBookmark(url) {
  //   chrome.storage.local.get({bookmarks: []}, function(result) {
  //     let bookmarks = result.bookmarks;
  //     bookmarks = bookmarks.filter(bookmark => bookmark.url !== url);
  //     chrome.storage.local.set({bookmarks: bookmarks}, function() {
  //       console.log('Bookmark removed');
  //       displayBookmarks();
  //     });
  //   });
  // }
});