# SelectorPass Manual Test Suite

This document contains comprehensive manual tests for the SelectorPass Chrome extension using Gherkin format.

## Prerequisites

- Chrome browser with SelectorPass extension installed
- Demo page available at: https://chrisawmichaeldev.github.io/selectorpass/demo.html

---

## 🔥 CRITICAL: Core Functionality

### Scenario: Extension loads successfully
```gherkin
Given I have Chrome browser open
When I navigate to chrome://extensions/
Then I should see "SelectorPass" extension listed
And the extension should be enabled
And the extension icon should appear in the toolbar
```
- [x] Test needed

### Scenario: Extension popup opens
```gherkin
Given the SelectorPass extension is installed
When I click the extension icon in the toolbar
Then the popup should open
And I should see "No configuration found for this domain." message
And I should see "Settings" button
```
- [x] **AUTOMATED** (critical.spec.ts)

### Scenario: Add domain configuration
```gherkin
Given I am on the SelectorPass options page
When I enter "chrisawmichaeldev.github.io" in the domain field
And I enter "#username" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then the domain should appear in the domains list
And the form should be cleared
```
- [x] **AUTOMATED** (critical.spec.ts)

### Scenario: Add first credential to domain
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I enter "testuser1" in the username field
And I enter "testpass1" in the password field
And I click "Add" button
Then the credential should appear in the credentials list
And the form should be cleared
```
- [x] **AUTOMATED** (critical.spec.ts)

### Scenario: Fill form with single credential
```gherkin
Given I have configured "chrisawmichaeldev.github.io" with selectors "#username" and "#password"
And I have one credential "demouser" / "demouser"
When I navigate to https://chrisawmichaeldev.github.io/selectorpass/demo.html
And I click the SelectorPass extension icon
Then I should see the credential "demouser" listed
When I click "Fill" button for that credential
Then the username field should contain "demouser"
And the password field should contain "demopass"
And the popup should close
```
- [x] Test needed

---

## 🔐 CRITICAL: Encryption & Security

### Scenario: Set up master password
```gherkin
Given I am on the SelectorPass options page
When I expand the "🔐 Security" section
And I click "Setup Master Password" button
Then I should see master password setup form
When I enter a password with less than 8 characters
And I click "Set Master Password"
Then I should see "Master password must be at least 8 characters"
When I enter matching passwords (8+ characters)
And I click "Set Master Password"
Then I should see "Master password set successfully!"
And the status should show "🔓 Logged in"
```
- [x] Test needed

### Scenario: Add encrypted credential
```gherkin
Given I have a master password set up
And I have a domain configured
When I add a new credential
And I check the "Encrypt this credential" checkbox
And I click "Add"
Then the credential should be saved with encryption
And I should see a lock icon 🔐 next to the username
```
- [x] Test needed

### Scenario: Use encrypted credential in popup (first time)
```gherkin
Given I have encrypted credentials for a domain
And I am not currently logged in
When I navigate to that domain
And I click the extension icon
And I click "Fill" for an encrypted credential (shows 🔐)
Then I should see a password modal "Master Password Required"
When I enter the correct master password and click "OK"
Then the form should be filled with the decrypted credentials
And the popup should close
And the popup status icon should show 🔓 (logged in)
```
- [x] Test needed

### Scenario: Use encrypted credential when already logged in
```gherkin
Given I have encrypted credentials for a domain
And I am currently logged in (master password in session)
When I navigate to that domain
And I click "Fill" for an encrypted credential
Then the form should be filled immediately without prompting
And the popup should close
```
- [x] Test needed

### Scenario: Error handling for encrypted credentials
```gherkin
Given I have encrypted credentials
And I am not logged in
When I try to fill an encrypted credential
And I enter an incorrect master password
Then I should see "Incorrect master password" error
And the credentials list should remain visible
And I should be able to try again
```
- [x] Test needed

---

## 🔄 CRITICAL: Login/Logout Synchronization

### Scenario: Login via options page - all contexts sync
```gherkin
Given I have master password set up
And I have the options page open showing "🚫 Logged out"
And I have the popup open in another tab showing 🚫 icon
When I enter master password in the options page security section
And I click "Login"
Then the options page should immediately show "🔓 Logged in"
And the popup should automatically update to show 🔓 icon
And both should remain synchronized
```
- [x] Test needed

### Scenario: Login via popup filling - all contexts sync
```gherkin
Given I have encrypted credentials and am logged out
And I have the options page open showing "🚫 Logged out"
When I navigate to a configured domain
And I click the extension icon (popup shows 🚫)
And I click "Fill" for an encrypted credential
And I enter the master password in the popup modal
Then the form should fill and popup should close
And when I reopen the popup, it should show 🔓 icon
And the options page should automatically update to "🔓 Logged in"
Without needing to refresh
```
- [x] Test needed

### Scenario: Logout via options page - all contexts sync
```gherkin
Given I am logged in (🔓 status in both popup and options)
And I have the options page open showing "🔓 Logged in"
And I have the popup open in another tab showing 🔓 icon
When I click "Logout" in the options page security section
Then the options page should immediately show "🚫 Logged out"
And the popup should automatically update to show 🚫 icon
And both should remain synchronized
```
- [x] Test needed

### Scenario: Automatic logout on browser close - all contexts sync
```gherkin
Given I am logged in across all contexts
When I close the entire browser and reopen
And I open the options page
Then it should show "🚫 Logged out"
When I open the popup
Then it should show 🚫 icon
And encrypted credentials should require password prompt
```
- [x] Test needed

---

## 📝 HIGH: Credential Management

### Scenario: Add multiple credentials to same domain
```gherkin
Given I have one credential for "chrisawmichaeldev.github.io"
When I add a second credential with username "testuser2" and password "testuser2"
And I add a third credential with username "testuser3" and password "testuser3"
Then I should see all three credentials listed
And each should have Edit and Delete buttons
```
- [x] Test needed

### Scenario: Edit existing credential
```gherkin
Given I have credential "testuser1" for "chrisawmichaeldev.github.io"
When I click "Edit" button for that credential
And I change the username to "editeduser1"
And I click "Save Credential" button
Then the credential should show "editeduser1"
```
- [x] Test needed

### Scenario: Delete credential with confirmation
```gherkin
Given I have credential "testuser2" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
Then I should see confirmation dialog "Delete this credential?"
When I click "Delete" in the confirmation dialog
Then the credential should be removed from the list
```
- [x] Test needed

### Scenario: Cancel credential deletion
```gherkin
Given I have credential "testuser3" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
And I click "Cancel" in the confirmation dialog
Then the credential should remain in the list
And no success message should appear
```
- [x] Test needed

### Scenario: Choose between multiple credentials
```gherkin
Given I have three credentials for "chrisawmichaeldev.github.io"
When I navigate to the demo page
And I click the extension icon
Then I should see all three credentials listed
And each should have a "Fill" button
When I click "Fill" for the second credential
Then the form should be filled with that credential's data
```
- [x] Test needed

### Scenario: Mixed encrypted and unencrypted credentials
```gherkin
Given I have a domain with both encrypted and unencrypted credentials
When I view the credentials list in options
Then encrypted credentials should show lock icon 🔐
And unencrypted credentials should show no icon
When I view them in popup
Then encrypted credentials should show lock icon 🔐
When I use an unencrypted credential
Then it should fill immediately without password prompt
When I use an encrypted credential (and not logged in)
Then it should prompt for master password
```
- [x] Test needed

---

## 🔧 HIGH: Domain Configuration

### Scenario: Configure new domain via popup
```gherkin
Given I have the extension popup open
When I click "Settings" button
Then the options page should open
And I should see the domain configuration form
```
- [x] Test needed

### Scenario: Domain auto-populates from current tab (when not already configured)
```gherkin
Given I am on "example.com" website
And "example.com" is NOT already configured in the extension
When I click the extension icon
And I click "Settings" button
Then the options page should open
And the domain field should be pre-filled with "example.com"
```
- [x] Test needed

### Scenario: Domain does not auto-populate when already configured
```gherkin
Given I have "chrisawmichaeldev.github.io" already configured
And I am on "chrisawmichaeldev.github.io" website
When I click the extension icon
And I click "Settings" button
Then the options page should open
And the domain field should be empty
And I should see the existing domain in the domains list
```
- [x] Test needed

### Scenario: Update existing domain configuration
```gherkin
Given I have a domain "chrisawmichaeldev.github.io" configured
When I click "Edit" button for that domain
And I change the username selector to "#email"
And I click "Save" button
Then the domain should show updated selectors
```
- [x] Test needed

### Scenario: Delete domain with confirmation
```gherkin
Given I have domain "example.com" configured with credentials
When I click "Delete Domain" button
Then I should see confirmation dialog "Delete domain and all credentials?"
When I click "Delete" in the confirmation dialog
Then the domain should be removed completely
And all its credentials should be deleted
```
- [x] Test needed

### Scenario: Cancel domain deletion
```gherkin
Given I have a domain configured
When I click "Delete Domain" button
And I click "Cancel" in the confirmation dialog
Then the domain should remain in the list
And all credentials should be preserved
```
- [x] Test needed

---

## 🔐 HIGH: Advanced Encryption Features

### Scenario: Encrypt existing credential
```gherkin
Given I have an unencrypted credential
And I am logged in with master password
When I click the "🔐" (encrypt) button for that credential
Then I should see confirmation "Encrypt this credential?"
When I click "OK"
Then the credential should become encrypted
And the button should change to "🔓" (decrypt)
```
- [x] Test needed

### Scenario: Decrypt credential (remove encryption)
```gherkin
Given I have an encrypted credential
And I am logged in with master password
When I click the "🔓" (decrypt) button for that credential
Then I should see confirmation "Remove encryption from this credential?"
When I click "OK"
Then the credential should become unencrypted
And the lock icon should disappear
And the button should change to "🔐" (encrypt)
```
- [x] Test needed

### Scenario: Edit encrypted credential when logged in
```gherkin
Given I have an encrypted credential (shows lock icon 🔐)
And I am logged in with master password
When I click "Edit" for that credential
Then the username field should show the actual username
And the password field should be populated with the decrypted password (but hidden as dots)
When I click the eye icon to show the password
Then the password should be visible in plain text
When I change the password and click "Save"
Then the credential should remain encrypted with new password
And the lock icon should still be visible
```
- [x] Test needed

### Scenario: Change master password
```gherkin
Given I have encrypted credentials with an existing master password
When I click "Change Master Password"
Then I should see a dialog for new master password
When I enter a new password (8+ characters) and confirm
Then I should see "Master password changed successfully!"
And all existing encrypted credentials should still work with the new password
```
- [x] Test needed

### Scenario: Edit encrypted credential while logged out
```gherkin
Given I have an encrypted credential
And I am logged out
When I click "Edit" for that encrypted credential
Then the username field should show the actual username
And the password field should show placeholder "Password (encrypted - enter new to change)"
When I click the eye icon next to the password field
Then I should see a master password prompt
When I enter the correct master password
Then the password field should be populated with the decrypted password
And I should be able to click the eye icon to show/hide the password
And I should be able to modify and save the credential
```
- [x] Test needed

### Scenario: Reset master password with mixed credentials
```gherkin
Given I have a master password set up
And I have 3 encrypted credentials and 2 unencrypted credentials
When I click "Reset Master Password" button
Then I should see warning "This will permanently delete ALL encrypted credentials"
When I click "Reset Master Password" in the dialog
Then I should see "Master password reset successfully"
And all encrypted credentials should be removed
And all unencrypted credentials should remain
And the security section should show "Setup Master Password" button
```
- [ ] Test needed

### Scenario: Cancel reset master password
```gherkin
Given I have a master password set up
And I have encrypted credentials
When I click "Reset Master Password" button
And I click "Cancel" in the warning dialog
Then the dialog should close
And all credentials should remain unchanged
And the master password should still be set
```
- [ ] Test needed

### Scenario: Reset master password with no encrypted credentials
```gherkin
Given I have a master password set up
And I have only unencrypted credentials
When I click "Reset Master Password" button
And I confirm the reset
Then I should see "Master password reset successfully"
And all unencrypted credentials should remain
And the security section should show "Setup Master Password" button
```
- [ ] Test needed

---

## 🔄 MEDIUM: Extended Login/Logout Scenarios

### Scenario: Multiple popup instances sync
```gherkin
Given I have two popup windows open (different tabs)
And both show 🚫 logged out status
When I login via one popup by filling an encrypted credential
Then both popup windows should update to show 🔓 status
And both should allow encrypted credential access
```
- [ ] Test needed

### Scenario: Options page open during popup login
```gherkin
Given I have the options page open and visible
And the status shows "🚫 Logged out"
When I open the popup and login by filling an encrypted credential
Then I should see the options page status change to "🔓 Logged in" in real-time
Without clicking or refreshing anything
```
- [ ] Test needed

### Scenario: Login via options page - popup reflects immediately
```gherkin
Given I am logged out in both options page and popup
When I login via the options page security section
Then I should immediately open the popup in a new tab
And the popup should show 🔓 icon without delay
And encrypted credentials should be usable immediately
```
- [ ] Test needed

### Scenario: Browser session persistence across tabs
```gherkin
Given I login via popup in Tab A
When I open the extension popup in Tab B
Then Tab B popup should show 🔓 logged in status
When I open the extension popup in Tab C
Then Tab C popup should also show 🔓 logged in status
And all tabs should have access to encrypted credentials
```
- [ ] Test needed

### Scenario: Multiple popup instances sync on logout
```gherkin
Given I have two popup windows open (different tabs)
And both show 🔓 logged in status
When the session expires or I logout from options page
Then both popup windows should update to show 🚫 status
And both should require master password for encrypted credentials
```
- [ ] Test needed

### Scenario: Cross-tab logout propagation
```gherkin
Given I am logged in with popup open in Tab A
And I have options page open in Tab B
When I logout from Tab B (options page)
And I switch to Tab A (popup)
Then Tab A popup should show 🚫 logged out status
And encrypted credentials should be inaccessible without password
```
- [ ] Test needed

---

## 🎯 MEDIUM: User Experience Features

### Scenario: Auto-sort recent is enabled by default
```gherkin
Given I am configuring a new domain "chrisawmichaeldev.github.io"
When I enter the domain name and selectors
Then the "Auto-sort recent" checkbox underneath the password selector should be checked by default
When I save the domain
Then the auto-sort setting should be enabled
```
- [ ] Test needed

### Scenario: Auto-sort moves used credential to top
```gherkin
Given I have auto-sort enabled for "chrisawmichaeldev.github.io"
And I have credentials in order: "user1", "user2", "user3"
When I navigate to the demo page
And I use "user3" credential to fill the form
And I return to the options page
Then "user3" should now be at the top of the list
And the order should be: "user3", "user1", "user2"
```
- [ ] Test needed

### Scenario: Disable auto-sort recent for manual ordering
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I edit the domain and uncheck the "Auto-sort recent" checkbox underneath the password selector
And I click "Save Domain" button
Then the checkbox should remain unchecked
And the setting should be disabled
And credentials should maintain manual order when used
```
- [ ] Test needed

