# Salesforce Bookmark Manager

## Overview
This Chrome/edge extension enhances the Salesforce interface by adding a customizable banner, bookmark functionality, and sandbox banner management.

## Key Features

1. **Customizable Banner**
   - Adds a colored banner to the Salesforce header
   - Colors indicate environment type (sandbox, dev, production)
   - Supports custom colors for specific org URLs

2. **Bookmark Functionality**
   - Adds a bookmark icon to the Salesforce header
   - Allows users to save and manage bookmarks for the current org
   - Bookmarks are displayed in a panel and can be edited or removed

3. **Sandbox Banner Management**
   - Option to hide/show the default Salesforce sandbox banner

## Technical Documentation

### Main Functions

- `addSalesforceBanner()`: Adds the custom banner to the Salesforce header
- `addBookmarkItem()`: Adds the bookmark icon to the header
- `createBookmarkPanel()`: Creates and displays the bookmark management panel
- `addCurrentPageBookmark()`: Saves the current page as a bookmark
- `displayBookmarks()`: Shows saved bookmarks in the panel
- `updateBannerVisibility()`: Toggles the visibility of the custom banner
- `hideSandboxBanner()`: Hides the default Salesforce sandbox banner
- `setupSandboxBannerObserver()`: Sets up an observer to hide the sandbox banner

### Storage

- Uses Chrome's storage API for persisting settings and bookmarks
- Synced storage for global settings
- Local storage for org-specific data (bookmarks, colors, banner visibility)

### Event Handling

- Listens for messages from the extension's popup for toggling features
- Observes URL changes to update the banner and bookmarks accordingly

### User Interface

- Custom banner in the Salesforce header
- Bookmark icon in the header
- Bookmark management panel
- Confirmation messages for user actions

## Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing the extension files

## Usage

After installation, the extension will automatically activate on Salesforce domains. Use the extension popup to toggle features and customize settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
