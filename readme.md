# Salesforce Bookmark Manager

Salesforce Org Manager streamlines your multi-org Salesforce experience with powerful visual and organizational tools. Effortlessly distinguish between orgs using custom color-coded headers, bookmark frequently visited pages, and create a clutter-free workspace by hiding sandbox banners.

## Installation

1. Clone the repository or download the ZIP file.
2. Open Chrome and navigate to `chrome://extensions/` or for edge navigate to `edge://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory where you cloned/downloaded the repository.

## Usage

1. After installing the extension, click on the extension icon in the Chrome / Edge toolbar.
2. Use the popup to manage your Salesforce org bookmarks.
3. Customize the headers of different orgs with color codes for easy identification.
4. Hide sandbox banners to create a clutter-free workspace.

## Permissions

This extension requires the following permissions:
- `activeTab`: To interact with the currently active tab.
- `storage`: To store user preferences and bookmarks.
- `tabs`: To manage and organize tabs.

## Files

- `manifest.json`: The configuration file for the Chrome extension.
- `popup.html`: The HTML file for the extension's popup interface.
- `styles.css`: The CSS file for styling the content scripts.
- `content.js`: The JavaScript file for the content scripts.

## Contributing

1. Fork the repository.
2. Create a new branch from `develop` (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License

This project is licensed under the MIT License.