### Scenario: Reorder credentials using drag and drop
```gherkin
Given I have three credentials for "chrisawmichaeldev.github.io"
And they are in order: "user1", "user2", "user3"
When I drag "user3" credential above "user1"
Then the order should change to: "user3", "user1", "user2"
And the new order should persist after page refresh
```
- [ ] Test needed

### Scenario: Collapse and expand domain sections
```gherkin
Given I have a domain with credentials configured
And the domain section is expanded
When I click the domain header
Then the credentials section should collapse
And the arrow should point right
When I click the domain header again
Then the credentials section should expand
And the arrow should point down
```
- [ ] Test needed

### Scenario: Section state persists
```gherkin
Given I have collapsed a domain section
When I refresh the options page
Then the domain section should remain collapsed
```
- [ ] Test needed

---

## ⚠️ MEDIUM: Error Handling & Validation

### Scenario: Configure domain with invalid username selector
```gherkin
Given I am on the SelectorPass options page
When I enter "example.com" in the domain field
And I enter "#invalid..selector" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then I should see modal dialog "Please enter a valid CSS selector for username field" with OK button
When I click "OK"
Then the dialog should close
And the domain should NOT be saved
And the form should retain the entered values
```
- [ ] Test needed

### Scenario: Configure domain with invalid password selector
```gherkin
Given I am on the SelectorPass options page
When I enter "example.com" in the domain field
And I enter "#username" in the username selector field
And I enter "[invalid" in the password selector field
And I click "Save Domain" button
Then I should see modal dialog "Please enter a valid CSS selector for password field" with OK button
When I click "OK"
Then the dialog should close
And the domain should NOT be saved
And the form should retain the entered values
```
- [ ] Test needed

