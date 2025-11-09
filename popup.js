/**
 * SelectorPass Popup Script
 * Handles the extension popup interface for credential selection and form filling
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize popup when DOM is loaded
 * Sets up the interface based on current domain configuration
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Get current tab's domain and display it
    const currentDomain = await getCurrentDomain();
    const domainElement = document.getElementById('currentDomain');
    if (domainElement) {
      domainElement.textContent = currentDomain;
    }
    
    // Load domain configurations from storage
    const domains = await loadData();
    
    // Show appropriate interface based on domain configuration
    if (!domains[currentDomain]) {
      showNoConfigMessage();
    } else {
      showCredentialsList(currentDomain, domains[currentDomain]);
    }
    
    // Setup settings button to open options page
    setupSettingsButton();
    
  } catch (error) {
    // Show error message to user
    showErrorMessage('Failed to load SelectorPass. Please try again.');
  }
});

/**
 * Setup settings button click handler
 */
function setupSettingsButton() {
  try {
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', async () => {
        try {
          // amazonq-ignore-next-line
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
 * @returns {Promise<string>} The hostname (e.g., 'example.com')
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
 * @returns {Promise<Object>} Object containing all domain configurations
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
 * @param {Object} domains - Complete domains configuration object
 */
async function saveData(domains) {
  try {
    await chrome.storage.local.set({ domains });
  } catch (error) {
    // amazonq-ignore-next-line
    throw error;
  }
}

// ============================================================================
// UI DISPLAY FUNCTIONS
// ============================================================================

/**
 * Show message when no configuration exists for current domain
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
 * @param {string} message - Error message to display
 */
function showErrorMessage(message) {
  try {
    // amazonq-ignore-next-line
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
    
    if (credentialsListEl) {
      credentialsListEl.style.display = 'none';
    }
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Display list of available credentials for the current domain
 * @param {string} domain - The current domain
 * @param {Object} domainConfig - Configuration object for the domain
 */
function showCredentialsList(domain, domainConfig) {
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
    // amazonq-ignore-next-line
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
 * @param {string} domain - The domain name
 * @param {Object} domainConfig - Domain configuration
 * @param {Object} credential - Individual credential object
 * @param {number} index - Index of credential in array
 * @returns {HTMLElement} The credential item element
 */
function createCredentialElement(domain, domainConfig, credential, index) {
  // Create main container
  const item = document.createElement('div');
  item.className = 'credential-item';
  
  // Create username display
  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'credential-username';
  // amazonq-ignore-next-line
  usernameSpan.textContent = credential.username.trim();
  
  // Create fill button
  const fillBtn = document.createElement('button');
  fillBtn.className = 'fill-btn';
  fillBtn.textContent = 'Fill';
  fillBtn.dataset.index = index;
  fillBtn.setAttribute('aria-label', `Fill credentials for ${credential.username}`);
  
  // Add click handler for filling credentials
  // amazonq-ignore-next-line
  fillBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fillCredentials(domain, domainConfig, index);
  });
  
  // Add keyboard support
  // amazonq-ignore-next-line
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
 * @param {string} domain - The domain name
 * @param {Object} domainConfig - Domain configuration with selectors
 * @param {number} credIndex - Index of selected credential
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
    if (!credential || !credential.username || !credential.password) {
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
        username: credential.username.trim(),
        password: credential.password.trim()
      });
      
      // Close popup after successful filling
      window.close();
    } catch (error) {
      // Show user-friendly error message
      showErrorMessage('Failed to fill form. Please refresh the page and try again.');
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
// amazonq-ignore-next-line
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