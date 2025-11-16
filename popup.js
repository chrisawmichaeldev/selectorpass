/**
 * SelectorPass Popup Script
 * 
 * This script manages the extension popup interface, providing users with
 * a quick way to select and fill credentials on the current website.
 * 
 * Key Features:
 * - Automatic domain detection from current tab
 * - Credential listing with encryption indicators
 * - Secure master password prompting with custom modal
 * - Real-time login status updates
 * - Auto-sort recently used credentials
 * - Content script injection and form filling
 * 
 * Security Features:
 * - Encapsulated in IIFE to prevent namespace pollution
 * - Secure password modal with masked input
 * - Session-based master password management
 * - Error handling without exposing sensitive data
 * 
 * @fileoverview Popup interface for SelectorPass extension
 * @author SelectorPass Team
 * @version 1.1.1
 */

(() => {
  'use strict';

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize popup when DOM is loaded
 * 
 * This is the main entry point for the popup interface. It:
 * 1. Detects the current website domain
 * 2. Loads domain configuration from storage
 * 3. Displays appropriate interface (credentials list or setup message)
 * 4. Sets up event handlers and login status indicator
 * 
 * @async
 * @function
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current tab's domain and display it in the popup header
    const currentDomain = await getCurrentDomain();
    const domainElement = document.getElementById('currentDomain');
    if (domainElement) {
      domainElement.textContent = currentDomain;
    }
    
    // Load all domain configurations from Chrome storage
    const domains = await loadData();
    
    // Show appropriate interface based on whether domain is configured
    if (!domains[currentDomain]) {
      // Domain not configured - show setup message with link to options
      showNoConfigMessage();
    } else {
      // Domain configured - show list of available credentials
      await showCredentialsList(currentDomain, domains[currentDomain]);
    }
    
    // Setup settings button to open options page
    setupSettingsButton();
    
    // Update login status indicator
    await updateLoginStatus();
    
  } catch (error) {
    // Show error message to user
    showErrorMessage('Failed to load SelectorPass. Please try again.');
  }
});

/**
 * Setup settings button click handler
 * 
 * Configures the settings button to open the options page.
 * If the current domain is not configured, it pre-populates
 * the domain field in the options page for user convenience.
 * 
 * @function
 */
function setupSettingsButton() {
  try {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', async () => {
        try {
          const currentDomain = await getCurrentDomain();
          const domains = await loadData();
          
          // If domain doesn't exist, pass it as parameter for pre-population
          if (!domains[currentDomain]) {
            const optionsUrl = chrome.runtime.getURL('options.html') + `?domain=${encodeURIComponent(currentDomain)}`;
            chrome.tabs.create({ url: optionsUrl });
          } else {
            chrome.runtime.openOptionsPage();
          }
        } catch (error) {
          chrome.runtime.openOptionsPage(); // Fallback
        }
      });
    }
  } catch (error) {
    // Silent error handling
  }
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/**
 * Get the hostname of the current active tab
 * 
 * Uses Chrome tabs API to get the current active tab and extracts
 * the hostname from its URL for domain-based credential lookup.
 * 
 * @async
 * @returns {Promise<string>} The hostname (e.g., 'example.com')
 * @throws {Error} If unable to access current tab or extract domain
 * 
 * @example
 * const domain = await getCurrentDomain();
 * // Returns: 'github.com' for https://github.com/user/repo
 */
async function getCurrentDomain() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      throw new Error('Unable to get current tab information');
    }
    
    return new URL(tab.url).hostname;
  } catch (error) {
    throw new Error(`Failed to get domain: ${error.message}`);
  }
}

/**
 * Load all domain configurations from Chrome storage
 * 
 * Retrieves the complete domains object from chrome.storage.local.
 * Returns empty object if no data exists (first run).
 * 
 * @async
 * @returns {Promise<Object>} Object containing all domain configurations
 * 
 * @example
 * const domains = await loadData();
 * // Returns: { 'example.com': { usernameSelector: '#user', ... }, ... }
 */
