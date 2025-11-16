# SelectorPass Manual Test Suite

This document contains comprehensive manual tests for the SelectorPass Chrome extension using Gherkin format.

## Prerequisites

- Chrome browser with SelectorPass extension installed
- Demo page available at: https://chrisawmichaeldev.github.io/selectorpass/demo.html

---

## Feature: Extension Installation and Basic Setup

### Scenario: Extension loads successfully
```gherkin
Given I have Chrome browser open
When I navigate to chrome://extensions/
Then I should see "SelectorPass" extension listed
And the extension should be enabled
And the extension icon should appear in the toolbar
```
- [x] Test completed

---

### Scenario: Extension popup opens
```gherkin
Given the SelectorPass extension is installed
When I click the extension icon in the toolbar
Then the popup should open
And I should see "No configuration found for this domain." message
And I should see "Settings" button
```
- [x] Test completed

---

## Feature: Domain Configuration

### Scenario: Configure new domain via popup
```gherkin
Given I have the extension popup open
When I click "Settings" button
Then the options page should open
And I should see the domain configuration form
```
- [x] Test completed

---

### Scenario: Domain auto-populates from current tab
```gherkin
Given I am on "chrisawmichaeldev.github.io" website
When I click the extension icon
And I click "Settings" button
Then the options page should open
And the domain field should be pre-filled with "chrisawmichaeldev.github.io"
```
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

### Scenario: Update existing domain configuration
```gherkin
Given I have a domain "chrisawmichaeldev.github.io" configured
When I click "Edit" button for that domain
And I change the username selector to "#email"
And I click "Save" button
Then the domain should show updated selectors
```
- [x] Test completed

---

## Feature: Credential Management

### Scenario: Add first credential to domain
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I enter "testuser1" in the username field
And I enter "testpass1" in the password field
And I click "Add" button
Then the credential should appear in the credentials list
And the form should be cleared
```
- [x] Test completed

---

### Scenario: Add multiple credentials to same domain
```gherkin
Given I have one credential for "chrisawmichaeldev.github.io"
When I add a second credential with username "testuser2" and password "testuser2"
And I add a third credential with username "testuser3" and password "testuser3"
Then I should see all three credentials listed
And each should have Edit and Delete buttons
```
- [x] Test completed

---

### Scenario: Edit existing credential
```gherkin
Given I have credential "testuser1" for "chrisawmichaeldev.github.io"
When I click "Edit" button for that credential
And I change the username to "editeduser1"
And I click "Save Credential" button
Then the credential should show "editeduser1"
```
- [x] Test completed

---

### Scenario: Delete credential with confirmation
```gherkin
Given I have credential "testuser2" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
Then I should see confirmation dialog "Delete this credential?"
When I click "Delete" in the confirmation dialog
Then the credential should be removed from the list

```
- [x] Test completed

---

### Scenario: Cancel credential deletion
```gherkin
Given I have credential "testuser3" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
And I click "Cancel" in the confirmation dialog
Then the credential should remain in the list
And no success message should appear
```
- [x] Test completed

---

## Feature: Drag and Drop Reordering

### Scenario: Reorder credentials using drag and drop
```gherkin
Given I have three credentials for "chrisawmichaeldev.github.io"
And they are in order: "user1", "user2", "user3"
When I drag "user3" credential above "user1"
Then the order should change to: "user3", "user1", "user2"
And the new order should persist after page refresh
```
- [x] Test completed

---

## Feature: Auto-Sort Recent Functionality

### Scenario: Auto-sort recent is enabled by default
```gherkin
Given I am configuring a new domain "chrisawmichaeldev.github.io"
When I enter the domain name and selectors
Then the "Auto-sort recent" checkbox underneath the password selector should be checked by default
When I save the domain
Then the auto-sort setting should be enabled
```
- [x] Test completed

---

### Scenario: Disable auto-sort recent for manual ordering
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I edit the domain and uncheck the "Auto-sort recent" checkbox underneath the password selector
And I click "Save Domain" button
Then the checkbox should remain unchecked
And the setting should be disabled
And credentials should maintain manual order when used
```
- [x] Test completed

---

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
- [x] Test completed

---

## Feature: Form Filling on Demo Page

### Scenario: Fill form with single credential
```gherkin
Given I have configured "chrisawmichaeldev.github.io" with selectors "#username" and "#password"
And I have one credential "demouser" / "demopass"
When I navigate to https://chrisawmichaeldev.github.io/selectorpass/demo.html
And I click the SelectorPass extension icon
Then I should see the credential "demouser" listed
When I click "Fill" button for that credential
Then the username field should contain "demouser"
And the password field should contain "demopass"
And the popup should close
```
- [x] Test completed

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
- [x] Test completed

### Scenario: Form filling with invalid selectors
```gherkin
Given I have domain configured with invalid selectors
And I have a credential for that domain
When I navigate to the demo page
And I click "Fill" for that credential
Then the form fields should remain empty
And the popup should close
```
- [x] Test completed

