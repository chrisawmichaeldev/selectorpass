# SelectorPass Manual Test Suite

This document contains comprehensive manual tests for the SelectorPass Chrome extension using Gherkin format.

## Prerequisites

- Chrome browser with SelectorPass extension installed
- Demo page available at: https://chrisawmichaeldev.github.io/selectorpass/demo.html

---

## 🔥 CRITICAL: Core Functionality

### Scenario: Extension loads and popup opens
```gherkin
Given I have Chrome browser with SelectorPass extension installed
When I click the extension icon in the toolbar
Then the popup should open
And I should see "No configuration found for this domain." message
And I should see "Settings" button
```
- [x] Test needed

### Scenario: Basic domain configuration and credential filling
```gherkin
Given I am on the SelectorPass options page
When I enter "chrisawmichaeldev.github.io" in the domain field
And I enter "#username" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then the domain should appear in the domains list
When I add credential "demouser" / "demopass"
And I navigate to https://chrisawmichaeldev.github.io/selectorpass/demo.html
And I click the SelectorPass extension icon
Then I should see the credential "demouser" listed
When I click "Fill" button for that credential
Then the username field should contain "demouser"
And the password field should contain "demopass"
And the popup should close
```
- [x] Test needed

---

## 🔐 CRITICAL: Popup Login Status & Encrypted Credentials

### Scenario: Popup shows correct login status
```gherkin
Given I have master password set up
When I am logged out
And I open the popup
Then I should see 🚫 icon in the status area
When I am logged in
And I open the popup
Then I should see 🔓 icon in the status area
```
- [x] Test needed

### Scenario: Popup shows credentials in correct order (auto-sort enabled)
```gherkin
Given I have domain with auto-sort enabled
And I have credentials in order: "user1", "user2", "user3"
When I use "user3" credential to fill a form
And I reopen the popup
Then credentials should be in order: "user3", "user1", "user2"
```
- [x] Test needed

### Scenario: Popup shows credentials in original order (auto-sort disabled)
```gherkin
Given I have domain with auto-sort disabled
And I have credentials in order: "user1", "user2", "user3"
When I use "user3" credential to fill a form
And I reopen the popup
Then credentials should remain in order: "user1", "user2", "user3"
```
- [x] Test needed

### Scenario: Popup prompts for login when using encrypted credentials (logged out)
```gherkin
Given I have encrypted credentials for a domain
And I am not currently logged in (popup shows 🚫)
When I navigate to that domain
And I click the extension icon
And I click "Fill" for an encrypted credential (shows 🔐)
Then I should see a password modal "Enter your master password"
When I enter the correct master password and click "OK"
Then the form should be filled with the decrypted credentials
And the popup should close
And the popup status should update to 🔓 (logged in)
```
- [x] Test needed

### Scenario: Popup does not prompt when using encrypted credentials (already logged in)
```gherkin
Given I have encrypted credentials for a domain
And I am currently logged in (popup shows 🔓)
When I navigate to that domain
And I click "Fill" for an encrypted credential (shows 🔐)
Then the form should be filled immediately without prompting
And the popup should close
```
- [x] Test needed

### Scenario: Mixed encrypted and unencrypted credentials in popup
```gherkin
Given I have a domain with both encrypted and unencrypted credentials
When I open the popup
Then encrypted credentials should show 🔐 icon
And unencrypted credentials should show no icon
When I use an unencrypted credential
Then it should fill immediately without password prompt
When I use an encrypted credential (and not logged in)
Then it should prompt for master password
```
- [x] Test needed

---

## 🔄 CRITICAL: Login Status Synchronization

### Scenario: Login via popup - all contexts sync immediately
```gherkin
Given I have master password set up and am logged out
And I have the options page open showing "🚫 Logged out"
When I navigate to a configured domain with encrypted credentials
And I click the extension icon (popup shows 🚫)
And I click "Fill" for an encrypted credential
And I enter the master password in the popup modal
Then the form should fill and popup should close
And when I check the options page (without refreshing)
Then it should immediately show "🔓 Logged in"
And when I reopen the popup
Then it should show 🔓 icon
```
- [x] Test needed

