/**
 * SelectorPass Content Script
 * 
 * This content script is injected into web pages to handle form filling
 * using CSS selectors. It operates in an isolated environment to avoid
 * conflicts with page scripts and maintains security boundaries.
 * 
 * Security Features:
 * - Encapsulated in IIFE to prevent namespace pollution
 * - Validates message sender to prevent unauthorized access
 * - Only responds to messages from the extension itself
 * - Dispatches proper DOM events for framework compatibility
 * 
 * @fileoverview Content script for SelectorPass extension
 * @author SelectorPass Team
 * @version 1.1.1
 */

(() => {
  'use strict';
  
  // ============================================================================
  // PRIVATE FUNCTIONS
  // ============================================================================
  
  /**
   * Fill form fields with provided credentials using CSS selectors
   * 
   * This function locates form fields using the provided CSS selectors
   * and fills them with the credential data. It also dispatches DOM events
   * to ensure compatibility with JavaScript frameworks and form validation.
   * 
   * @param {Object} params - Credential filling parameters
   * @param {string} params.usernameSelector - CSS selector for username field
   * @param {string} params.passwordSelector - CSS selector for password field  
   * @param {string} params.username - Username value to fill
   * @param {string} params.password - Password value to fill
   * @returns {boolean} True if at least one field was successfully filled
   * 
   * @example
   * fillCredentials({
   *   usernameSelector: '#email',
   *   passwordSelector: '#password',
   *   username: 'user@example.com',
   *   password: 'secretpass123'
   * });
   */
  function fillCredentials({ usernameSelector, passwordSelector, username, password }) {
    try {
      // Validate all required parameters are provided
      if (!usernameSelector || !passwordSelector || !username || !password) {
        return false;
      }
      
      // Locate form fields using provided CSS selectors
      const usernameField = document.querySelector(usernameSelector);
      const passwordField = document.querySelector(passwordSelector);
      
      let fieldsFound = 0;
      
      // Fill username field if found
      if (usernameField) {
        usernameField.value = username;
        
        // Dispatch DOM events to trigger form validation and notify JavaScript frameworks
        // 'input' event: Fired when the value changes (for real-time validation)
        usernameField.dispatchEvent(new Event('input', { bubbles: true }));
        // 'change' event: Fired when the field loses focus (for form frameworks)
        usernameField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      }
      
      // Fill password field if found
      if (passwordField) {
        passwordField.value = password;
        
        // Dispatch DOM events to trigger form validation and notify JavaScript frameworks
        passwordField.dispatchEvent(new Event('input', { bubbles: true }));
        passwordField.dispatchEvent(new Event('change', { bubbles: true }));
        fieldsFound++;
      }
      
      // Return true if at least one field was successfully filled
      return fieldsFound > 0;
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Handle messages from the extension popup
   * 
   * This function processes messages from the extension popup to perform
   * form filling operations. It includes security checks to ensure messages
   * are only processed from the extension itself.
   * 
   * @param {Object} message - Message object from extension
   * @param {string} message.action - Action to perform ('fillCredentials')
   * @param {Object} sender - Chrome extension sender information
   * @param {string} sender.id - Extension ID for security validation
   * @param {Function} sendResponse - Callback to send response back to sender
   * 
   * @example
   * // Message format:
   * {
   *   action: 'fillCredentials',
   *   usernameSelector: '#email',
   *   passwordSelector: '#password',
   *   username: 'user@example.com',
   *   password: 'secretpass123'
   * }
   */
  function handleMessage(message, sender, sendResponse) {
    try {
      // Security check: Validate message and sender exist
      if (!message || !sender) {
        sendResponse({ success: false, error: 'Invalid message or sender' });
        return;
      }
      
      // Security check: Ensure message is from this extension only
      if (!sender.id || sender.id !== chrome.runtime.id) {
        sendResponse({ success: false, error: 'Invalid sender' });
        return;
      }
      
      // Process supported actions
      if (message.action === 'fillCredentials') {
        try {
          const success = fillCredentials(message);
          sendResponse({ success });
        } catch (error) {
          sendResponse({ success: false, error: 'Failed to fill credentials' });
        }
      } else {
        // Reject unsupported actions
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
   * 
   * Sets up the message listener to receive commands from the extension.
   * This is called automatically when the script loads.
   */
  function init() {
    try {
      // Register message listener to handle form filling requests
      chrome.runtime.onMessage.addListener(handleMessage);
      
    } catch (error) {
      // Silent error handling - content script should not interfere with page
    }
  }
  
  // Initialize the content script immediately when loaded
  init();
  
})();