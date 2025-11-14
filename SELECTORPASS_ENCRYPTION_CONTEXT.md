# SelectorPass - Local Encryption Enhancement Context

## Project Overview
**SelectorPass** is a Chrome extension password manager with a unique value proposition:
- **Local-only storage** - No cloud sync, everything stays on device
- **CSS selector targeting** - Advanced precision form filling using custom selectors
- **Privacy-first** - Zero data transmission, no tracking, no servers

## Current Status
- **Live on Chrome Web Store** for 2-3 days
- **21 new users, 19 active users** (90%+ retention rate)
- **6 countries** represented (UK, Egypt, Poland, Iran, Pakistan, US)
- **Professional description and branding** already optimized
- **Strong early adoption** with international appeal

## Security Enhancement Request
**Issue Raised:** Colleague mentioned passwords are stored unencrypted locally
**Current Response:** "Passwords are as secure as your device - no cloud means no network attacks"
**Enhancement Goal:** Add local encryption while maintaining "local-only" principle

## Technical Requirements
1. **Maintain local-only storage** - No cloud sync ever
2. **Add AES-256 encryption** for stored passwords
3. **Minimal user friction** - Ideally transparent or one-time setup
4. **Chrome extension compatible** - Must work with Manifest V3
5. **Marketing benefit** - "Military-grade encryption + local storage"

## Implementation Options

### Option 1: Master Password (Recommended)
- User sets master password on first use
- All passwords encrypted with AES-256 using Web Crypto API
- PBKDF2 key derivation with 100,000 iterations
- **Default:** Unlock once per browser session (when Chrome starts)
- **Power user options:** Auto-lock timeout (15min/1hr/4hr/8hr/never)

### Option 2: Device-Based Key (Zero Setup)
- Generate encryption key from device fingerprint
- Transparent encryption/decryption
- No user password required
- Still secure against data extraction

## Core Encryption Implementation

```javascript
// Web Crypto API encryption functions
const encryptData = async (data, masterPassword) => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // PBKDF2 key derivation
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  
  // AES-GCM encryption
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))
  );
  
  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    salt: Array.from(salt),
    iv: Array.from(iv)
  };
};

const decryptData = async (encryptedData, masterPassword) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Recreate key from master password
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(encryptedData.salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  
  // AES-GCM decryption
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
    key, new Uint8Array(encryptedData.encrypted)
  );
  
  return JSON.parse(decoder.decode(decrypted));
};
```

## Marketing Impact
**Before:** "Local storage only"
**After:** "Military-grade AES-256 encryption + local storage only"

This addresses security concerns while strengthening the competitive advantage over cloud-based password managers.

## Rollout Strategy

### Version 1.1: Dual-Format Support
- **Hybrid approach:** Support both encrypted and unencrypted data simultaneously
- **Zero disruption:** Existing users see no changes to their workflow
- **Opt-in encryption:** New credentials can be encrypted while old ones remain unencrypted
- **Gradual adoption:** Users upgrade to encryption at their own pace

### Version 1.2: Encryption by Default
- **New installations:** Encryption enabled by default for new users
- **Existing users:** Continue with mixed encrypted/unencrypted data
- **Optional bulk encryption:** Settings option to encrypt all existing credentials

### Version 1.3: Enhanced Security Options
- **Advanced settings:** Full power user configuration options
- **Device-based fallback:** Zero-setup encryption for users who skip master password
- **Legacy support:** Indefinite support for unencrypted data

## Dual-Format Data Strategy

### Hybrid Data Support
1. **Read both formats** - Extension handles encrypted and unencrypted credentials seamlessly
2. **Per-credential encryption** - Individual credentials can be encrypted or unencrypted
3. **Automatic detection** - No user intervention required for format detection
4. **Zero data loss** - Existing credentials always remain accessible

### Implementation Architecture
```javascript
// Dual-format credential loading
const loadCredentials = async (domain) => {
  const data = await chrome.storage.local.get('domains');
  const domainData = data.domains[domain];
  
  if (domainData.encrypted) {
    return await decryptCredentials(domainData.credentials);
  } else {
    return domainData.credentials; // Legacy format
  }
};

// Save new credentials with encryption (if enabled)
const saveCredential = async (domain, credential) => {
  const encryptionEnabled = await getEncryptionSetting();
  
  if (encryptionEnabled && masterKeyAvailable()) {
    credential = await encryptCredential(credential);
  }
  
  // Save to storage with format flag
};

// Optional: Bulk encrypt existing data
const encryptAllExistingData = async (masterPassword) => {
  // User-initiated from settings page
  // Encrypt all unencrypted credentials
  // Preserve all domain settings and credential order
};
```

