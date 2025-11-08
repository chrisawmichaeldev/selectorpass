# SelectorPass

**Precision password manager Chrome extension with CSS selector targeting and local-only storage**

## Demo

[**Test page for extension →**](https://chrisawmichaeldev.github.io/selectorpass/demo.html) *(requires extension installed)*

## Features

- **Domain-specific configuration**: Set CSS selectors once per domain
- **Multiple credentials per domain**: Store multiple accounts for the same site
- **Local-only storage**: Complete privacy with no cloud sync
- **Precision targeting**: Manual CSS selectors when auto-detection fails
- **Clean interface**: Professional popup and options pages
- **Auto-sort recent**: Recently used credentials move to top
- **Drag & drop**: Reorder credentials with intuitive interface

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

### Configure a Domain

1. Click the extension icon and select "Configure Domain" or go to Settings
2. Enter the domain (e.g., `github.com`)
3. Specify CSS selectors for username and password fields
4. Save the configuration

### Add Credentials

1. In Settings, select a configured domain
2. Enter username and password
3. Add multiple credentials for the same domain if needed

### Fill Credentials

1. Navigate to a configured website
2. Click the extension icon
3. Select which credential to use
4. Click "Fill" to auto-fill the form

## Data Structure

The extension uses a unified data structure:

```javascript
domains: {
  "example.com": {
    usernameSelector: "#username",
    passwordSelector: "#password",
    autoSortRecent: true,
    credentials: [
      { username: "user1", password: "pass1" },
      { username: "user2", password: "pass2" }
    ]
  }
}
```

## Development

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- Local storage API
- CSS selector targeting

## License

MIT License