async function loadData() {
  try {
    const result = await chrome.storage.local.get(['domains']);
    return result.domains || {};
  } catch (error) {
    return {};
  }
}

/**
 * Save domain configurations to Chrome storage
 * 
 * Persists the complete domains object to chrome.storage.local.
 * Used when updating credential order (auto-sort recent).
 * 
 * @async
 * @param {Object} domains - Complete domains configuration object
 * @throws {Error} If storage operation fails
 */
async function saveData(domains) {
  try {
    await chrome.storage.local.set({ domains });
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// UI DISPLAY FUNCTIONS
// ============================================================================

/**
 * Show message when no configuration exists for current domain
 * 
 * Displays a user-friendly message indicating that the current
 * domain needs to be configured before credentials can be used.
 * 
 * @function
 */
function showNoConfigMessage() {
  try {
    const noConfigEl = document.getElementById('noConfig');
    const credentialsListEl = document.getElementById('credentialsList');
    
    if (noConfigEl) noConfigEl.style.display = 'block';
    if (credentialsListEl) credentialsListEl.style.display = 'none';
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Show error message to user
 * 
 * Displays error messages in the popup interface. Can optionally
 * preserve the credentials list for non-critical errors.
 * 
 * @param {string} message - Error message to display to user
 * @param {boolean} [clearCredentials=true] - Whether to hide credentials list
 * 
 * @example
 * showErrorMessage('Incorrect master password', false); // Keep credentials visible
 * showErrorMessage('Failed to load data'); // Hide credentials
 */
function showErrorMessage(message, clearCredentials = true) {
  try {
    const noConfigDiv = document.getElementById('noConfig');
    const credentialsListEl = document.getElementById('credentialsList');
    
    if (noConfigDiv) {
      const errorP = noConfigDiv.querySelector('p');
      if (errorP) {
        errorP.textContent = message;
        errorP.style.color = '#dc3545';
      }
      noConfigDiv.style.display = 'block';
    }
    
    if (clearCredentials && credentialsListEl) {
      credentialsListEl.style.display = 'none';
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Display list of available credentials for the current domain
 * 
 * Creates and displays credential items with encryption indicators
 * and fill buttons. Focuses the first fill button for keyboard navigation.
 * 
 * @async
 * @param {string} domain - The current domain name
 * @param {Object} domainConfig - Domain configuration object
 * @param {string} domainConfig.usernameSelector - CSS selector for username field
 * @param {string} domainConfig.passwordSelector - CSS selector for password field
 * @param {Array} domainConfig.credentials - Array of credential objects
 * @param {boolean} [domainConfig.autoSortRecent] - Whether to auto-sort recent credentials
 */
async function showCredentialsList(domain, domainConfig) {
  try {
    // Hide no-config message and show credentials list
    const noConfigEl = document.getElementById('noConfig');
    const credentialsListEl = document.getElementById('credentialsList');
    const container = document.getElementById('credentials');
    
    if (!container) {
      return;
    }
    
    if (noConfigEl) noConfigEl.style.display = 'none';
    if (credentialsListEl) credentialsListEl.style.display = 'block';
    
    // Clear existing credentials and rebuild list
    container.replaceChildren();
    
    const credentials = domainConfig.credentials || [];
    
    // Create credential item for each stored credential
    credentials.forEach((credential, index) => {
      try {
        const credentialElement = createCredentialElement(domain, domainConfig, credential, index);
        container.appendChild(credentialElement);
      } catch (error) {
        // Silent error handling
      }
    });
    
    // Focus first fill button for keyboard navigation
    const firstFillBtn = container.querySelector('.fill-btn');
    if (firstFillBtn) {
      firstFillBtn.focus();
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Create a single credential list item element
 * 
 * Builds a DOM element for a credential with username display,
 * encryption indicator, and fill button with event handlers.
 * 
 * @param {string} domain - The domain name
 * @param {Object} domainConfig - Domain configuration object
 * @param {Object} credential - Individual credential object
 * @param {string} credential.username - Username for display
 * @param {string|Object} credential.password - Password (string or encrypted object)
 * @param {boolean} [credential.encrypted] - Whether credential is encrypted
 * @param {number} index - Index of credential in array
 * @returns {HTMLElement} The credential item DOM element
 */
function createCredentialElement(domain, domainConfig, credential, index) {
  // Create main container
  const item = document.createElement('div');
  item.className = 'credential-item';
  
  // Create username display with encryption indicator
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'credential-username';
  
  const iconClass = credential.encrypted ? 'encryption-badge' : 'encryption-badge hidden';
  usernameSpan.innerHTML = `<span class="${iconClass}">🔐</span> ${credential.username.trim()}`;
  
  // Create fill button
  const fillBtn = document.createElement('button');
  fillBtn.className = 'fill-btn';
  fillBtn.textContent = 'Fill';
  fillBtn.dataset.index = index;
  fillBtn.setAttribute('aria-label', `Fill credentials for ${credential.username}`);
  
  // Add click handler for filling credentials
  fillBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fillCredentials(domain, domainConfig, index);
  });
  
  // Add keyboard support
  fillBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fillCredentials(domain, domainConfig, index);
    }
  });
  
  // Assemble element
  item.appendChild(usernameSpan);
  item.appendChild(fillBtn);
  
  return item;
}

// ============================================================================
// CREDENTIAL FILLING
// ============================================================================

/**
 * Fill form fields with selected credentials
 * 
 * This is the main form filling function that:
 * 1. Handles encrypted credential decryption
 * 2. Manages master password prompting and session storage
 * 3. Implements auto-sort functionality
 * 4. Injects content script and sends fill command
 * 5. Closes popup on successful completion
 * 
 * @async
 * @param {string} domain - The domain name
 * @param {Object} domainConfig - Domain configuration with CSS selectors
 * @param {number} credIndex - Index of selected credential in array
 */
async function fillCredentials(domain, domainConfig, credIndex) {
  try {
    // Validate inputs
    if (!domain || !domainConfig) {
      return;
    }
    
    if (!domainConfig.credentials || !Array.isArray(domainConfig.credentials)) {
      return;
    }
    
    if (credIndex < 0 || credIndex >= domainConfig.credentials.length) {
      return;
    }
    
    const credential = domainConfig.credentials[credIndex];
    if (!credential) {
      return;
    }
    
    // Handle encrypted credentials
    let username, password;
    if (credential.encrypted) {
      try {
        // Check if master password is already in session
        let masterPassword = await getMasterPassword();
        
        if (!masterPassword) {
          // Prompt for master password using secure modal
          masterPassword = await showPasswordModal();
          if (!masterPassword) {
            return; // User cancelled
          }
          
          // Verify master password
          const isValid = await verifyMasterPassword(masterPassword);
          if (!isValid) {
            showErrorMessage('Incorrect master password', false);
            return;
          }
          
          // Store in session for future use
          await setMasterPassword(masterPassword, 'browser');
          
          // Update login status indicator
          await updateLoginStatus();
        }
        
        // Decrypt credential using session password
        const decrypted = await decryptCredential(credential);
        username = decrypted.username;
        password = decrypted.password;
      } catch (error) {
        console.error('SelectorPass: Error decrypting credential:', error);
        showErrorMessage('Error decrypting credential. Please try again.', false);
        return;
      }
    } else {
      username = credential.username;
      password = credential.password;
    }
    
    if (!username || !password) {
      return;
    }
    
    if (!domainConfig.usernameSelector || !domainConfig.passwordSelector) {
      return;
    }
    
    // Auto-sort: Move recently used credential to top if enabled
    if (shouldMoveToTop(domainConfig, credIndex)) {
      await moveCredentialToTop(domain, credIndex);
    }
    
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      return;
    }
    
    // Inject content script if needed, then send message
    try {
      // Try to inject content script first
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
    } catch (injectionError) {
      // Content script might already be injected, continue
    }
    
    // Send message to content script to fill the form
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'fillCredentials',
        usernameSelector: domainConfig.usernameSelector.trim(),
        passwordSelector: domainConfig.passwordSelector.trim(),
        username: username.trim(),
        password: password.trim()
      });
      
      // Close popup after successful filling
      window.close();
    } catch (error) {
      // Show user-friendly error message
      showErrorMessage('Failed to fill form. Please refresh the page and try again.', false);
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Check if credential should be moved to top after use
 * @param {Object} domainConfig - Domain configuration
 * @param {number} credIndex - Index of credential being used
 * @returns {boolean} True if should move to top
 */
function shouldMoveToTop(domainConfig, credIndex) {
  // Only move if auto-sort is enabled and not already at top
  return domainConfig.autoSortRecent !== false && credIndex > 0;
}

/**
 * Move a credential to the top of the list (most recently used)
 * @param {string} domain - The domain name
 * @param {number} credIndex - Index of credential to move
 */
async function moveCredentialToTop(domain, credIndex) {
  try {
    // Load current data
    const domains = await loadData();
    
    if (!domains[domain] || !domains[domain].credentials) {
      return;
    }
    
    const credentials = domains[domain].credentials;
    
    if (credIndex < 0 || credIndex >= credentials.length) {
      return;
    }
    
    // Remove credential from current position
    const [movedCredential] = credentials.splice(credIndex, 1);
    
    // Insert at the beginning (top of list)
    credentials.unshift(movedCredential);
    
    // Save updated data
    await saveData(domains);
  } catch (error) {
    // Silent error handling
  }
}


/**
 * Show secure password modal and return entered password
 * 
 * Displays a custom modal with masked password input for master password entry.
 * Includes keyboard support (Enter to submit, Escape to cancel) and proper
 * event cleanup to prevent memory leaks.
 * 
 * @returns {Promise<string|null>} Master password or null if cancelled
 * 
 * @example
 * const password = await showPasswordModal();
 * if (password) {
 *   // User entered password
 * } else {
 *   // User cancelled
 * }
 */
function showPasswordModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('passwordModal');
    const input = document.getElementById('masterPasswordInput');
    const submitBtn = document.getElementById('passwordSubmit');
    const cancelBtn = document.getElementById('passwordCancel');
    
    // Show modal
    modal.style.display = 'block';
    input.value = '';
    input.focus();
    
    const cleanup = () => {
      modal.style.display = 'none';
      submitBtn.removeEventListener('click', handleSubmit);
      cancelBtn.removeEventListener('click', handleCancel);
      input.removeEventListener('keydown', handleKeydown);
    };
    
    const handleSubmit = () => {
      const password = input.value.trim();
      cleanup();
      resolve(password || null);
    };
    
    const handleCancel = () => {
      cleanup();
      resolve(null);
    };
    
    const handleKeydown = (e) => {
      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };
    
    submitBtn.addEventListener('click', handleSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    input.addEventListener('keydown', handleKeydown);
  });
}
/**
 * Update login status indicator in popup header
 * 
 * Updates the status icon to show current login state:
 * - 🔓 (unlocked) when master password is in session
 * - 🚫 (blocked) when not logged in
 * 
 * @async
 */
async function updateLoginStatus() {
  try {
    const statusIcon = document.getElementById('statusIcon');
    if (!statusIcon) return;
    
    const isLoggedIn = await isMasterPasswordSet();
    statusIcon.textContent = isLoggedIn ? '🔓' : '🚫';
    statusIcon.title = isLoggedIn ? 'Logged in' : 'Not logged in';
  } catch (error) {
    // Silent error handling
  }
}

})();