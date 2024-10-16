let allBookmarks = [];
let currentOrgUrl = '';
let currentOrgAlias = '';
let currentEditingUrl = '';
let currentSortColumn = '';
let currentSortOrder = 'asc';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentOrgUrl = urlParams.get('org');
    document.getElementById('orgName').textContent = currentOrgUrl;

    loadOrgAlias();
    loadBookmarks();

    document.getElementById('searchInput').addEventListener('input', filterBookmarks);
    document.getElementById('tagFilter').addEventListener('change', filterBookmarks);
    document.getElementById('saveEdit').addEventListener('click', saveEditedBookmark);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);
    // document.getElementById('recentlyVisitedBtn').addEventListener('click', sortByRecentlyVisited);
    
    // Add event listeners for org alias editing
    document.getElementById('editOrgAlias').addEventListener('click', openAliasModal);
    document.getElementById('saveAlias').addEventListener('click', saveOrgAlias);
    document.getElementById('cancelAlias').addEventListener('click', closeAliasModal);

    // Add event listeners for sorting
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => sortBookmarks(th.dataset.sort));
    });
});

function loadOrgAlias() {
    chrome.storage.local.get({orgAliases: {}}, function(result) {
        currentOrgAlias = result.orgAliases[currentOrgUrl] || currentOrgUrl;
        document.getElementById('orgAlias').textContent = currentOrgAlias;
    });
}

function openAliasModal() {
    document.getElementById('orgAliasInput').value = currentOrgAlias;
    document.getElementById('aliasModal').style.display = 'block';
}

function closeAliasModal() {
    document.getElementById('aliasModal').style.display = 'none';
}

function saveOrgAlias() {
    const newAlias = document.getElementById('orgAliasInput').value.trim();
    if (newAlias) {
        chrome.storage.local.get({orgAliases: {}}, function(result) {
            let orgAliases = result.orgAliases;
            orgAliases[currentOrgUrl] = newAlias;
            chrome.storage.local.set({orgAliases: orgAliases}, function() {
                currentOrgAlias = newAlias;
                document.getElementById('orgAlias').textContent = currentOrgAlias;
                closeAliasModal();
                updateBookmarksWithNewAlias(newAlias);
            });
        });
    }
}

function updateBookmarksWithNewAlias(newAlias) {
    chrome.storage.local.get({bookmarks: []}, function(result) {
        let bookmarks = result.bookmarks;
        bookmarks.forEach(bookmark => {
            if (bookmark.orgUrl === currentOrgUrl) {
                bookmark.orgAlias = newAlias;
            }
        });
        chrome.storage.local.set({bookmarks: bookmarks}, function() {
            loadBookmarks();
        });
    });
}

function loadBookmarks() {
    chrome.storage.local.get({bookmarks: []}, function(result) {
        allBookmarks = result.bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
        displayBookmarks(allBookmarks);
        updateTagFilter();
        updateSummaryTiles();
    });
}

