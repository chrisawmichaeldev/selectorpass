/**
 * SelectorPass Content Script
 * 
 * This content script is injected into web pages to handle form filling
 * using CSS selectors. It operates in an isolated environment to avoid
 * conflicts with page scripts and maintains security boundaries.
 * 
 * Key Features:
 * - CSS selector-based form field targeting
 * - Framework-compatible DOM event dispatching
 * - Secure message validation and handling
 * - Graceful error handling without page interference
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
 * @since 1.0.0
 */

'use strict';

(() => {
  
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
   *   password: '[REDACTED]'
   * });
   */
  function fillCredentials({ usernameSelector, passwordSelector, username, password }) {
    try {
      // Validate all parameters using functional approach
      const params = [usernameSelector, passwordSelector, username, password];
      const isValidType = params.every(param => typeof param === 'string');
      const hasContent = params.every(param => param?.trim());
      
      if (!isValidType || !hasContent) {
        return false;
      }
      
      // Query selectors safely
      const fields = [
        { selector: usernameSelector, value: username },
        { selector: passwordSelector, value: password }
      ].map(({ selector, value }) => {
        try {
          const element = document.querySelector(selector);
          return element && ['INPUT', 'TEXTAREA'].includes(element.tagName) 
            ? { element, value } 
            : null;
        } catch {
          return null;
        }
      }).filter(Boolean);
      
      // Fill all valid fields
      const filledCount = fields.reduce((count, { element, value }) => {
        try {
          element.value = value;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          return count + 1;
        } catch {
          return count;
        }
      }, 0);
      
      return filledCount > 0;
      
    } catch (error) {
      return false;
    }
  }
  
  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  /**
   * Action handlers map for message processing
   * @type {Map<string, Function>}
   * @private
   */
  const actionHandlers = new Map([
    ['fillCredentials', (message, safeResponse) => {
      try {
        const success = fillCredentials(message);
        safeResponse({ success });
      } catch (fillError) {
        safeResponse({ success: false, error: 'Form filling failed' });
      }
    }]
  ]);

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
   *   password: '[REDACTED]'
   * }
   */
  function handleMessage(message, sender, sendResponse) {
    // Ensure sendResponse is always called
    const safeResponse = (response) => {
      try {
        typeof sendResponse === 'function' && sendResponse(response);
      } catch (responseError) {
        // Silent error - response channel may be closed
      }
    };

    try {
      // Validation pipeline using short-circuit evaluation
      const validationErrors = [
        (!message || typeof message !== 'object' || !sender || typeof sender !== 'object') && 'Invalid message or sender',
        (!sender.id || typeof sender.id !== 'string' || sender.id !== chrome.runtime.id) && 'Unauthorized sender',
        (typeof message.action !== 'string') && 'Invalid action type'
      ].filter(Boolean);
      
      if (validationErrors.length > 0) {
        safeResponse({ success: false, error: validationErrors[0] });
        return;
      }
      
      // Get and execute handler
      const handler = actionHandlers.get(message.action);
      
      if (handler) {
        handler(message, safeResponse);
      } else {
        safeResponse({ success: false, error: 'Unsupported action' });
      }
    } catch (error) {
      safeResponse({ success: false, error: 'Message processing failed' });
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
      // Use short-circuit evaluation for Chrome API check
      typeof chrome !== 'undefined' && 
      chrome.runtime?.onMessage?.addListener?.(handleMessage);
    } catch (error) {
      // Silent error handling - content script should not interfere with page
    }
  }
  
  // Initialize using functional approach - no branching
  const initStrategies = {
    loading: () => document.addEventListener('DOMContentLoaded', init),
    interactive: init,
    complete: init
  };
  
  (initStrategies[document.readyState] || init)();
  
})();