### Scenario: Configure domain with empty fields
```gherkin
Given I am on the SelectorPass options page
When I leave the domain field empty
And I enter "#username" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then I should see modal dialog "Please fill all fields" with OK button
When I click "OK"
Then the dialog should close
And the domain should NOT be saved
```
- [ ] Test needed

### Scenario: Configure domain with invalid domain name
```gherkin
Given I am on the SelectorPass options page
When I enter "invalid..domain" in the domain field
And I enter "#username" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then I should see modal dialog "Please enter a valid domain name" with OK button
When I click "OK"
Then the dialog should close
And the domain should NOT be saved
```
- [ ] Test needed

### Scenario: Handle empty credential fields
```gherkin
Given I have a domain configured
When I leave username or password empty
And I click "Add" button
Then I should see modal dialog "Username and password are required" with OK button
When I click "OK"
Then the dialog should close
And the credential should not be saved
```
- [ ] Test needed

### Scenario: Handle duplicate domain
```gherkin
Given I have domain "test.com" already configured with credentials
When I try to add another domain "test.com" with different selectors
And I click "Save Domain" button
Then the existing domain should be updated with new selectors
And no duplicate should be created
And all existing credentials should be preserved
```
- [ ] Test needed

### Scenario: Extension works on non-configured domain
```gherkin
Given I navigate to a website not in my configured domains
When I click the extension icon
Then I should see "No configuration found for this domain." message
And I should see "Settings" button
```
- [ ] Test needed