### Scenario: Login via options page - popup syncs immediately
```gherkin
Given I have master password set up and am logged out
And I have the options page open showing "🚫 Logged out"
When I enter master password in the options page security section
And I click "Login"
Then the options page should immediately show "🔓 Logged in"
And when I open the popup in a new tab
Then the popup should show 🔓 icon without delay
And encrypted credentials should be usable immediately
```
- [x] Test needed

### Scenario: Logout via options page - all contexts sync immediately
```gherkin
Given I am logged in (🔓 status in both popup and options)
And I have the options page open showing "🔓 Logged in"
When I click "Logout" in the options page security section
Then the options page should immediately show "🚫 Logged out"
And when I open the popup in a new tab
Then the popup should show 🚫 icon
And encrypted credentials should require master password
```
- [x] Test needed

### Scenario: Browser restart clears login status everywhere
```gherkin
Given I am logged in across all contexts (🔓 everywhere)
When I close the entire browser and reopen
And I open the options page
Then it should show "🚫 Logged out"
When I open the popup
Then it should show 🚫 icon
And encrypted credentials should require password prompt
```
- [x] Test needed

### Scenario: Real-time sync across multiple popup instances
```gherkin
Given I have two popup windows open (different tabs)
And both show 🚫 logged out status
When I login via one popup by filling an encrypted credential
Then both popup windows should update to show 🔓 status immediately
And both should allow encrypted credential access without prompting
```
- [x] Test needed

### Scenario: Multiple popups with options page open - complex sync
```gherkin
Given I have the options page open showing "🚫 Logged out"
And I have popup window A open on tab 1 showing 🚫
And I have popup window B open on tab 2 showing 🚫
When I login via popup window A by filling an encrypted credential
Then popup window A should close (form filled)
And popup window B should immediately show 🔓 status
And the options page should immediately show "🔓 Logged in"
When I open a new popup window C on tab 3
Then popup window C should show 🔓 status without delay
```
- [x] Test needed

### Scenario: Login from options page with multiple popups open
```gherkin
Given I have popup window A open showing 🚫
And I have popup window B open showing 🚫
And I have the options page open showing "🚫 Logged out"
When I click "Login" in the options page and enter master password
Then the options page should immediately show "🔓 Logged in"
And popup window A should immediately show 🔓 status
And popup window B should immediately show 🔓 status
And all popups should allow encrypted credential access without prompting
```
- [x] Test needed

---

## 📝 CRITICAL: Options Page Credential Management

### Scenario: Edit credentials maintains correct identity
```gherkin
Given I have domain with credentials: "user1"/"pass1", "user2"/"pass2", "user3"/"pass3"
When I click "Edit" on the second credential ("user2")
Then the edit form should show username "user2" and password "pass2"
When I change the password to "newpass2" and save
Then the second credential should show "user2"/"newpass2"
And the first credential should still be "user1"/"pass1"
And the third credential should still be "user3"/"pass3"
```
- [x] Test needed

### Scenario: Reorder credentials before editing does not affect which credential is edited
```gherkin
Given I have credentials in order: "user1", "user2", "user3"
When I drag "user3" to the top (new order: "user3", "user1", "user2")
And I click "Edit" on what is now the second credential ("user1")
Then the edit form should show "user1" data (not "user2" data)
When I change the password and save
Then "user1" should be updated (not "user2")
```
- [x] Test needed

### Scenario: Reorder credentials after editing maintains changes
```gherkin
Given I have credentials: "user1"/"pass1", "user2"/"pass2", "user3"/"pass3"
When I edit "user2" and change password to "newpass2"
And I drag "user2" to the top position
Then "user2" should still show "newpass2" (changes preserved)
And the credential order should be: "user2", "user1", "user3"
```
- [x] Test needed

### Scenario: Edit encrypted credential when logged in
```gherkin
Given I have an encrypted credential "user1" (shows 🔐)
And I am logged in with master password
When I click "Edit" for that credential
Then the username field should show "user1"
And the password field should be populated with the decrypted password
When I click the eye icon to show the password
Then the password should be visible in plain text
When I change the password and save
Then the credential should remain encrypted (still shows 🔐)
```
- [x] Test needed