---

## Feature: Collapsible Sections

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
- [x] Test completed

### Scenario: Section state persists
```gherkin
Given I have collapsed a domain section
When I refresh the options page
Then the domain section should remain collapsed
```
- [x] Test completed

---

## Feature: Domain Deletion

### Scenario: Delete domain with confirmation
```gherkin
Given I have domain "example.com" configured with credentials
When I click "Delete Domain" button
Then I should see confirmation dialog "Delete domain and all credentials?"
When I click "Delete" in the confirmation dialog
Then the domain should be removed completely
And all its credentials should be deleted
```
- [x] Test completed

### Scenario: Cancel domain deletion
```gherkin
Given I have a domain configured
When I click "Delete Domain" button
And I click "Cancel" in the confirmation dialog
Then the domain should remain in the list
And all credentials should be preserved
```
- [x] Test completed

---

## Feature: Error Handling and Edge Cases

### Scenario: Handle empty domain name
```gherkin
Given I am on the options page
When I leave the domain field empty
And I enter valid selectors
And I click "Save Domain" button
Then I should see modal dialog "Please fill all fields" with OK button
When I click "OK"
Then the dialog should close
And the domain should not be saved
```
- [x] Test completed

### Scenario: Handle duplicate domain
```gherkin
Given I have domain "test.com" already configured with credentials
When I try to add another domain "test.com" with different selectors
And I click "Save Domain" button
Then the existing domain should be updated with new selectors
And no duplicate should be created
And all existing credentials should be preserved
```
- [x] Test completed

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
- [x] Test completed

### Scenario: Extension works on non-configured domain
```gherkin
Given I navigate to a website not in my configured domains
When I click the extension icon
Then I should see "No configuration found for this domain." message
And I should see "Settings" button
```
- [x] Test completed

---

## Feature: Data Persistence

### Scenario: Data persists after browser restart
```gherkin
Given I have configured domains and credentials
When I close and restart Chrome browser
And I open the extension options
Then all my domains should still be listed
And all credentials should be preserved
And all settings should be maintained
```
- [x] Test completed

### Scenario: Data persists after extension disable/enable
```gherkin
Given I have configured data
When I disable the extension in chrome://extensions/
And I enable it again
Then all data should be preserved
And functionality should work normally
```
- [x] Test completed

---

## Feature: Keyboard Accessibility

### Scenario: Navigate options page with keyboard
```gherkin
Given I am on the options page
When I use Tab key to navigate
Then I should be able to reach all interactive elements
And focus indicators should be visible
And Enter key should activate buttons
```
- [x] Test completed

### Scenario: Navigate popup with keyboard
```gherkin
Given I have the popup open with credentials
When I use Tab key to navigate
Then I should be able to reach all Fill buttons
And Enter key should fill the form
```
- [x] Test completed

---

## Feature: Password Encryption

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

### Scenario: Edit encrypted credential when logged in
```gherkin
Given I have an encrypted credential (shows lock icon 🔐)
And I am logged in with master password
When I click "Edit" for that credential
Then the username field should show the actual username
And the password field should show the actual decrypted password
When I change the password and click "Save"
Then the credential should remain encrypted with new password
And the lock icon should still be visible
```
- [x] Test completed

---

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
- [x] Test completed

---

### Scenario: Use encrypted credential when already logged in
```gherkin
Given I have encrypted credentials for a domain
And I am currently logged in (master password in session)
When I navigate to that domain
And I click "Fill" for an encrypted credential
Then the form should be filled immediately without prompting
And the popup should close
```
- [x] Test completed

---

### Scenario: Cross-context login status sync
```gherkin
Given I have the options page open
And the status shows "🚫 Logged out"
When I open the popup in another tab
And I fill an encrypted credential (entering master password)
Then I should return to the options page
And the status should automatically update to "🔓 Logged in"
Without needing to refresh the page
```
- [x] Test completed

---

### Scenario: Change master password
```gherkin
Given I have encrypted credentials with an existing master password
When I click "Change Master Password"
Then I should see a dialog for new master password
When I enter a new password (8+ characters) and confirm
Then I should see "Master password changed successfully!"
And all existing encrypted credentials should still work with the new password
```
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

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
- [x] Test completed

---

### Scenario: Secure password input
```gherkin
Given I need to enter my master password
When the password modal appears
Then the input field should be type="password" (masked)
And I should be able to use Enter key to submit
And I should be able to use Escape key to cancel
And clicking outside the modal should not close it
```
- [x] Test completed

---

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
- [x] Test completed

---

## Performance Tests

### Scenario: Handle large number of credentials
```gherkin
Given I have 50 credentials for a single domain
When I open the options page
Then the page should load within 2 seconds
And scrolling should be smooth
And all operations should remain responsive
```
- [x] Test completed

### Scenario: Handle multiple domains
```gherkin
Given I have 20 different domains configured
When I open the extension popup
Then it should load quickly
And domain detection should work correctly
```
- [x] Test completed