### Data Structure Evolution
```javascript
// Legacy format (unchanged)
domains: {
  "example.com": {
    usernameSelector: "#username",
    passwordSelector: "#password",
    autoSortRecent: true,
    credentials: [
      { username: "user1", password: "pass1" }
    ]
  }
}

// New hybrid format
domains: {
  "example.com": {
    usernameSelector: "#username",
    passwordSelector: "#password",
    autoSortRecent: true,
    encrypted: true, // Domain-level encryption flag
    credentials: [
      { username: "user1", password: "encrypted_data", encrypted: true },
      { username: "user2", password: "plain_text", encrypted: false }
    ]
  }
}
```

## Security Configuration

### Default Settings (Optimal for Most Users)
- **Session type:** Browser session (unlock when Chrome starts)
- **Auto-lock:** Never (stays unlocked until browser closes)
- **Encryption:** AES-256-GCM with PBKDF2 (100,000 iterations)
- **Master password:** Required for new encrypted installations

### Power User Options (Advanced Settings)
- **Auto-lock timeout:** 15 minutes, 1 hour, 4 hours, 8 hours, or never
- **Session type:** Browser session or extension session
- **Encryption fallback:** Device-based key for zero-setup users
- **PBKDF2 iterations:** Configurable (default 100,000)

## Options Page Configuration

### Security Settings Panel
```javascript
// New settings to add to options page
const securitySettings = {
  // Master password
  encryptionEnabled: false,
  masterPasswordSet: false,
  
  // Session management
  sessionType: 'browser', // 'browser' | 'extension'
  autoLockTimeout: 'never', // 'never' | '15min' | '1hr' | '4hr' | '8hr'
  
  // Advanced options (collapsed by default)
  pbkdf2Iterations: 100000,
  deviceBasedFallback: false,
  
  // Migration options
  showEncryptionPrompt: true,
  bulkEncryptionAvailable: false // Set to true if unencrypted data exists
};
```

### Settings UI Components
- **"Enable Encryption" toggle** - Sets up master password for new credentials
- **"Session Timeout" dropdown** - Auto-lock configuration
- **"Encrypt Existing Data" button** - Bulk encryption for legacy credentials
- **"Advanced Security" collapsible section** - Power user options
- **"Reset Encryption" button** - Emergency decrypt all data option

## Minimal UI Changes Required

### Principle: Zero Visual Disruption for Existing Users
- **No new UI elements** in main popup for existing users
- **No encryption badges or icons** by default
- **No prompts or modals** on extension update
- **Identical user experience** until they choose to enable encryption

### Required UI Additions (Minimal)

#### 1. Settings Page Only
```html
<!-- Add to existing settings page -->
<div class="security-section">
  <h3>🔐 Security (Optional)</h3>
  
  <!-- Simple toggle - off by default -->
  <label>
    <input type="checkbox" id="enable-encryption">
    Enable encryption for new credentials
    <span class="help-icon" title="New credentials will be encrypted with AES-256. Existing credentials remain unchanged.">ⓘ</span>
  </label>
  
  <!-- Only show if encryption enabled -->
  <div id="encryption-options" style="display: none;">
    <button id="encrypt-existing">
      Encrypt existing credentials
      <span class="help-icon" title="Upgrade your existing unencrypted credentials to encrypted format. This is optional and reversible.">ⓘ</span>
    </button>
    
    <label>
      Session timeout:
      <span class="help-icon" title="How long to stay unlocked after entering your master password. 'Never' means until you close Chrome completely.">ⓘ</span>
      <select id="session-timeout">
        <option value="never">Stay unlocked until browser closes</option>
        <option value="1hr">Auto-lock after 1 hour</option>
        <option value="4hr">Auto-lock after 4 hours</option>
        <option value="8hr">Auto-lock after 8 hours</option>
      </select>
    </label>
  </div>
</div>

<!-- CSS for help tooltips -->
<style>
.help-icon {
  margin-left: 5px;
  color: #666;
  cursor: help;
  font-size: 14px;
}

.help-icon:hover {
  color: #333;
}
</style>
```

#### 2. Master Password Setup (Only When Needed)
```html
<!-- Simple modal - only appears when user enables encryption -->
<div id="master-password-modal" style="display: none;">
  <h3>Set Master Password</h3>
  <input type="password" placeholder="Master password">
  <input type="password" placeholder="Confirm password">
  <button>Enable Encryption</button>
  <button>Cancel</button>
</div>
```

