let allBookmarks = [];
let currentOrgUrl = '';
let currentEditingUrl = '';

document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    currentOrgUrl = urlParams.get('org');
    document.getElementById('orgName').textContent = currentOrgUrl;

    loadBookmarks();

    document.getElementById('searchInput').addEventListener('input', filterBookmarks);
    document.getElementById('tagFilter').addEventListener('change', filterBookmarks);
    document.getElementById('saveEdit').addEventListener('click', saveEditedBookmark);
    document.getElementById('cancelEdit').addEventListener('click', closeEditModal);

    document.getElementById('recentlyVisitedBtn').addEventListener('click', sortByRecentlyVisited);
});

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
    const tags = document.getElementById('editTags').value.split(',').map(tag => tag.trim());
    const notes = document.getElementById('editNotes').value;

    chrome.storage.local.get({bookmarks: []}, function(result) {
        let bookmarks = result.bookmarks;
        const index = bookmarks.findIndex(b => b.url === currentEditingUrl);
        if (index !== -1) {
            bookmarks[index].title = title;
            bookmarks[index].tags = tags;
            bookmarks[index].notes = notes;
            chrome.storage.local.set({bookmarks: bookmarks}, function() {
                console.log('Bookmark updated');
                loadBookmarks();
                closeEditModal();
            });
        }
    });
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

    // Maintain the current sort order
    const currentSort = document.getElementById('recentlyVisitedBtn').classList.contains('active') 
        ? (a, b) => b.lastVisited - a.lastVisited 
        : null;

    if (currentSort) {
        filteredBookmarks.sort(currentSort);
    }

    displayBookmarks(filteredBookmarks);
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

    document.getElementById('timesSaved').textContent = totalVisits * 5 + 's';

    const avgVisitsPerBookmark = totalBookmarks > 0 ? (totalVisits / totalBookmarks).toFixed(2) : '0';
    document.getElementById('avgVisitsPerBookmark').textContent = avgVisitsPerBookmark;
}

function sortByRecentlyVisited() {
    const btn = document.getElementById('recentlyVisitedBtn');
    btn.classList.toggle('active');

    const sortedBookmarks = [...allBookmarks].sort((a, b) => {
        return btn.classList.contains('active') 
            ? b.lastVisited - a.lastVisited 
            : a.lastVisited - b.lastVisited;
    });

    displayBookmarks(sortedBookmarks);
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