### Scenario: Edit encrypted credential when logged out
```gherkin
Given I have an encrypted credential "user1"
And I am logged out
When I click "Edit" for that encrypted credential
Then the username field should show "user1"
And the password field should show placeholder "Password (encrypted - enter new to change)"
When I click the eye icon next to the password field
Then I should see a master password prompt
When I enter the correct master password
Then the credential should exit edit mode (known limitation)
And I should click "Edit" again to continue editing
And the password field should be populated with the decrypted password
```
- [x] Test needed

---

## 🔄 CRITICAL: Data Migration Safety

### Scenario: Migration from previous version preserves all data
```gherkin
Given I have SelectorPass data from a previous version (without credential IDs)
And I have domains: "site1.com" with 3 credentials, "site2.com" with 2 credentials
When I upgrade to the new version
And I open the options page
Then all domains should be visible and functional
And all credentials should be preserved with correct usernames/passwords
And each credential should receive a unique ID
And all functionality should work normally
```
- [x] Test needed

**Manual Setup for Legacy Data Testing:**
1. Open Chrome DevTools (F12)
2. Go to Application tab → Storage → Local Storage → chrome-extension://[extension-id]
3. Add key `domains` with this legacy data (no credential IDs):
```json
{
  "example.com": {
    "usernameSelector": "#username",
    "passwordSelector": "#password", 
    "autoSortRecent": true,
    "credentials": [
      {"username": "legacy_user1", "password": "pass1"},
      {"username": "legacy_user2", "password": "pass2", "encrypted": true, "password": {"encrypted": [1,2,3], "salt": [4,5,6], "iv": [7,8,9]}}
    ]
  },
  "test.com": {
    "usernameSelector": ".user-input",
    "passwordSelector": ".pass-input",
    "autoSortRecent": false,
    "credentials": [
      {"username": "old_user", "password": "oldpass"}
    ]
  }
}
```
4. Refresh the extension options page
5. Verify all credentials get IDs and work correctly

### Scenario: Migration handles mixed encrypted/unencrypted credentials
```gherkin
Given I have data from previous version with both encrypted and unencrypted credentials
When I upgrade to the new version
Then all unencrypted credentials should remain unencrypted and functional
And all encrypted credentials should remain encrypted and functional
And I should be able to decrypt encrypted credentials with my existing master password
And migration should only run once (migrated flag set)
```
- [x] Test needed

**Manual Setup for Mixed Legacy Data:**
1. Use Chrome DevTools to set legacy data with mixed encryption
2. Also add security settings: `securitySettings` key with value:
```json
{"masterPasswordSet": true, "masterPasswordHash": "your_hash_here", "pbkdf2Iterations": 100000}
```
3. Test that encrypted credentials require master password
4. Test that unencrypted credentials work immediately
5. Verify `migrated: true` flag is set after first load

### Scenario: Migration preserves domain settings
```gherkin
Given I have previous version data with custom domain settings
And domains have auto-sort disabled and custom CSS selectors
When I upgrade to the new version
Then all domain settings should be preserved
And auto-sort settings should remain as configured
And CSS selectors should remain unchanged
And domain configurations should work correctly
```
- [x] Test needed

---

## 🔐 HIGH: Advanced Encryption Features

### Scenario: Encrypt existing unencrypted credential
```gherkin
Given I have an unencrypted credential (no 🔐 icon)
And I am logged in with master password
When I click the "🔐" (encrypt) button for that credential
Then I should see confirmation "Encrypt this credential?"
When I click "OK"
Then the credential should show 🔐 icon
And the button should change to "🔓" (decrypt)
And the credential should be encrypted in storage
```
- [x] Test needed

### Scenario: Decrypt credential (remove encryption)
```gherkin
Given I have an encrypted credential (shows 🔐)
And I am logged in with master password
When I click the "🔓" (decrypt) button for that credential
Then I should see confirmation "Remove encryption from this credential?"
When I click "OK"
Then the 🔐 icon should disappear
And the button should change to "🔐" (encrypt)
And the credential should be unencrypted in storage
```
- [x] Test needed

