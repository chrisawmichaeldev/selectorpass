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
      if (!usernameSelector || !passwordSelector || !username || !password) {
        return false;
      }
      
      const usernameField = document.querySelector(usernameSelector);
      const passwordField = document.querySelector(passwordSelector);
      
      let fieldsFound = 0;
      
      // Fill username field if found
      if (usernameField) {
        usernameField.value = username;
        // Dispatch events to trigger form validation and frameworks
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      }
      
      // Fill password field if found
      if (passwordField) {
        passwordField.value = password;
        // Dispatch events to trigger form validation and frameworks
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      }
      
      return fieldsFound > 0;
      
    } catch (error) {
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
        sendResponse({ success: false, error: 'Invalid message or sender' });
        return;
      }
      
      if (!sender.id || sender.id !== chrome.runtime.id) {
        sendResponse({ success: false, error: 'Invalid sender' });
        return;
      }
      
      if (message.action === 'fillCredentials') {
        try {
          const success = fillCredentials(message);
          sendResponse({ success });
        } catch (error) {
          sendResponse({ success: false, error: 'Failed to fill credentials' });
        }
      } else {
        sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      try {
        sendResponse({ success: false, error: 'Message handling failed' });
      } catch (responseError) {
        // Silent error handling
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
      chrome.runtime.onMessage.addListener(handleMessage);
      
    } catch (error) {
      // Silent error handling
    }
  }
  
  // Initialize when script loads
  init();
  
})();