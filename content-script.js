/**
 * SelectorPass Content Script
 * Handles form filling on web pages using CSS selectors
 * Encapsulated to avoid global namespace pollution
 */

(() => {
  'use strict';
  
  // ============================================================================
  // PRIVATE FUNCTIONS
  // ============================================================================
  
  /**
   * Fill form fields with provided credentials
   * @param {Object} params - Credential filling parameters
   * @param {string} params.usernameSelector - CSS selector for username field
   * @param {string} params.passwordSelector - CSS selector for password field
   * @param {string} params.username - Username value to fill
   * @param {string} params.password - Password value to fill
   * @returns {boolean} True if filling was successful
   */
  function fillCredentials({ usernameSelector, passwordSelector, username, password }) {
    try {
      // Validate input parameters
      // amazonq-ignore-next-line
      if (!usernameSelector || !passwordSelector || !username || !password) {
        console.error('SelectorPass: Invalid parameters provided');
        return false;
      }
      
      const usernameField = document.querySelector(usernameSelector);
      const passwordField = document.querySelector(passwordSelector);
      
      let fieldsFound = 0;
      
      // Fill username field if found
      if (usernameField) {
        usernameField.value = username;
        // Dispatch events to trigger form validation and frameworks
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      } else {
        console.warn('SelectorPass: Username field not found:', usernameSelector);
      }
      
      // Fill password field if found
      if (passwordField) {
        passwordField.value = password;
        // Dispatch events to trigger form validation and frameworks
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      } else {
        console.warn('SelectorPass: Password field not found:', passwordSelector);
      }
      
      if (fieldsFound > 0) {
        console.log(`SelectorPass: Successfully filled ${fieldsFound} field(s)`);
        return true;
      } else {
        console.error('SelectorPass: No fields found to fill');
        return false;
      }
      
    } catch (error) {
      console.error('SelectorPass: Error filling credentials:', error);
      return false;
    }
  }
  
  /**
   * Handle messages from the extension popup
   * @param {Object} message - Message object from extension
   * @param {Object} sender - Sender information
   * @param {Function} sendResponse - Response callback function
   */
  function handleMessage(message, sender, sendResponse) {
    try {
      // Validate message and sender
      if (!message || !sender) {
        console.warn('SelectorPass: Invalid message or sender');
        sendResponse({ success: false, error: 'Invalid message or sender' });
        return;
      }
      
      // amazonq-ignore-next-line
      if (!sender.id || sender.id !== chrome.runtime.id) {
        console.warn('SelectorPass: Message from unknown sender');
        sendResponse({ success: false, error: 'Invalid sender' });
        return;
      }
      
      if (message.action === 'fillCredentials') {
        // amazonq-ignore-next-line
        try {
          const success = fillCredentials(message);
          sendResponse({ success });
        } catch (error) {
          console.error('SelectorPass: Error filling credentials:', error);
          sendResponse({ success: false, error: 'Failed to fill credentials' });
        }
      } else {
        console.warn('SelectorPass: Unknown action:', message.action);
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('SelectorPass: Error handling message:', error);
      try {
        sendResponse({ success: false, error: 'Message handling failed' });
      } catch (responseError) {
        console.error('SelectorPass: Error sending response:', responseError);
      }
    }
  }
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  /**
   * Initialize the content script
   * Sets up message listener for communication with extension
   */
  function init() {
    try {
      // Listen for messages from the extension
      // amazonq-ignore-next-line
      chrome.runtime.onMessage.addListener(handleMessage);
      
      console.log('SelectorPass: Content script initialized');
    } catch (error) {
      console.error('SelectorPass: Error initializing content script:', error);
    }
  }
  
  // Initialize when script loads
  init();
  
})();