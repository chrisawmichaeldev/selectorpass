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

### Scenario: Extension popup opens
```gherkin
Given the SelectorPass extension is installed
When I click the extension icon in the toolbar
Then the popup should open
And I should see "No domains configured" message
And I should see "Configure Domain" button
```

---

## Feature: Domain Configuration

### Scenario: Configure new domain via popup
```gherkin
Given I have the extension popup open
When I click "Configure Domain" button
Then the options page should open
And I should see the domain configuration form
```

### Scenario: Add domain configuration
```gherkin
Given I am on the SelectorPass options page
When I enter "chrisawmichaeldev.github.io" in the domain field
And I enter "#username" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then I should see "Domain saved successfully!" message
And the domain should appear in the domains list
And the form should be cleared
```

### Scenario: Configure domain with invalid selectors
```gherkin
Given I am on the SelectorPass options page
When I enter "example.com" in the domain field
And I enter "invalid-selector" in the username selector field
And I enter "#password" in the password selector field
And I click "Save Domain" button
Then I should see "Domain saved successfully!" message
But the selectors should be saved as entered
```

### Scenario: Update existing domain configuration
```gherkin
Given I have a domain "chrisawmichaeldev.github.io" configured
When I click "Edit" button for that domain
And I change the username selector to "#email"
And I click "Save Domain" button
Then I should see "Domain saved successfully!" message
And the domain should show updated selectors
```

---

## Feature: Credential Management

### Scenario: Add first credential to domain
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I click "Add Credential" button for that domain
And I enter "testuser1" in the username field
And I enter "testpass1" in the password field
And I click "Save Credential" button
Then I should see "Credential saved!" message
And the credential should appear in the credentials list
And the form should be cleared
```

### Scenario: Add multiple credentials to same domain
```gherkin
Given I have one credential for "chrisawmichaeldev.github.io"
When I add a second credential with username "testuser2" and password "testpass2"
And I add a third credential with username "testuser3" and password "testpass3"
Then I should see all three credentials listed
And each should have Edit and Delete buttons
```

### Scenario: Edit existing credential
```gherkin
Given I have credential "testuser1" for "chrisawmichaeldev.github.io"
When I click "Edit" button for that credential
And I change the username to "editeduser1"
And I click "Save Credential" button
Then I should see "Credential saved!" message
And the credential should show "editeduser1"
```

### Scenario: Delete credential with confirmation
```gherkin
Given I have credential "testuser2" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
Then I should see confirmation dialog "Delete this credential?"
When I click "Delete" in the confirmation dialog
Then the credential should be removed from the list
And I should see "Credential deleted!" message
```

### Scenario: Cancel credential deletion
```gherkin
Given I have credential "testuser3" for "chrisawmichaeldev.github.io"
When I click "Delete" button for that credential
And I click "Cancel" in the confirmation dialog
Then the credential should remain in the list
And no success message should appear
```

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

---

## Feature: Auto-Sort Recent Functionality

### Scenario: Enable auto-sort recent for domain
```gherkin
Given I have domain "chrisawmichaeldev.github.io" configured
When I check the "Auto-sort recent" checkbox for that domain
And I click "Save Domain" button
Then the checkbox should remain checked
And the setting should be saved
```

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
And I should see "Form filled successfully!" message
```

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

### Scenario: Form filling with invalid selectors
```gherkin
Given I have domain configured with invalid selectors
And I have a credential for that domain
When I navigate to the demo page
And I try to fill the form
Then I should see an error message
And the form fields should remain empty
```

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

### Scenario: Section state persists
```gherkin
Given I have collapsed a domain section
When I refresh the options page
Then the domain section should remain collapsed
```

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
And I should see "Domain deleted!" message
```

### Scenario: Cancel domain deletion
```gherkin
Given I have a domain configured
When I click "Delete Domain" button
And I click "Cancel" in the confirmation dialog
Then the domain should remain in the list
And all credentials should be preserved
```

---

## Feature: Error Handling and Edge Cases

### Scenario: Handle empty domain name
```gherkin
Given I am on the options page
When I leave the domain field empty
And I enter valid selectors
And I click "Save Domain" button
Then I should see an error message
And the domain should not be saved
```

### Scenario: Handle duplicate domain
```gherkin
Given I have domain "test.com" already configured
When I try to add another domain "test.com"
And I click "Save Domain" button
Then the existing domain should be updated
And no duplicate should be created
```

### Scenario: Handle empty credential fields
```gherkin
Given I have a domain configured
When I click "Add Credential" button
And I leave username or password empty
And I click "Save Credential" button
Then I should see an error message
And the credential should not be saved
```

### Scenario: Extension works on non-configured domain
```gherkin
Given I navigate to a website not in my configured domains
When I click the extension icon
Then I should see "Domain not configured" message
And I should see "Configure Domain" button
```

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

### Scenario: Data persists after extension disable/enable
```gherkin
Given I have configured data
When I disable the extension in chrome://extensions/
And I enable it again
Then all data should be preserved
And functionality should work normally
```

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

### Scenario: Navigate popup with keyboard
```gherkin
Given I have the popup open with credentials
When I use Tab key to navigate
Then I should be able to reach all Fill buttons
And Enter key should fill the form
```

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

### Scenario: Handle multiple domains
```gherkin
Given I have 20 different domains configured
When I open the extension popup
Then it should load quickly
And domain detection should work correctly
```