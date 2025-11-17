# SelectorPass

**Precision password manager Chrome extension with CSS selector targeting and local-only storage**

## Demo

[**📺 Watch Demo Video →**](https://youtu.be/Lw2BCiFpCqY)

[**Test page for extension →**](https://chrisawmichaeldev.github.io/selectorpass/demo.html) *(requires extension installed)*

## Features

- **Domain-specific configuration**: Set CSS selectors once per domain
- **Multiple credentials per domain**: Store multiple accounts for the same site
- **Local-only storage**: Complete privacy with no cloud sync
- **Optional AES-256-GCM encryption**: Military-grade security with authenticated encryption
- **PBKDF2 key derivation**: 100,000 iterations for secure key generation from master password
- **Per-credential encryption**: Choose which credentials to encrypt individually
- **Stateless security**: Master password required for each encryption operation (maximum security)
- **Cross-context sync**: Login status synchronized between popup and options page
- **Direct password prompting**: Enter master password directly in popup when needed
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
4. Enter master password if prompted for encrypted credentials (🔐 icon indicates encryption)
5. Click "Fill" to auto-fill the form
6. Popup closes automatically after successful filling

### Manage Your Data

- **Edit credentials**: Click "Edit" button to modify saved accounts
- **Setup encryption**: Configure master password (8+ characters) in Security section
- **Encrypt/decrypt**: Toggle encryption per credential with 🔐/🔓 buttons  
- **Change master password**: Update master password while preserving encrypted credentials
- **Direct popup authentication**: Enter master password directly when filling encrypted credentials
- **Visual indicators**: 🔐 icons show encrypted credentials, 🔓/🚫 show login status
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
- **Master password prompt**: Enter password for each encrypted credential operation (stateless security)
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