### Scenario: Change master password re-encrypts all credentials
```gherkin
Given I have 5 encrypted credentials across multiple domains
And I have existing master password "oldpass123"
When I click "Change Master Password"
And I enter new password "newpass456" and confirm
Then I should see "Master password changed successfully!"
And all 5 encrypted credentials should work with new password
And none should work with old password
And login status should remain active
```
- [x] Test needed

### Scenario: Reset master password removes only encrypted credentials
```gherkin
Given I have 3 encrypted credentials and 2 unencrypted credentials
When I click "Reset Master Password"
Then I should see warning "This will permanently delete ALL encrypted credentials"
When I click "Reset Master Password" in the dialog
Then I should see "Master password reset successfully"
And all 3 encrypted credentials should be removed
And all 2 unencrypted credentials should remain
And the security section should show "Setup Master Password" button
```
- [x] Test needed

---

## 🎯 HIGH: User Experience Features

### Scenario: Auto-sort moves recently used credential to top
```gherkin
Given I have auto-sort enabled for "chrisawmichaeldev.github.io"
And I have credentials in order: "user1", "user2", "user3"
When I navigate to the demo page
And I use "user3" credential to fill the form
And I return to the options page
Then "user3" should now be at the top of the list
And the order should be: "user3", "user1", "user2"
```
- [x] Test needed

### Scenario: Drag and drop reordering works correctly
```gherkin
Given I have credentials in order: "user1", "user2", "user3", "user4"
And drag handles (⋮⋮) should be visible and functional
When I drag "user4" to the top (drop on "user1")
Then the order should become: "user4", "user1", "user2", "user3"
When I drag "user1" to the middle (drop on "user3")
Then the order should become: "user4", "user2", "user1", "user3"
When I drag "user4" to the bottom (drop below all)
Then the order should become: "user2", "user1", "user3", "user4"
And the final order should persist after page refresh
```
- [x] Test needed

### Scenario: Cross-domain dragging is prevented
```gherkin
Given I have domain "site1.com" with credential "user1"
And I have domain "site2.com" with credential "user2"
When I try to drag "user1" from site1.com to site2.com credentials area
Then the drag should not be allowed
And "user1" should remain in site1.com
And "user2" should remain in site2.com
```
- [x] Test needed

### Scenario: Drag and drop visual feedback works correctly
```gherkin
Given I have multiple credentials in a domain
When I start dragging a credential
Then the dragged item should become semi-transparent (opacity 0.5)
And drag handles should be visible
When I hover over another credential while dragging
Then a blue border should appear above the target credential
When I drop the credential
Then all visual indicators should be cleared
And the dragged item should return to normal opacity
```
- [x] Test needed

### Scenario: Domain sections collapse and expand with state persistence
```gherkin
Given I have a domain with credentials configured
And the domain section is expanded
When I click the domain header
Then the credentials section should collapse
And the arrow should point right (▶)
When I refresh the options page
Then the domain section should remain collapsed
When I click the domain header again
Then the credentials section should expand
And the arrow should point down (▼)
```
- [x] Test needed

---

## ⚠️ MEDIUM: Error Handling & Validation

### Scenario: Invalid CSS selectors are rejected
```gherkin
Given I am configuring a new domain
When I enter "example.com" in the domain field
And I enter "#invalid..selector" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain"
Then I should see "Please enter a valid CSS selector for username field"
And the domain should not be saved
And the form should retain the entered values
```
- [x] Test needed

### Scenario: Empty fields are validated
```gherkin
Given I am adding a new credential
When I leave username or password empty
And I click "Add"
Then I should see "Username and password are required"
And the credential should not be saved
```
- [ ] Test needed

### Scenario: Incorrect master password shows error but preserves UI
```gherkin
Given I have encrypted credentials and am logged out
When I try to fill an encrypted credential
And I enter an incorrect master password
Then I should see "Incorrect master password" error
And the credentials list should remain visible
And I should be able to try again
```
- [ ] Test needed