### Scenario: Form filling with invalid selectors
```gherkin
Given I have domain configured with invalid selectors
And I have a credential for that domain
When I navigate to the demo page
And I click "Fill" for that credential
Then the form fields should remain empty
And the popup should close
```
- [ ] Test needed

---

## 🔐 MEDIUM: Advanced Encryption Edge Cases

### Scenario: Master password with special characters
```gherkin
Given I am setting up a master password
When I enter a password with special characters like "P@ssw0rd!#$%"
And I confirm the password
Then the master password should be set successfully
And I should be able to encrypt/decrypt credentials with it
```
- [ ] Test needed

### Scenario: Master password with unicode characters
```gherkin
Given I am setting up a master password
When I enter a password with unicode characters like "Pássw0rd🔐"
And I confirm the password
Then the master password should be set successfully
And encryption/decryption should work correctly
```
- [ ] Test needed

### Scenario: Very long master password
```gherkin
Given I am setting up a master password
When I enter a 100+ character master password
And I confirm the password
Then the master password should be set successfully
And performance should remain acceptable for encryption operations
```
- [ ] Test needed

### Scenario: Encrypt credential with very long password
```gherkin
Given I have a master password set up
When I add a credential with a 500+ character password
And I encrypt that credential
Then the encryption should complete successfully
And decryption should return the full original password
```
- [ ] Test needed