function displayBookmarks(bookmarks = allBookmarks) {
    const bookmarkList = document.getElementById('bookmarkList');
    bookmarkList.innerHTML = bookmarks.map(bookmark => `
        <tr data-url="${bookmark.url}">
            <td><a href="${bookmark.url}" target="_blank" class="bookmark-title">${bookmark.title}</a></td>
            <td>${bookmark.tags ? bookmark.tags.join(', ') : ''}</td>
            <td>${new Date(bookmark.createdAt).toLocaleString()}</td>
            <td>${new Date(bookmark.lastVisited).toLocaleString()}</td>
            <td class="visit-count">${bookmark.visitCount || 0}</td>
            <td>${bookmark.notes || ''}</td>
            <td>
                <button class="edit-btn" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).join('');

    addEventListeners();
    updateSortIcons();
}

function addEventListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteBookmark);
    });

    document.querySelectorAll('.bookmark-title').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.href;
            updateBookmarkVisit(url);
            window.open(url, '_blank');
        });
    });
}

function openEditModal(e) {
    const row = e.target.closest('tr');
    currentEditingUrl = row.dataset.url;
    const bookmark = allBookmarks.find(b => b.url === currentEditingUrl);

    document.getElementById('editTitle').value = bookmark.title;
    document.getElementById('editTags').value = bookmark.tags ? bookmark.tags.join(', ') : '';
    document.getElementById('editNotes').value = bookmark.notes || '';

    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveEditedBookmark() {
    const title = document.getElementById('editTitle').value;
    const tags = document.getElementById('editTags').value;
    const notes = document.getElementById('editNotes').value;
    
    const tagsError = document.getElementById('tagsError');
    const notesError = document.getElementById('notesError');
    
    tagsError.textContent = '';
    notesError.textContent = '';
    
    let isValid = true;
    
    if (!validateTags(tags)) {
        tagsError.textContent = 'Each tag must be 10 characters or less.';
        isValid = false;
    }
    
    if (!validateNotes(notes)) {
        notesError.textContent = 'Notes must be 255 characters or less.';
        isValid = false;
    }
    
    if (isValid) {
        chrome.storage.local.get({bookmarks: []}, function(result) {
            let bookmarks = result.bookmarks;
            const index = bookmarks.findIndex(b => b.url === currentEditingUrl);
            if (index !== -1) {
                bookmarks[index].title = title;
                bookmarks[index].tags = tags.split(',').map(tag => tag.trim());
                bookmarks[index].notes = notes;
                chrome.storage.local.set({bookmarks: bookmarks}, function() {
                    console.log('Bookmark updated');
                    loadBookmarks();
                    closeEditModal();
                });
            }
        });
    }
}

function deleteBookmark(e) {
    if (confirm('Are you sure you want to delete this bookmark?')) {
        const url = e.target.closest('tr').dataset.url;
        chrome.storage.local.get({bookmarks: []}, function(result) {
            let bookmarks = result.bookmarks.filter(b => b.url !== url);
            chrome.storage.local.set({bookmarks: bookmarks}, function() {
                console.log('Bookmark deleted');
                loadBookmarks();
            });
        });
    }
}

function filterBookmarks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const tagFilter = document.getElementById('tagFilter').value.toLowerCase();

    const filteredBookmarks = allBookmarks.filter(bookmark => {
        const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm) || 
                              (bookmark.notes && bookmark.notes.toLowerCase().includes(searchTerm));
        const matchesTag = tagFilter === '' || (bookmark.tags && bookmark.tags.some(tag => tag.toLowerCase() === tagFilter));
        return matchesSearch && matchesTag;
    });

    if (currentSortColumn) {
        sortBookmarks(currentSortColumn);
    } else {
        displayBookmarks(filteredBookmarks);
    }
}

function updateTagFilter() {
    const tagFilter = document.getElementById('tagFilter');
    const allTags = new Set();
    allBookmarks.forEach(bookmark => {
        if (bookmark.tags) {
            bookmark.tags.forEach(tag => allTags.add(tag));
        }
    });
    
    tagFilter.innerHTML = '<option value="">All Tags</option>' + 
        Array.from(allTags).map(tag => `<option value="${tag}">${tag}</option>`).join('');
}

function updateSummaryTiles() {
    const totalBookmarks = allBookmarks.length;
    document.getElementById('totalBookmarks').textContent = totalBookmarks;

    const totalVisits = allBookmarks.reduce((sum, bookmark) => sum + (bookmark.visitCount || 0), 0);
    document.getElementById('totalVisits').textContent = totalVisits;

    const timesSavedSeconds = totalVisits * 5;
    let hours = Math.floor(timesSavedSeconds / 3600);
    let minutes = Math.floor((timesSavedSeconds % 3600) / 60);
    let seconds = Math.floor(timesSavedSeconds % 60);
    const timesSavedFormatted = `${hours}h ${minutes}m ${seconds}s`;
    document.getElementById('timesSaved').textContent = timesSavedFormatted;

    const avgVisitsPerBookmark = totalBookmarks > 0 ? (totalVisits / totalBookmarks).toFixed(2) : '0';
    document.getElementById('avgVisitsPerBookmark').textContent = avgVisitsPerBookmark;
}

// function sortByRecentlyVisited() {
//     const btn = document.getElementById('recentlyVisitedBtn');
//     btn.classList.toggle('active');

//     const sortedBookmarks = [...allBookmarks].sort((a, b) => {
//         return btn.classList.contains('active') 
//             ? b.lastVisited - a.lastVisited 
//             : a.lastVisited - b.lastVisited;
//     });

//     displayBookmarks(sortedBookmarks);
// }

function updateBookmarkVisit(url) {
    chrome.storage.local.get({bookmarks: []}, function(result) {
        let bookmarks = result.bookmarks;
        const bookmarkIndex = bookmarks.findIndex(bookmark => bookmark.url === url);
        if (bookmarkIndex !== -1) {
            bookmarks[bookmarkIndex].visitCount = (bookmarks[bookmarkIndex].visitCount || 0) + 1;
            bookmarks[bookmarkIndex].lastVisited = Date.now();
            chrome.storage.local.set({bookmarks: bookmarks}, function() {
                console.log('Bookmark visit count updated');
                // Update the visit count in the UI
                const row = document.querySelector(`tr[data-url="${url}"]`);
                if (row) {
                    const visitCountCell = row.querySelector('.visit-count');
                    if (visitCountCell) {
                        visitCountCell.textContent = bookmarks[bookmarkIndex].visitCount;
                    }
                }
                // Update allBookmarks array
                allBookmarks = bookmarks.filter(bookmark => bookmark.orgUrl === currentOrgUrl);
                updateSummaryTiles();
            });
        }
    });
}

function sortBookmarks(column) {
    const sortOrder = column === currentSortColumn && currentSortOrder === 'asc' ? 'desc' : 'asc';
    currentSortColumn = column;
    currentSortOrder = sortOrder;

    allBookmarks.sort((a, b) => {
        let valueA, valueB;

        switch (column) {
            case 'title':
                valueA = a.title.toLowerCase();
                valueB = b.title.toLowerCase();
                break;
            case 'createdAt':
                valueA = new Date(a.createdAt);
                valueB = new Date(b.createdAt);
                break;
            case 'lastVisited':
                valueA = new Date(a.lastVisited);
                valueB = new Date(b.lastVisited);
                break;
            case 'visitCount':
                valueA = a.visitCount || 0;
                valueB = b.visitCount || 0;
                break;
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    displayBookmarks();
    updateSortIcons();
}

function updateSortIcons() {
    document.querySelectorAll('th.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const currentSortHeader = document.querySelector(`th[data-sort="${currentSortColumn}"]`);
    if (currentSortHeader) {
        const icon = currentSortHeader.querySelector('i');
        icon.className = `fas fa-sort-${currentSortOrder === 'asc' ? 'up' : 'down'}`;
    }
}

// Add these functions near the top of your file
function validateTags(tags) {
    const tagArray = tags.split(',').map(tag => tag.trim());
    return tagArray.every(tag => tag.length <= 10);
}

function validateNotes(notes) {
    return notes.length <= 255;
}

// Update the saveEdit event listener
document.getElementById('saveEdit').addEventListener('click', saveEditedBookmark);
