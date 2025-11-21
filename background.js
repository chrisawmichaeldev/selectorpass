/**
 * SelectorPass Background Script (Service Worker)
 * 
 * This service worker manages master password sessions and facilitates
 * real-time communication between popup and options contexts.
 * 
 * Key Responsibilities:
 * - Master password session management
 * - Cross-context communication via ports
 * - Login status broadcasting
 * - Automatic session cleanup
 * 
 * Security Features:
 * - Master password stored in memory only (never persisted)
 * - Automatic cleanup on browser close/suspend
 * - Secure port-based communication
 * - No sensitive data logging
 * 
 * @fileoverview Background service worker for SelectorPass extension
 * @author SelectorPass Team
 * @version 1.1.1
 * @since 1.0.0
 */

'use strict';

// ============================================================================
// SESSION STORAGE
// ============================================================================

/**
 * Master password stored in memory for current browser session
 * @type {string|null}
 * @private
 */
let masterPassword = null;

/**
 * Set of connected ports from options pages for real-time updates
 * @type {Set<chrome.runtime.Port>}
 * @private
 */
let connectedPorts = new Set();

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle port connections from options pages for real-time login status updates
 * 
 * This enables instant UI updates when login status changes in any context.
 * Only accepts connections with name 'loginStatus' for security.
 * 
 * @param {chrome.runtime.Port} port - The connecting port
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'loginStatus') {
    // Add port to connected set for broadcasting
    connectedPorts.add(port);
    
    // Clean up when port disconnects
    port.onDisconnect.addListener(() => connectedPorts.delete(port));
  }
});

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Action handlers map for message processing
 * 
 * Each handler receives (request, sendResponse) parameters:
 * - setMasterPassword: Store master password in memory and broadcast login status
 * - getMasterPassword: Retrieve current master password from memory
 * - isMasterPasswordSet: Check if master password is currently available
 * - clearMasterPassword: Remove master password from memory and broadcast logout
 * 
 * @type {Map<string, Function>}
 * @private
 */
const actionHandlers = new Map([
  ['setMasterPassword', (request, sendResponse) => {
    if (typeof request.password !== 'string') {
      sendResponse({ success: false, error: 'Invalid password' });
      return;
    }
    masterPassword = request.password;
    broadcastLoginStatusChange(true);
    sendResponse({ success: true });
  }],
  
  ['getMasterPassword', (request, sendResponse) => sendResponse({ masterPassword })],
  
  ['isMasterPasswordSet', (request, sendResponse) => sendResponse({ isSet: masterPassword !== null })],
  
  ['clearMasterPassword', (request, sendResponse) => {
    masterPassword = null;
    broadcastLoginStatusChange(false);
    sendResponse({ success: true });
  }]
]);

/**
 * Handle messages from popup and options contexts
 * 
 * Supported actions:
 * - setMasterPassword: Store master password in memory
 * - getMasterPassword: Retrieve master password from memory
 * - isMasterPasswordSet: Check if master password is available
 * - clearMasterPassword: Remove master password from memory
 * 
 * @param {Object} request - Message request object
 * @param {string} request.action - Action to perform
 * @param {string} [request.password] - Master password (for setMasterPassword)
 * @param {chrome.runtime.MessageSender} sender - Message sender info
 * @param {Function} sendResponse - Response callback function
 * @returns {boolean} True to keep message channel open
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    // Validate request object
    if (!request || typeof request.action !== 'string') {
      sendResponse({ success: false, error: 'Invalid request' });
      return true;
    }

    // Get handler for the requested action
    const handler = actionHandlers.get(request.action);
    
    if (handler) {
      handler(request, sendResponse);
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message || 'Unknown error' });
  }
  
  return true;
});

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Clear session data when browser is closing
 * 
 * This ensures master password is never persisted beyond browser session.
 * Called automatically by Chrome when service worker is being suspended.
 */
chrome.runtime.onSuspend.addListener(() => {
  try {
    masterPassword = null;
    connectedPorts.clear();
  } catch (error) {
    // Silent cleanup - service worker is shutting down
  }
});
/**
 * Broadcast login status change to all connected options pages
 * 
 * This enables real-time UI updates across all extension contexts.
 * Automatically removes disconnected ports to prevent memory leaks.
 * 
 * @param {boolean} isLoggedIn - Current login status
 * @private
 */
function broadcastLoginStatusChange(isLoggedIn) {
  if (typeof isLoggedIn !== 'boolean') {
    return;
  }

  const disconnectedPorts = new Set();
  
  connectedPorts.forEach(port => {
    try {
      port.postMessage({ action: 'loginStatusChanged', isLoggedIn });
    } catch (error) {
      disconnectedPorts.add(port);
    }
  });
  
  // Clean up disconnected ports
  disconnectedPorts.forEach(port => connectedPorts.delete(port));
}