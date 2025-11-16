# SelectorPass

**Precision password manager Chrome extension with CSS selector targeting and local-only storage**

## Demo

[**📺 Watch Demo Video →**](https://youtu.be/Lw2BCiFpCqY)

[**Test page for extension →**](https://chrisawmichaeldev.github.io/selectorpass/demo.html) *(requires extension installed)*

## Features

- **Domain-specific configuration**: Set CSS selectors once per domain
- **Multiple credentials per domain**: Store multiple accounts for the same site
- **Local-only storage**: Complete privacy with no cloud sync
- **Optional AES-256 encryption**: Military-grade security for sensitive credentials
- **Session management**: Master password remembered across contexts until browser close
- **Per-credential encryption**: Choose which credentials to encrypt individually
- **Precision targeting**: Manual CSS selectors when auto-detection fails
- **Smart domain detection**: Auto-populates domain from current tab
- **Auto-sort recent**: Recently used credentials move to top
- **Drag & drop**: Reorder credentials with intuitive interface
- **Collapsible interface**: Organize domains with expandable sections
- **Real-time sync**: Login status updates instantly across popup and options
- **Secure password prompts**: Masked input fields for master password entry
- **Confirmation dialogs**: Safe deletion with cancel options
- **Persistent settings**: Remembers UI state and preferences

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

### Configure a Domain

1. Navigate to the website you want to configure
2. Click the extension icon and select "Settings"
3. Domain field auto-populates with current site (if not already configured)
4. Enter CSS selectors for username and password fields (e.g., `#username`, `#password`)
5. "Auto-sort recent" is enabled by default (disable if you prefer manual ordering)
6. Click "Save Domain"

### Add Credentials

1. In Settings, find your configured domain
2. Click "Add Credential" for that domain
3. Enter username and password
4. Click "Save Credential"
5. Repeat to add multiple accounts for the same domain
6. Use drag & drop to reorder credentials as needed

### Fill Credentials

1. Navigate to a configured website
2. Click the extension icon
3. Choose from your saved credentials (🔐 indicates encrypted)
4. Enter master password if prompted for encrypted credentials
5. Click "Fill" to auto-fill the form
6. Popup closes automatically after successful filling

### Manage Your Data

- **Edit credentials**: Click "Edit" button to modify saved accounts
- **Encrypt/decrypt**: Toggle encryption per credential with 🔐/🔓 buttons
- **Master password**: Set up optional master password for encryption
- **Session login**: Login once, access encrypted credentials until browser close
- **Delete safely**: Confirmation dialogs prevent accidental deletion
- **Update selectors**: Re-save domain with new CSS selectors (preserves credentials)
- **Organize domains**: Collapse/expand sections, state persists across sessions

## Data Structure

The extension uses a unified data structure supporting both encrypted and unencrypted credentials:

```javascript
{
  domains: {
    "example.com": {
      usernameSelector: "#username",
      passwordSelector: "#password",
      autoSortRecent: true,
      credentials: [
        // Unencrypted credential
        { username: "user1", password: "pass1" },
        
        // Encrypted credential
        { 
          username: "user2",
          password: {
            encrypted: [1,2,3,...],
            salt: [4,5,6,...],
            iv: [7,8,9,...]
          },
          encrypted: true
        }
      ]
    }
  },
  securitySettings: {
    masterPasswordSet: true,
    masterPasswordHash: "sha256_hash",
    pbkdf2Iterations: 100000
  }
}
```

## Troubleshooting

- **"No configuration found"**: Domain not yet configured - click Settings to add it
- **Form not filling**: Check CSS selectors are correct for the website
- **Invalid selectors**: Extension saves any selectors you enter (validation is visual)
- **Missing credentials**: Ensure you're on the correct domain and have saved credentials
- **Encrypted credentials not filling**: Ensure you're logged in with master password
- **Master password prompt**: Enter password once per browser session for encrypted credentials
- **Options not updating**: Real-time sync should work automatically via port connections

## Testing

See [MANUAL_TESTS.md](MANUAL_TESTS.md) for comprehensive testing procedures.

## Development

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- Web Crypto API (AES-256-GCM encryption)
- Chrome Storage API
- Chrome Runtime Messaging
- CSS selector targeting

## License

MIT License