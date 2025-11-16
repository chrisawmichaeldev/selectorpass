/**
 * SelectorPass Background Script (Service Worker)
 * 
 * This service worker manages master password sessions and facilitates
 * real-time communication between popup and options contexts.
 * 
 * Security Note: Master password is stored in memory only and never
 * persisted to disk or chrome.storage. It's cleared on browser close.
 * 
 * @fileoverview Background service worker for SelectorPass extension
 * @author SelectorPass Team
 * @version 1.1.1
 */

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
    port.onDisconnect.addListener(() => {
      connectedPorts.delete(port);
    });
  }
});

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
    switch (request.action) {
      case 'setMasterPassword':
        // Store master password in memory for current browser session
        masterPassword = request.password;
        
        // Notify all connected options pages of login status change
        broadcastLoginStatusChange(true);
        sendResponse({ success: true });
        break;
        
      case 'getMasterPassword':
        // Return master password from memory (null if not set)
        sendResponse({ masterPassword });
        break;
        
      case 'isMasterPasswordSet':
        // Check if master password is available in memory
        sendResponse({ isSet: masterPassword !== null });
        break;
        
      case 'clearMasterPassword':
        // Clear master password from memory
        masterPassword = null;
        
        // Notify all connected options pages of logout
        broadcastLoginStatusChange(false);
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: true });
    }
  } catch (error) {
    sendResponse({ error: error.message });
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
  masterPassword = null;
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
  connectedPorts.forEach(port => {
    try {
      // Send login status update to connected options page
      port.postMessage({ action: 'loginStatusChanged', isLoggedIn });
    } catch (error) {
      // Port is disconnected, remove from set
      connectedPorts.delete(port);
    }
  });
}