### Scenario: Cancel master password prompt during edit
```gherkin
Given I have an encrypted credential
And I am logged out
When I click "Edit" for that encrypted credential
And I see the master password prompt
And I click "Cancel" or press Escape
Then the prompt should close
And the credential should remain unchanged
And I should return to the credentials list
```
- [ ] Test needed

### Scenario: Master password change with many encrypted credentials
```gherkin
Given I have 50 encrypted credentials across multiple domains
When I change my master password
Then all 50 credentials should be re-encrypted with the new password
And all should be accessible with the new password
And none should be accessible with the old password
```
- [ ] Test needed

### Scenario: Master password with only spaces
```gherkin
Given I am setting up a master password
When I enter a password that is only spaces "        "
And I try to confirm it
Then I should see "Master password must be at least 8 characters" error
And the master password should not be set
```
- [ ] Test needed

---

## 💾 LOW: Data Persistence

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

### Scenario: Data persists after extension disable/enable
```gherkin
Given I have configured data
When I disable the extension in chrome://extensions/
And I enable it again
Then all data should be preserved
And functionality should work normally
```
- [ ] Test needed

### Scenario: Session persists until browser close
```gherkin
Given I am logged in with master password
When I close the popup and options page
And I reopen the popup later
Then the status should still show logged in (🔓)
And encrypted credentials should fill without password prompt
When I close the entire browser and reopen
Then I should need to enter master password again
```
- [ ] Test needed