---

## 🔧 MEDIUM: Domain Configuration

### Scenario: Domain auto-populates from current tab (new domain)
```gherkin
Given I am on "example.com" website
And "example.com" is NOT configured in the extension
When I click the extension icon and then "Settings"
Then the options page should open
And the domain field should be pre-filled with "example.com"
```
- [ ] Test needed

### Scenario: Settings button opens options normally (existing domain)
```gherkin
Given I have "chrisawmichaeldev.github.io" already configured
And I am on "chrisawmichaeldev.github.io" website
When I click the extension icon and then "Settings"
Then the options page should open normally
And the domain field should be empty
And I should see the existing domain in the domains list
```
- [ ] Test needed

### Scenario: Update existing domain preserves credentials
```gherkin
Given I have domain "example.com" with 3 credentials
When I edit the domain and change selectors from "#user" to "#email"
And I save the changes
Then the domain should show updated selectors
And all 3 credentials should be preserved
And form filling should work with new selectors
```
- [ ] Test needed

---

## 💾 LOW: Data Persistence & System Integration

### Scenario: Data persists after browser restart
```gherkin
Given I have configured domains and credentials
When I close and restart Chrome browser
And I open the extension options
Then all my domains should still be listed
And all credentials should be preserved
And all settings should be maintained
```
- [ ] Test needed

### Scenario: Extension reload clears login session but preserves data
```gherkin
Given I am logged in with master password
And I have configured domains and credentials
When I go to chrome://extensions/ and reload SelectorPass
Then all domains and credentials should be preserved
And the login session should be cleared (🚫 status)
And encrypted credentials should require re-authentication
```
- [ ] Test needed

---

## ♿ LOW: Accessibility & Performance

### Scenario: Keyboard navigation works throughout interface
```gherkin
Given I am on the options page
When I use Tab key to navigate
Then I should be able to reach all interactive elements
And focus indicators should be visible
And Enter key should activate buttons
When I open the popup
And I use Tab key to navigate
Then I should be able to reach all Fill buttons
And Enter key should fill the form
```
- [ ] Test needed

### Scenario: Performance with large datasets
```gherkin
Given I have 20 domains with 10 credentials each (200 total)
When I open the options page
Then the page should load within 3 seconds
And scrolling should be smooth
When I open the popup on any configured domain
Then it should load within 1 second
And all operations should remain responsive
```
- [ ] Test needed

---

## 🔧 LOW: Edge Cases

### Scenario: Duplicate usernames handled correctly
```gherkin
Given I have domain configured
When I add credential "john"/"pass1"
And I add credential "john"/"pass2"
Then both credentials should appear in the list
When I edit the first "john" credential and change password to "newpass1"
Then the first credential should show "john"/"newpass1"
And the second credential should still show "john"/"pass2"
```
- [ ] Test needed

### Scenario: Special characters in passwords work correctly
```gherkin
Given I have master password set up
When I add credential with password containing special characters "P@ssw0rd!#$%"
And I encrypt that credential
Then encryption should complete successfully
And decryption should return the exact original password with all special characters
```
- [x] Test needed

### Scenario: Very long passwords are handled correctly
```gherkin
Given I have master password set up
When I add credential with 500+ character password
And I encrypt that credential
Then encryption should complete successfully
And decryption should return the full original password
And performance should remain acceptable
```
- [ ] Test needed

---

## Test Execution Notes

- **Priority Order**: Execute CRITICAL tests first, then HIGH, MEDIUM, and LOW
- **Browser State**: Start each test session with a clean browser state
- **Data Cleanup**: Clear extension data between major test sections
- **Real-time Sync**: Pay special attention to login status synchronization across contexts
- **Migration Testing**: Test migration scenarios on a separate browser profile with old data

## Test Status Legend

- [ ] Test needed - Not yet executed
- [x] Test passed - Executed successfully
- [⚠️] Test failed - Issues found, needs attention
- [🔄] Test in progress - Currently being executed