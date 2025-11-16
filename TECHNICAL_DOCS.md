# SelectorPass Technical Documentation

## Overview

SelectorPass is a Chrome extension password manager built with privacy-first principles. It uses CSS selector targeting for precise form filling and stores all data locally with optional AES-256 encryption.

### Key Features
- **Local-only storage**: No cloud sync, complete privacy
- **CSS selector targeting**: Manual precision when auto-detection fails
- **Optional encryption**: AES-256-GCM with PBKDF2 key derivation
- **Multiple credentials per domain**: Support for multiple accounts
- **Drag & drop reordering**: Intuitive credential management
- **Auto-sort recent**: Recently used credentials move to top
- **Collapsible interface**: Organized domain management
- **Manifest V3**: Modern Chrome extension architecture

## Architecture Overview

### Extension Components

#### Popup (`popup.html/js/css`)
- **Purpose**: Quick credential selection and form filling
- **Context**: Extension popup window
- **Key functions**: Domain detection, credential listing, form filling
- **Storage access**: Read domains and credentials
- **Communication**: Messages to content script for form filling

#### Options Page (`options.html/js/css`)
- **Purpose**: Domain configuration and credential management
- **Context**: Full browser tab
- **Key functions**: Domain CRUD, credential CRUD, encryption settings
- **Storage access**: Full read/write access to all data
- **UI features**: Collapsible sections, drag & drop, confirmation dialogs

#### Content Script (`content-script.js`)
- **Purpose**: Form filling on web pages
- **Context**: Injected into web pages
- **Key functions**: CSS selector targeting, form field population
- **Security**: Encapsulated to avoid namespace pollution
- **Communication**: Receives messages from popup

#### Background Script (`background.js`)
- **Purpose**: Session management and cross-context communication
- **Context**: Service worker (persistent background process)
- **Key functions**: Master password session storage, message handling
- **Security**: In-memory only storage, no persistent storage of master password
- **Communication**: Message passing hub for popup and options contexts

#### Encryption Module (`encryption.js`)
- **Purpose**: Cryptographic operations
- **Context**: Shared across popup and options
- **Key functions**: AES-256 encryption/decryption, background script communication
- **APIs**: Web Crypto API for all cryptographic operations
- **Storage**: No direct storage, communicates with background script

### Data Flow

```
User clicks extension icon
         ↓
Popup loads → getCurrentDomain() → Check storage for domain config
         ↓                                    ↓
   Domain found?                        Domain not found
         ↓                                    ↓
Load credentials → Check encryption → Show "No config" message
         ↓              ↓
   Encrypted?     Unencrypted
         ↓              ↓
Prompt for password → Display credentials → User clicks Fill
         ↓                                        ↓
Decrypt credentials ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
         ↓
Inject content script → Send fill message → Fill form fields
```

## Data Structure Evolution

### Legacy Data Structure (v1.0)

```javascript
{
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
}
```

### Current Data Structure (v1.1+)

```javascript
{
  domains: {
    "example.com": {
      usernameSelector: "#username",
      passwordSelector: "#password",
      autoSortRecent: true,
      credentials: [
        // Unencrypted credential (legacy format)
        { username: "user1", password: "pass1" },
        
        // Encrypted credential (new format)
        { 
          username: "user2", // Username stored in plain text
          password: {        // Password encrypted with AES-256-GCM
            encrypted: [1,2,3,...], // Encrypted data as byte array
            salt: [4,5,6,...],       // PBKDF2 salt as byte array  
            iv: [7,8,9,...]          // AES-GCM IV as byte array
          },
          encrypted: true    // Flag indicating this credential is encrypted
        }
      ]
    }
  },
  
  // Security settings
  securitySettings: {
    masterPasswordSet: true,
    masterPasswordHash: "sha256_hash_of_master_password",
    pbkdf2Iterations: 100000
  }
  
  // Note: Master password is stored in-memory only in background script
  // No persistent storage of plaintext master password
  
  // UI state persistence
  addDomainExpanded: false,
  securityExpanded: false, 
  manageDomainsExpanded: true,
  domainStates: {
    "example.com": true, // true = expanded, false = collapsed
    "another.com": false
  }
}
```

## Encryption Implementation

### Algorithm Details
- **Encryption**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (configurable)
- **Salt**: 16 bytes (128-bit) random
- **IV**: 12 bytes (96-bit) random for GCM mode

### Encryption Process
1. User enters master password
2. Generate random 16-byte salt
3. Generate random 12-byte IV
4. Derive AES-256 key using PBKDF2(master_password, salt, 100000, SHA-256)
5. Encrypt password using AES-256-GCM(key, iv, plaintext)
6. Store: `{ encrypted: [bytes], salt: [bytes], iv: [bytes], encrypted: true }`

### Decryption Process
1. Retrieve master password from session
2. Recreate AES-256 key using stored salt: PBKDF2(master_password, salt, 100000, SHA-256)  
3. Decrypt using AES-256-GCM(key, stored_iv, encrypted_bytes)
4. Return plaintext password

### Security Features
- **Username in plaintext**: For usability - users can see which account they're selecting
- **Password encrypted**: Sensitive data protected with military-grade encryption
- **Session management**: Master password stored temporarily for user convenience
- **Auto-lock**: Configurable timeout to clear master password from memory
- **Re-encryption**: Changing master password re-encrypts all existing data

## Architecture