---

## ♿ LOW: Accessibility & UI

### Scenario: Navigate options page with keyboard
```gherkin
Given I am on the options page
When I use Tab key to navigate
Then I should be able to reach all interactive elements
And focus indicators should be visible
And Enter key should activate buttons
```
- [ ] Test needed

### Scenario: Navigate popup with keyboard
```gherkin
Given I have the popup open with credentials
When I use Tab key to navigate
Then I should be able to reach all Fill buttons
And Enter key should fill the form
```
- [ ] Test needed

### Scenario: Secure password input
```gherkin
Given I need to enter my master password
When the password modal appears
Then the input field should be type="password" (masked)
And I should be able to use Enter key to submit
And I should be able to use Escape key to cancel
And clicking outside the modal should not close it
```
- [ ] Test needed

### Scenario: Visual indicators for login status
```gherkin
Given I have master password set up
When I am logged out
Then the options page should show "🚫 Logged out"
And the popup should show 🚫 icon
When I am logged in
Then the options page should show "🔓 Logged in"
And the popup should show 🔓 icon
And both should update in real-time when status changes
```
- [ ] Test needed

---

## 🔧 LOW: Advanced System Scenarios

### Scenario: Service worker restart doesn't affect login status
```gherkin
Given I am logged in (🔓 status in both popup and options)
When the Chrome service worker restarts (simulate by waiting 5+ minutes)
And I open a new popup window
Then the popup should still show 🔓 logged in status
And encrypted credentials should still work
And the options page should still show "🔓 Logged in"
```
- [ ] Test needed

### Scenario: Login status survives extension context invalidation
```gherkin
Given I am logged in with master password
When I navigate to chrome://extensions/ and click "Reload" on SelectorPass
And I open the popup after reload
Then the popup should show 🚫 logged out (session cleared)
And I should need to re-enter master password
And the options page should also show "🚫 Logged out"
```
- [ ] Test needed

### Scenario: Extension reload logs out all contexts
```gherkin
Given I am logged in across all contexts
When I go to chrome://extensions/ and reload SelectorPass
And I open the options page
Then it should show "🚫 Logged out"
When I open the popup
Then it should show 🚫 icon
And all encrypted credentials should require re-authentication
```
- [ ] Test needed

### Scenario: Service worker termination clears session everywhere
```gherkin
Given I am logged in (🔓 status everywhere)
When the Chrome service worker terminates (wait 5+ minutes idle)
And I try to use an encrypted credential
Then I should be prompted for master password
And all contexts should show 🚫 logged out status
And the session should be cleared everywhere
```
- [ ] Test needed

### Scenario: Options page reflects popup session expiry
```gherkin
Given I have the options page open showing "🔓 Logged in"
When the browser session expires (browser restart simulation)
Then the options page should automatically update to "🚫 Logged out"
Without needing to refresh the page
```
- [ ] Test needed

---

## ⚡ LOW: Performance & Bulk Operations

### Scenario: Handle large number of credentials
```gherkin
Given I have 50 credentials for a single domain
When I open the options page
Then the page should load within 2 seconds
And scrolling should be smooth
And all operations should remain responsive
```
- [ ] Test needed