#### 3. Unlock Prompt (Only When Needed)
```html
<!-- Only appears if user has encrypted data and needs to unlock -->
<div id="unlock-modal" style="display: none;">
  <h3>Enter Master Password</h3>
  <input type="password" placeholder="Master password">
  <button>Unlock</button>
  <small>You can still use unencrypted credentials without unlocking</small>
</div>
```

### What Users See

#### Existing Users (Default Experience)
- **Main popup:** Identical to current version
- **Settings page:** New "Security (Optional)" section at bottom
- **No prompts:** No encryption setup required
- **No changes:** All existing functionality works exactly the same

#### Users Who Enable Encryption
- **First time:** Simple master password setup modal
- **Daily use:** Unlock prompt once when Chrome starts (if they have encrypted data)
- **Settings:** Additional options appear for session timeout and bulk encryption

#### New Users (Future Versions)
- **Same as existing users:** No forced encryption setup
- **Optional prompt:** "Enable encryption?" when saving first credential (can skip)

### Implementation Strategy
- **Phase 1:** Add settings section only - no other UI changes
- **Phase 2:** Add master password and unlock modals (hidden by default)
- **Phase 3:** Optional visual indicators for power users (settings toggle)

### Help Text Strategy
- **Non-intrusive tooltips:** Use ⓘ symbols with hover tooltips for all new settings
- **Plain language:** Explain technical terms in user-friendly language
- **Context-aware:** Show relevant information based on current state
- **Optional:** Help text only appears on hover, doesn't clutter interface

#### Tooltip Content
- **Enable encryption:** "New credentials will be encrypted with AES-256. Existing credentials remain unchanged."
- **Encrypt existing:** "Upgrade your existing unencrypted credentials to encrypted format. This is optional and reversible."
- **Session timeout:** "How long to stay unlocked. 'Never' means you only unlock once when Chrome starts."
- **Master password:** "Used to encrypt/decrypt your credentials. Choose something secure but memorable."
- **Advanced settings:** "Power user options for encryption strength and session management."

#### Help Icon Implementation
```html
<!-- Example usage in settings -->
<label>
  <input type="checkbox" id="enable-encryption">
  Enable encryption for new credentials
  <span class="help-icon" title="New credentials will be encrypted with AES-256. Existing credentials remain unchanged.">ⓘ</span>
</label>
```

```css
.help-icon {
  margin-left: 5px;
  color: #666;
  cursor: help;
  font-size: 14px;
}

.help-icon:hover {
  color: #333;
}
```

### Zero Disruption Guarantee
- **No new buttons** in main popup
- **No encryption status indicators** by default
- **No workflow changes** for existing functionality
- **No forced decisions** or setup screens
- **Settings-driven:** All encryption features opt-in through settings page
- **Help on demand:** Explanations only visible when user hovers over ⓘ symbols

## Implementation Priority

### Phase 1: Core Encryption (Version 1.1)
1. **Web Crypto API integration** - AES-256-GCM encryption functions
2. **Dual-format data loading** - Support both encrypted and unencrypted credentials
3. **Master password setup UI** - Modal for first-time encryption setup
4. **Visual status indicators** - Encryption badges and icons in main UI

### Phase 2: Settings Integration (Version 1.2)
1. **Security settings panel** - Complete options page integration
2. **Bulk encryption feature** - "Encrypt All Data" functionality
3. **Session management UI** - Timeout configuration and unlock modal
4. **Contextual help** - Tooltips and progressive disclosure

### Phase 3: Advanced Features (Version 1.3)
1. **Power user settings** - Advanced security configuration
2. **Encryption statistics** - Usage analytics and coverage reporting
3. **Import/export with encryption** - Maintain security during data transfer
4. **Accessibility improvements** - Screen reader support for security status setup** - Simple UI for password creation
4. **Basic session management** - Browser session unlock by default

### Phase 2: Options Integration (Version 1.2)
1. **Security settings panel** - Add encryption options to existing settings page
2. **Bulk encryption feature** - "Encrypt All Data" button for existing users
3. **Session timeout options** - Auto-lock configuration
4. **Visual encryption indicators** - Show which credentials are encrypted

### Phase 3: Advanced Features (Version 1.3)
1. **Power user settings** - PBKDF2 iterations, session types
2. **Device-based fallback** - Zero-setup encryption option
3. **Import/export with encryption** - Maintain encryption during data transfer
4. **Security audit features** - Show encryption coverage statistics

---

**Next Steps:** Implement dual-format encryption support with clear visual indicators to address security feedback while maintaining zero disruption for existing users and preserving the core "local-only" value proposition. The UI design ensures users always understand their security status without overwhelming them with complexity.