### File Structure
```
selectorpass/
├── manifest.json          # Extension manifest (Manifest V3)
├── background.js          # Service worker for session management
├── popup.html/js/css      # Extension popup interface
├── options.html/js/css    # Settings/configuration page
├── content-script.js      # Injected script for form filling
├── encryption.js          # Encryption/decryption functions
└── icons/                 # Extension icons
```

### Cross-Context Communication
- **Popup ↔ Options**: Shared `chrome.storage.local` for data persistence
- **Session sharing**: Background script holds master password in memory
- **Message passing**: `chrome.runtime.sendMessage()` for cross-context communication
- **Content script**: Message passing for form filling commands
- **Background script**: Central hub for session management and authentication

### Storage Strategy
- **Local only**: All data stored in `chrome.storage.local`
- **No cloud sync**: Privacy-first approach, everything stays on device
- **Backward compatibility**: Supports both encrypted and unencrypted credentials
- **Graceful migration**: Users can gradually adopt encryption

### Session Management Architecture
- **Background script**: Service worker maintains master password in memory
- **Session duration**: Until browser closes (simplified from configurable options)
- **Cross-context access**: Popup and options request master password via messaging
- **Real-time updates**: Port-based connections for instant login status sync
- **Security**: No persistent storage of plaintext master password
- **Message flow**: 
  ```
  Popup login → Background Script → Port broadcast → Options update
                       ↓
  Master password in memory (session only)
  ```

## Security Considerations

### Threat Model
- **Protected against**: Data extraction from storage, network interception, casual access
- **Not protected against**: Malware with system access, keyloggers, browser exploits
- **Assumption**: User's device is reasonably secure
- **Design philosophy**: Optional security - users choose their own risk/convenience balance

### Master Password Security
- **Minimum length**: 8 characters (enforced)
- **Storage**: SHA-256 hash stored for verification only
- **Session**: Plaintext stored in-memory only in background script
- **No persistent storage**: Never stored in chrome.storage or disk
- **Clearing**: Removed on browser close only (simplified from multiple options)
- **Cross-context access**: Via secure message passing only
- **UI security**: Masked password inputs in custom modals

### Data Migration
- **Seamless**: Old unencrypted credentials work alongside encrypted ones
- **Per-credential choice**: Users can encrypt/decrypt individual credentials
- **Backward compatibility**: No breaking changes to existing data
- **Gradual adoption**: Users can migrate to encryption at their own pace

## Real-Time Communication

### Port-Based Messaging
- **Connection establishment**: Options pages connect to background script via named ports
- **Instant updates**: Login status changes broadcast immediately to all connected contexts
- **Automatic cleanup**: Disconnected ports removed automatically
- **Multiple tabs**: Supports multiple options tabs with synchronized state

### Event Flow
```
User logs in via popup
         ↓
Background script stores session
         ↓
Broadcast to all connected ports
         ↓
Options pages update UI instantly
```

## Security Model

### Encryption Details
- **Algorithm**: AES-256-GCM with PBKDF2 key derivation
- **Key derivation**: 100,000 iterations of PBKDF2 with SHA-256
- **Salt**: 16 bytes random per credential
- **IV**: 12 bytes random per encryption
- **Storage**: Only encrypted data and metadata stored persistently

### Session Security
- **Memory only**: Master password never persisted to disk
- **Browser lifetime**: Session cleared on browser close
- **Cross-context**: Secure sharing via background script messaging
- **No network**: All operations local to device data continues to work
- **Optional**: Users choose when to enable encryption
- **Bulk encryption**: One-click option to encrypt all existing credentials
- **Re-encryption**: Master password changes re-encrypt all data automatically

## Performance Considerations

### Encryption Performance
- **PBKDF2 iterations**: 100,000 provides good security/performance balance
- **Async operations**: All crypto operations use Web Crypto API (non-blocking)
- **Caching**: Master password kept in memory during session

### UI Performance  
- **Lazy loading**: Credentials decrypted only when needed
- **Batch operations**: Multiple credentials processed efficiently
- **Responsive UI**: Encryption doesn't block user interface

### Storage Efficiency
- **Minimal overhead**: Encryption adds ~50 bytes per credential
- **Compression**: Not implemented (Chrome storage handles compression)
- **Cleanup**: No orphaned data or memory leaks

## Browser Compatibility

### Requirements
- **Chrome**: Manifest V3 support (Chrome 88+)
- **APIs used**: `chrome.storage.local`, `chrome.tabs`, `chrome.scripting`
- **Web Crypto**: Native browser encryption (Chrome 37+)
- **Permissions**: `storage`, `activeTab`, `scripting`

### Limitations
- **Firefox**: Not compatible (uses Manifest V2)
- **Safari**: Not compatible (different extension system)
- **Mobile**: Not supported (Chrome extensions desktop-only)

## Development Notes

### Code Organization
- **Modular**: Encryption logic separated from UI logic
- **Error handling**: Comprehensive try-catch blocks
- **Logging**: Debug messages for troubleshooting
- **Validation**: Input validation for all user data

### Testing Strategy
- **Manual testing**: Comprehensive test suite in `MANUAL_TESTS.md`
- **Edge cases**: Invalid inputs, network failures, storage limits
- **Security testing**: Encryption/decryption verification
- **Performance testing**: Large datasets, multiple domains

### Future Enhancements
- **Biometric unlock**: WebAuthn integration for passwordless access
- **Backup/export**: Encrypted data export for migration
- **Advanced settings**: Configurable PBKDF2 iterations
- **Audit logging**: Track encryption/decryption events