### Scenario: Handle multiple domains
```gherkin
Given I have 20 different domains configured
When I open the extension popup
Then it should load quickly
And domain detection should work correctly
```
- [ ] Test needed

### Scenario: Multiple rapid encrypt/decrypt operations
```gherkin
Given I have 10 unencrypted credentials
And I am logged in with master password
When I rapidly encrypt all 10 credentials in succession
Then all should encrypt successfully without errors
When I rapidly decrypt all 10 credentials
Then all should decrypt successfully with correct data
```
- [ ] Test needed

### Scenario: Bulk encryption operations
```gherkin
Given I have 20 unencrypted credentials across multiple domains
And I am logged in with master password
When I encrypt credentials one by one rapidly
Then each encryption should complete successfully
And the UI should remain responsive
And all encrypted credentials should be usable
```
- [ ] Test needed

### Scenario: Mixed operations during login session
```gherkin
Given I am logged in with master password
And I have mixed encrypted/unencrypted credentials
When I perform various operations (add, edit, delete, encrypt, decrypt)
Then all operations should work correctly
And login status should remain stable
And no authentication should be required during the session
```
- [ ] Test needed

### Scenario: Decrypt all credentials in domain
```gherkin
Given I have a domain with 5 encrypted credentials
And I am logged in
When I decrypt each credential individually
Then all should become unencrypted successfully
And no lock icons should be visible
And all should be usable without master password
```
- [ ] Test needed

---

## 🔧 LOW: Edge Cases & Stress Tests

### Scenario: Master password prompt timeout behavior
```gherkin
Given I have an encrypted credential
And I am logged out
When I click "Fill" for that encrypted credential
And the master password modal appears
And I wait without entering anything for 5+ minutes
Then the modal should remain open (no auto-timeout)
And I should still be able to enter the password
```
- [ ] Test needed

### Scenario: Encryption status persists after credential edit
```gherkin
Given I have an encrypted credential
And I am logged in
When I edit the credential and change only the username
And I save the changes
Then the credential should remain encrypted
And the lock icon should still be visible
And the password should still be encrypted in storage
```
- [ ] Test needed

### Scenario: Encryption with empty password field
```gherkin
Given I have a master password set up
When I try to add a credential with empty password
And I check "Encrypt this credential"
And I click "Add"
Then I should see "Username and password are required" error
And the credential should not be saved
```
- [ ] Test needed

### Scenario: Encryption during network issues
```gherkin
Given I have credentials and master password set up
When I simulate network connectivity issues
And I perform encryption/decryption operations
Then operations should work normally (local-only)
And no network errors should occur
And all data should remain intact
```
- [ ] Test needed

### Scenario: Rapid context switching maintains sync
```gherkin
Given I have options page and popup both open
When I quickly switch between logging in and out multiple times
Then both contexts should always show the same status
And there should be no desynchronization
And no race conditions should occur
```
- [ ] Test needed

### Scenario: Rapid logout/login maintains sync
```gherkin
Given I have options page and popup both open
When I quickly logout and login multiple times
Then both contexts should always show the same status
And there should be no desynchronization
And encrypted credential access should work consistently
```
- [ ] Test needed

### Scenario: Login from options affects immediate popup usage
```gherkin
Given I am logged out everywhere
When I login via the options page
And I immediately navigate to a site with encrypted credentials
And I click the extension icon
Then the popup should show 🔓 status
And I should be able to fill encrypted credentials without password prompt
```
- [ ] Test needed

### Scenario: Logout affects immediate encrypted credential access
```gherkin
Given I am logged in everywhere
When I logout via the options page
And I immediately navigate to a site with encrypted credentials
And I click the extension icon
Then the popup should show 🚫 status
And clicking "Fill" on encrypted credentials should prompt for master password
```
- [ ] Test needed

### Scenario: Logout during active popup usage
```gherkin
Given I have the popup open and am logged in
And I have the options page open in another tab
When I logout via the options page
And I return to the popup tab
Then the popup should show 🚫 status
And encrypted credentials should require password prompt
```
- [ ] Test needed