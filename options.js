/**
 * SelectorPass Options Page Script
 * Handles the extension settings interface for domain configuration and credential management
 */

(() => {
  'use strict';

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize options page when DOM is loaded
 * Sets up the interface and restores saved states
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Disable transitions during initial load to prevent flash
    document.body.classList.add('no-transition');
    
    await restoreAddDomainState();
    setupEventListeners();
    await setupSecuritySection();
    await loadAndDisplayDomains();
    
    // Check if user is already logged in
    await checkLoginStatus();
    
    // Handle URL parameters for domain pre-population
    handleUrlParameters();
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 50);
    
    // Connect to background script for login status updates
    setupLoginStatusConnection();
  } catch (error) {
    // Silent error handling
  }
});



// ============================================================================
// URL PARAMETER HANDLING
// ============================================================================

/**
 * Handle URL parameters for domain pre-population
 */
function handleUrlParameters() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const domainParam = urlParams.get('domain');
    
    if (domainParam) {
      // Expand Add Domain section
      const addDomainSection = document.getElementById('addDomainHeader')?.closest('.section');
      if (addDomainSection) {
        addDomainSection.classList.add('expanded');
      }
      
      // Pre-populate domain input
      const domainInput = document.getElementById('domainInput');
      if (domainInput) {
        domainInput.value = domainParam;
        domainInput.focus();
      }
      
      // Save expanded state
      chrome.storage.local.set({ addDomainExpanded: true });
    }
  } catch (error) {
    // Silent error handling
  }
}

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

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
    throw error;
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Setup all event listeners for the options page
 */
function setupEventListeners() {
  try {
    const saveBtn = document.getElementById('saveDomainBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveDomain);
    }
    
    // Setup collapsible sections
    const addDomainHeader = document.getElementById('addDomainHeader');
    if (addDomainHeader) {
      addDomainHeader.addEventListener('click', toggleAddDomainSection);
    }
    
    const securityHeader = document.getElementById('securityHeader');
    if (securityHeader) {
      securityHeader.addEventListener('click', toggleSecuritySection);
    } else {
      console.error('Security header not found');
    }
    
    const manageDomainsHeader = document.getElementById('manageDomainsHeader');
    if (manageDomainsHeader) {
      manageDomainsHeader.addEventListener('click', toggleManageDomainsSection);
    }
    
    // Setup security event listeners
    setupSecurityEventListeners();
    
    // Setup Buy Me a Coffee button
    const buyCoffeeBtn = document.getElementById('buy-coffee');
    if (buyCoffeeBtn) {
      buyCoffeeBtn.addEventListener('click', () => {
        try {
          chrome.tabs.create({ url: 'https://buymeacoffee.com/cawmdev' });
        } catch (error) {
          // Silent error handling
        }
      });
    }
  } catch (error) {
    // Silent error handling
  }
}

// ============================================================================
// COLLAPSIBLE SECTIONS
// ============================================================================

/**
 * Toggle the Add Domain section collapse state
 */
async function toggleAddDomainSection() {
  try {
    const section = document.querySelector('.collapsible');
    if (!section) {
      return;
    }
    
    section.classList.toggle('expanded');
    
    // Save the current state
    const isExpanded = section.classList.contains('expanded');
    await chrome.storage.local.set({ addDomainExpanded: isExpanded });
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Toggle the Security section collapse state
 */
async function toggleSecuritySection() {
  try {
    const section = document.getElementById('securityHeader')?.closest('.section');
    if (!section) {
      return;
    }
    
    section.classList.toggle('expanded');
    
    const isExpanded = section.classList.contains('expanded');
    await chrome.storage.local.set({ securityExpanded: isExpanded });
  } catch (error) {
    // Silent error handling
  }
}

/**
 * Toggle the Manage Domains section collapse state
 */
async function toggleManageDomainsSection() {
  try {
    const header = document.getElementById('manageDomainsHeader');
    if (!header) {
      console.error('SelectorPass: Manage domains header not found');
      return;
    }
    
    const section = header.closest('.section');
    if (!section) {
      console.error('SelectorPass: Manage domains section not found');
      return;
    }
    
    section.classList.toggle('expanded');
    
    const isExpanded = section.classList.contains('expanded');
    await chrome.storage.local.set({ manageDomainsExpanded: isExpanded });
  } catch (error) {
    console.error('SelectorPass: Error toggling manage domains section:', error);
  }
}

/**
 * Restore the saved collapse states for main sections
 */
async function restoreAddDomainState() {
  try {
    const result = await chrome.storage.local.get(['addDomainExpanded', 'securityExpanded', 'manageDomainsExpanded']);
    const addDomainExpanded = result.addDomainExpanded || false;
    const securityExpanded = result.securityExpanded || false;
    const manageDomainsExpanded = result.manageDomainsExpanded !== false;
    
    const addDomainSection = document.getElementById('addDomainHeader')?.closest('.section');
    if (addDomainExpanded && addDomainSection) {
      addDomainSection.classList.add('expanded');
    }
    
    const securitySection = document.getElementById('securityHeader')?.closest('.section');
    if (securityExpanded && securitySection) {
      securitySection.classList.add('expanded');
    } else if (securitySection) {
      securitySection.classList.add('collapsible');
    }
    
    const manageDomainsSection = document.getElementById('manageDomainsHeader')?.closest('.section');
    if (!manageDomainsExpanded && manageDomainsSection) {
      manageDomainsSection.classList.remove('expanded');
    }
  } catch (error) {
    console.error('SelectorPass: Error restoring domain state:', error);
  }
}

/**
 * Toggle collapse state for individual domain items
 * @param {string} domain - Domain name to toggle
 */
async function toggleDomainSection(domain) {
  try {
    if (!domain) {
      console.error('SelectorPass: Domain parameter is required');
      return;
    }
    
    const domainItem = document.querySelector(`[data-domain="${domain}"].domain-collapsible`);
    
    if (domainItem) {
      domainItem.classList.toggle('expanded');
      
      // Save the current state
      const isExpanded = domainItem.classList.contains('expanded');
      const result = await chrome.storage.local.get(['domainStates']);
      const domainStates = result.domainStates || {};
      domainStates[domain] = isExpanded;
      await chrome.storage.local.set({ domainStates });
    }
  } catch (error) {
    console.error('SelectorPass: Error toggling domain section:', error);
  }
}

/**
 * Restore saved collapse states for all domain items
 */
async function restoreDomainStates() {
  try {
    const result = await chrome.storage.local.get(['domainStates']);
    const domainStates = result.domainStates || {};
    
    // Get all domain items
    const domainItems = document.querySelectorAll('.domain-collapsible');
    
    domainItems.forEach(domainItem => {
      try {
        const domain = domainItem.dataset.domain;
        if (!domain) return;
        
        const savedState = domainStates[domain];
        
        // Default to expanded if no saved state exists
        if (savedState === undefined || savedState === true) {
          domainItem.classList.add('expanded');
        }
      } catch (error) {
        console.error('SelectorPass: Error restoring state for domain item:', error);
      }
    });
  } catch (error) {
    console.error('SelectorPass: Error restoring domain states:', error);
  }
}

// Action handlers map for better performance and maintainability
const actionHandlers = new Map([
  ['delete-domain', (domain) => deleteDomain(domain)],
  ['delete-credential', (domain, button) => deleteCredential(domain, parseInt(button.dataset.index))],
  ['add-credential', (domain) => addCredential(domain)],
  ['edit-domain', (domain) => editDomain(domain)],
  ['save-domain', (domain) => saveDomainEdit(domain)],
  ['cancel-edit', (domain) => cancelDomainEdit(domain)],
  ['edit-credential', (domain, button) => editCredential(domain, parseInt(button.dataset.index))],
  ['save-credential', (domain, button) => saveCredential(domain, parseInt(button.dataset.index))],
  ['cancel-credential', (domain, button) => cancelCredential(domain, parseInt(button.dataset.index))],
  ['toggle-password', (domain, button) => togglePassword(domain, parseInt(button.dataset.index))],
  ['encrypt-credential', (domain, button) => encryptSingleCredential(domain, parseInt(button.dataset.index))],
  ['decrypt-credential', (domain, button) => decryptSingleCredential(domain, parseInt(button.dataset.index))]
]);

/**
 * Handle all button clicks in the domains list
 * @param {Event} event - Click event object
 */
function handleButtonClick(event) {
  try {
    const button = event.target;
    const action = button.dataset?.action;
    const domain = button.dataset?.domain;
    
    // Handle domain collapse/expand - check if clicked on domain header but not on a button
    const domainHeader = event.target.closest('.domain-header');
    if (domainHeader && !action) {
      const headerDomain = domainHeader.dataset?.domain;
      if (headerDomain) {
        toggleDomainSection(headerDomain);
        return;
      }
    }
    
    // Execute action using Map lookup
    if (action) {
      const handler = actionHandlers.get(action);
      if (handler) {
        handler(domain, button);
      }
    }
  } catch (error) {
    console.error('SelectorPass: Error handling button click:', error);
  }
}



/**
 * Validate domain input
 * @param {string} domain - Domain to validate
 * @returns {boolean} True if valid
 */
function isValidDomain(domain) {
  // Basic domain validation - alphanumeric, dots, hyphens
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

/**
 * Validate CSS selector input
 * @param {string} selector - CSS selector to validate
 * @returns {boolean} True if valid
 */
function isValidSelector(selector) {
  try {
    // Test if it's a valid CSS selector by trying to use it
    document.querySelector(selector);
    return true;
  } catch (error) {
    return false;
  }
}

async function saveDomain() {
  try {
    const domainInput = document.getElementById('domainInput');
    const usernameInput = document.getElementById('usernameSelector');
    const passwordInput = document.getElementById('passwordSelector');
    
    if (!domainInput || !usernameInput || !passwordInput) {
      console.error('SelectorPass: Required form elements not found');
      showConfirmDialog('Form elements not found. Please refresh the page.', () => {});
      return;
    }
    
    const domain = domainInput.value.trim();
    const usernameSelector = usernameInput.value.trim();
    const passwordSelector = passwordInput.value.trim();
    
    // Validate inputs
    if (!domain || !usernameSelector || !passwordSelector) {
      showAlertDialog('Please fill all fields');
      return;
    }
    
    if (!isValidDomain(domain)) {
      showAlertDialog('Please enter a valid domain name');
      return;
    }
    
    if (!isValidSelector(usernameSelector)) {
      showAlertDialog('Please enter a valid CSS selector for username field');
      return;
    }
    
    if (!isValidSelector(passwordSelector)) {
      showAlertDialog('Please enter a valid CSS selector for password field');
      return;
    }
    
    const domains = await loadData();
    domains[domain] = {
      usernameSelector: usernameSelector,
      passwordSelector: passwordSelector,
      autoSortRecent: true,
      credentials: domains[domain]?.credentials || []
    };
    
    await saveData(domains);
    
    // Clear form
    domainInput.value = '';
    usernameInput.value = '';
    passwordInput.value = '';
    
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error saving domain:', error);
    showConfirmDialog('Error saving domain. Please try again.', () => {});
  }
}



async function loadAndDisplayDomains() {
  try {
    const domains = await loadData();
    await displayDomains(domains);
  } catch (error) {
    console.error('SelectorPass: Error loading and displaying domains:', error);
  }
}

async function displayDomains(domains) {
  try {
    const container = document.getElementById('domainsList');
    if (!container) {
      console.error('SelectorPass: Domains list container not found');
      return;
    }
    
    container.replaceChildren();
    
    Object.entries(domains).forEach(([domain, config]) => {
      try {
        const domainDiv = createDomainElement(domain, config);
        container.appendChild(domainDiv);
      } catch (error) {
        console.error(`SelectorPass: Error creating domain element for ${domain}:`, error);
      }
    });
    
    // Add event listeners for all buttons
    container.addEventListener('click', handleButtonClick);
    
    // Add drag and drop listeners
    setupDragAndDrop(container);
    
    // Restore domain collapse states
    await restoreDomainStates();
  } catch (error) {
    console.error('SelectorPass: Error displaying domains:', error);
  }
}

function createDomainElement(domain, config) {
  const domainDiv = document.createElement('div');
  domainDiv.className = 'domain-item domain-collapsible';
  domainDiv.dataset.domain = domain;
  
  // Create domain header
  const header = createDomainHeader(domain);
  domainDiv.appendChild(header);
  
  // Create collapsible content
  const content = document.createElement('div');
  content.className = 'domain-collapsible-content';
  
  // Create wrapper div for grid collapse
  const wrapper = document.createElement('div');
  
  // Create selector info
  const selectorInfo = createSelectorInfo(domain, config);
  wrapper.appendChild(selectorInfo);
  
  // Create credentials section
  const credentialsSection = createCredentialsSection(domain, config);
  wrapper.appendChild(credentialsSection);
  
  content.appendChild(wrapper);
  domainDiv.appendChild(content);
  
  return domainDiv;
}

function createDomainHeader(domain) {
  const header = document.createElement('div');
  header.className = 'domain-header collapsible-header';
  header.dataset.domain = domain;
  
  const leftSide = document.createElement('div');
  leftSide.className = 'domain-header-left';
  
  const expandIcon = document.createElement('span');
  expandIcon.className = 'expand-icon';
  expandIcon.textContent = '▶';
  
  const title = document.createElement('div');
  title.className = 'domain-title';
  
  const nameSpan = document.createElement('span');
  nameSpan.className = 'domain-name';
  nameSpan.dataset.domain = domain;
  nameSpan.textContent = domain.trim();
  
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'domain-edit-input';
  editInput.value = domain.trim();
  editInput.style.display = 'none';
  
  title.appendChild(nameSpan);
  title.appendChild(editInput);
  
  leftSide.appendChild(expandIcon);
  leftSide.appendChild(title);
  
  const buttons = document.createElement('div');
  buttons.className = 'domain-buttons';
  
  const editBtn = createButton('Edit', 'edit-btn', { domain, action: 'edit-domain' });
  const saveBtn = createButton('Save', 'save-btn', { domain, action: 'save-domain' });
  const cancelBtn = createButton('Cancel', 'cancel-btn', { domain, action: 'cancel-edit' });
  const deleteBtn = createButton('Delete Domain', 'delete-btn', { domain, action: 'delete-domain' });
  
  saveBtn.style.display = 'none';
  cancelBtn.style.display = 'none';
  
  buttons.appendChild(editBtn);
  buttons.appendChild(saveBtn);
  buttons.appendChild(cancelBtn);
  buttons.appendChild(deleteBtn);
  
  header.appendChild(leftSide);
  header.appendChild(buttons);
  
  // Add click listener to the left side only (not buttons)
  leftSide.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDomainSection(domain);
  });
  
  return header;
}

function createSelectorInfo(domain, config) {
  const selectorInfo = document.createElement('div');
  selectorInfo.className = 'selector-info';
  
  // Display mode
  const display = document.createElement('div');
  display.className = 'selector-display';
  
  const selectorText = document.createElement('div');
  const usernameLine = document.createElement('div');
  usernameLine.textContent = `Username selector: ${config.usernameSelector.trim()}`;
  const passwordLine = document.createElement('div');
  passwordLine.textContent = `Password selector: ${config.passwordSelector.trim()}`;
  selectorText.appendChild(usernameLine);
  selectorText.appendChild(passwordLine);
  
  const statusSpan = document.createElement('span');
  statusSpan.className = 'auto-sort-status';
  statusSpan.textContent = 'Move recent to top: ';
  
  const statusIndicator = document.createElement('span');
  statusIndicator.className = (config.autoSortRecent !== false) ? 'enabled' : 'disabled';
  statusIndicator.textContent = (config.autoSortRecent !== false) ? '✓ Yes' : '✗ No';
  
  statusSpan.appendChild(statusIndicator);
  display.appendChild(selectorText);
  display.appendChild(document.createElement('br'));
  display.appendChild(statusSpan);
  
  // Edit mode
  const edit = createSelectorEditForm(domain, config);
  
  selectorInfo.appendChild(display);
  selectorInfo.appendChild(edit);
  
  return selectorInfo;
}

function createSelectorEditForm(domain, config) {
  const edit = document.createElement('div');
  edit.className = 'selector-edit';
  edit.style.display = 'none';
  
  // Username row
  const usernameRow = document.createElement('div');
  usernameRow.className = 'selector-row';
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = 'Username:';
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.className = 'selector-input';
  usernameInput.dataset.field = 'usernameSelector';
  usernameInput.value = config.usernameSelector.trim();
  usernameInput.id = `selector-username-${domain}`;
  usernameInput.name = `selector-username-${domain}`;
  usernameLabel.setAttribute('for', usernameInput.id);
  usernameRow.appendChild(usernameLabel);
  usernameRow.appendChild(usernameInput);
  
  // Password row
  const passwordRow = document.createElement('div');
  passwordRow.className = 'selector-row';
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password:';
  const passwordInput = document.createElement('input');
  passwordInput.type = 'text';
  passwordInput.className = 'selector-input';
  passwordInput.dataset.field = 'passwordSelector';
  passwordInput.value = config.passwordSelector.trim();
  passwordInput.id = `selector-password-${domain}`;
  passwordInput.name = `selector-password-${domain}`;
  passwordLabel.setAttribute('for', passwordInput.id);
  passwordRow.appendChild(passwordLabel);
  passwordRow.appendChild(passwordInput);
  
  // Checkbox row
  const checkboxRow = document.createElement('div');
  checkboxRow.className = 'selector-row';
  const checkboxLabel = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'auto-sort-checkbox';
  checkbox.dataset.field = 'autoSortRecent';
  checkbox.checked = (config.autoSortRecent !== false);
  const checkboxText = document.createElement('span');
  checkboxText.textContent = 'Auto-sort recent to top';
  checkboxLabel.appendChild(checkbox);
  checkboxLabel.appendChild(checkboxText);
  checkboxRow.appendChild(checkboxLabel);
  
  edit.appendChild(usernameRow);
  edit.appendChild(passwordRow);
  edit.appendChild(checkboxRow);
  
  return edit;
}

function createCredentialsSection(domain, config) {
  const section = document.createElement('div');
  section.className = 'credentials-section';
  
  const title = document.createElement('h4');
  title.textContent = `Credentials (${config.credentials?.length || 0})`;
  
  const form = createCredentialForm(domain);
  
  const credentialsDiv = document.createElement('div');
  credentialsDiv.id = `credentials-${domain}`;
  
  (config.credentials || []).forEach((cred, index) => {
    const credItem = createCredentialItem(domain, cred, index);
    credentialsDiv.appendChild(credItem);
  });
  
  section.appendChild(title);
  section.appendChild(form);
  section.appendChild(credentialsDiv);
  
  return section;
}

function createCredentialItem(domain, cred, index) {
  const item = document.createElement('div');
  item.className = 'credential-item';
  item.draggable = true;
  item.dataset.domain = domain;
  item.dataset.index = index;
  
  // Display mode
  const display = document.createElement('div');
  display.className = 'credential-display';
  
  const dragHandle = document.createElement('span');
  dragHandle.className = 'drag-handle';
  dragHandle.textContent = '⋮⋮';
  
  const username = document.createElement('span');
  username.className = 'credential-username';
  
  // Show username with encryption indicator (always show icon for alignment)
  const usernameText = (cred.username || '').trim();
  const iconClass = cred.encrypted ? 'encryption-badge' : 'encryption-badge hidden';
  username.innerHTML = `<span class="${iconClass}">🔐</span> ${usernameText}`;
  
  const buttons = document.createElement('div');
  buttons.className = 'credential-buttons';
  
  const editBtn = createIconButton('✏️', 'Edit credential', 'credential-action-btn', { domain, index, action: 'edit-credential' });
  
  // Add encrypt/remove encryption button based on current state
  const encryptBtn = cred.encrypted 
    ? createIconButton('🔓', 'Remove encryption', 'credential-action-btn', { domain, index, action: 'decrypt-credential' })
    : createIconButton('🔐', 'Encrypt credential', 'credential-action-btn', { domain, index, action: 'encrypt-credential' });
  
  const deleteBtn = createIconButton('🗑️', 'Delete credential', 'credential-action-btn', { domain, index, action: 'delete-credential' });
  
  buttons.appendChild(editBtn);
  buttons.appendChild(encryptBtn);
  buttons.appendChild(deleteBtn);
  
  display.appendChild(dragHandle);
  display.appendChild(username);
  display.appendChild(buttons);
  
  // Edit mode
  const edit = createCredentialEditForm(domain, cred, index);
  
  item.appendChild(display);
  item.appendChild(edit);
  
  return item;
}

function createCredentialEditForm(domain, cred, index) {
  const edit = document.createElement('div');
  edit.className = 'credential-edit';
  edit.style.display = 'none';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = 'Username';
  usernameLabel.setAttribute('for', `edit-username-${domain}-${index}`);
  usernameLabel.style.display = 'none';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.className = 'cred-username-input';
  
  // Username is always available (not encrypted)
  usernameInput.value = (cred.username || '').trim();
  usernameInput.placeholder = 'Username';
  
  usernameInput.id = `edit-username-${domain}-${index}`;
  usernameInput.name = `edit-username-${domain}-${index}`;
  
  const passwordField = document.createElement('div');
  passwordField.className = 'password-field';
  
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password';
  passwordLabel.setAttribute('for', `edit-password-${domain}-${index}`);
  passwordLabel.style.display = 'none';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.className = 'cred-password-input';
  
  // Handle encrypted passwords
  if (cred.encrypted) {
    // Try to decrypt and show password if logged in
    decryptCredentialForEdit(cred).then(decrypted => {
      if (decrypted) {
        passwordInput.value = decrypted.password || '';
        passwordInput.placeholder = 'Password';
      } else {
        passwordInput.value = '';
        passwordInput.placeholder = 'Password (encrypted - enter new to change)';
      }
    }).catch(() => {
      passwordInput.value = '';
      passwordInput.placeholder = 'Password (encrypted - enter new to change)';
    });
  } else {
    passwordInput.value = (cred.password || '').trim();
    passwordInput.placeholder = 'Password';
  }
  
  passwordInput.id = `edit-password-${domain}-${index}`;
  passwordInput.name = `edit-password-${domain}-${index}`;
  
  const showBtn = document.createElement('button');
  showBtn.type = 'button';
  showBtn.className = 'show-password-btn';
  showBtn.textContent = '👁️';
  showBtn.dataset.domain = domain;
  showBtn.dataset.index = index;
  showBtn.dataset.action = 'toggle-password';
  
  passwordField.appendChild(passwordInput);
  passwordField.appendChild(showBtn);
  
  const buttons = document.createElement('div');
  buttons.className = 'credential-buttons';
  
  const saveBtn = createButton('Save', 'save-btn', { domain, index, action: 'save-credential' });
  const cancelBtn = createButton('Cancel', 'cancel-btn', { domain, index, action: 'cancel-credential' });
  
  buttons.appendChild(saveBtn);
  buttons.appendChild(cancelBtn);
  
  edit.appendChild(usernameLabel);
  edit.appendChild(usernameInput);
  passwordField.appendChild(passwordLabel);
  edit.appendChild(passwordField);
  edit.appendChild(buttons);
  
  return edit;
}

function createCredentialForm(domain) {
  const form = document.createElement('div');
  form.className = 'credential-form';
  
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = 'Username';
  usernameLabel.setAttribute('for', `username-${domain}`);
  usernameLabel.style.display = 'none';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = 'Username';
  usernameInput.id = `username-${domain}`;
  usernameInput.name = `username-${domain}`;
  
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = 'Password';
  passwordLabel.setAttribute('for', `password-${domain}`);
  passwordLabel.style.display = 'none';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.id = `password-${domain}`;
  passwordInput.name = `password-${domain}`;
  
  // Encryption checkbox
  const encryptLabel = document.createElement('label');
  encryptLabel.className = 'encrypt-checkbox-label';
  
  const encryptCheckbox = document.createElement('input');
  encryptCheckbox.type = 'checkbox';
  encryptCheckbox.id = `encrypt-${domain}`;
  encryptCheckbox.name = `encrypt-${domain}`;
  encryptCheckbox.className = 'encrypt-checkbox';
  
  const encryptText = document.createElement('span');
  encryptText.textContent = 'Encrypt this credential';
  
  encryptLabel.appendChild(encryptCheckbox);
  encryptLabel.appendChild(encryptText);
  
  const addBtn = createButton('Add', 'add-credential-btn', { domain, action: 'add-credential' });
  
  form.appendChild(usernameLabel);
  form.appendChild(usernameInput);
  form.appendChild(passwordLabel);
  form.appendChild(passwordInput);
  form.appendChild(encryptLabel);
  form.appendChild(addBtn);
  
  return form;
}

function createButton(text, className, datasets) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  
  Object.entries(datasets).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  
  return button;
}

function createIconButton(icon, tooltip, className, datasets) {
  const button = document.createElement('button');
  button.textContent = icon;
  button.className = className;
  button.title = tooltip;
  
  Object.entries(datasets).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  
  return button;
}

function createIconTextButton(icon, text, className, datasets) {
  const button = document.createElement('button');
  button.innerHTML = `<div class="btn-icon">${icon}</div><div class="btn-text">${text}</div>`;
  button.className = className;
  button.title = text;
  
  Object.entries(datasets).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  
  return button;
}

async function addCredential(domain) {
  const usernameInput = document.getElementById(`username-${domain}`);
  const passwordInput = document.getElementById(`password-${domain}`);
  
  if (!usernameInput || !passwordInput) {
    console.error('SelectorPass: Credential input fields not found');
    return;
  }
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    showAlertDialog('Username and password are required');
    return;
  }
  
  // Basic validation
  if (username.length > 100 || password.length > 100) {
    showAlertDialog('Username and password must be less than 100 characters');
    return;
  }
  
  try {
    const domains = await loadData();
    
    if (!domains[domain]) {
      console.error('SelectorPass: Domain configuration not found');
      return;
    }
    
    // Check if user wants to encrypt this credential
    const encryptCheckbox = document.getElementById(`encrypt-${domain}`);
    const shouldEncrypt = encryptCheckbox?.checked || false;
    
    let credentialToSave = { username, password };
    
    if (shouldEncrypt) {
      const settings = await getSecuritySettings();
      
      if (!settings.masterPasswordSet) {
        showAlertDialog('Please set up a master password first in the Security section.');
        return;
      }
      
      // If master password not in memory, prompt for it
      if (!(await isMasterPasswordSet())) {
        const masterPassword = await promptForMasterPassword();
        if (!masterPassword) {
          return; // User cancelled
        }
        
        const isValid = await verifyMasterPassword(masterPassword);
        if (!isValid) {
          showAlertDialog('Incorrect master password');
          return;
        }
        
        await setMasterPassword(masterPassword, 'browser');
      }
      
      try {
        credentialToSave = await encryptCredential({ username, password });
      } catch (error) {
        console.error('SelectorPass: Error encrypting credential:', error);
        showAlertDialog('Error encrypting credential. Please try again.');
        return;
      }
    }
    
    domains[domain].credentials.push(credentialToSave);
    
    await saveData(domains);
    
    // Clear inputs
    usernameInput.value = '';
    passwordInput.value = '';
    if (encryptCheckbox) {
      encryptCheckbox.checked = false;
    }
    
    await loadAndDisplayDomains();
    await updateSecurityUI();
  } catch (error) {
    console.error('SelectorPass: Error adding credential:', error);
    showConfirmDialog('Error adding credential. Please try again.', () => {});
  }
}

/**
 * Prompt user for master password using a dialog
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForMasterPassword() {
  return promptForMasterPasswordWithMessage('Enter your master password to encrypt this credential:');
}

/**
 * Prompt user for master password for decryption
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForMasterPasswordDecrypt() {
  return promptForMasterPasswordWithMessage('Enter your master password to remove encryption:');
}

/**
 * Prompt user for master password to login
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForLogin() {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      resolve(null);
      return;
    }
    
    // Create password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter master password';
    passwordInput.style.cssText = 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-top: 12px; font-size: 14px;';
    
    messageEl.innerHTML = 'Enter your master password to login:';
    messageEl.appendChild(passwordInput);
    
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Login';
    
    const handleConfirm = () => {
      const password = passwordInput.value.trim();
      dialog.close();
      cleanup();
      resolve(password || null);
    };
    
    const handleCancel = () => {
      dialog.close();
      cleanup();
      resolve(null);
    };
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      passwordInput.removeEventListener('keypress', handleKeyPress);
      confirmBtn.textContent = 'Delete';
      messageEl.innerHTML = '';
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    passwordInput.addEventListener('keypress', handleKeyPress);
    
    dialog.showModal();
    passwordInput.focus();
  });
}

/**
 * Prompt user to set up master password for first time
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForMasterPasswordSetup() {
  return promptForMasterPasswordWithMessage('Set up a master password to encrypt this credential:');
}

/**
 * Prompt user for new master password when changing
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForNewMasterPassword() {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      resolve(null);
      return;
    }
    
    // Create password inputs
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter new master password';
    passwordInput.style.cssText = 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-top: 12px; font-size: 14px;';
    
    const confirmInput = document.createElement('input');
    confirmInput.type = 'password';
    confirmInput.placeholder = 'Confirm new master password';
    confirmInput.style.cssText = 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-top: 8px; font-size: 14px;';
    
    messageEl.innerHTML = 'Enter your new master password:';
    messageEl.appendChild(passwordInput);
    messageEl.appendChild(confirmInput);
    
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Change Password';
    
    const handleConfirm = () => {
      const password = passwordInput.value.trim();
      const confirm = confirmInput.value.trim();
      
      if (!password) {
        showAlertDialog('Please enter a password');
        return;
      }
      
      if (password !== confirm) {
        showAlertDialog('Passwords do not match');
        return;
      }
      
      dialog.close();
      cleanup();
      resolve(password);
    };
    
    const handleCancel = () => {
      dialog.close();
      cleanup();
      resolve(null);
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      confirmBtn.textContent = 'Delete';
      messageEl.innerHTML = '';
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    dialog.showModal();
    passwordInput.focus();
  });
}

/**
 * Generic prompt for master password with custom message
 * @param {string} message - Message to display
 * @returns {Promise<string|null>} Master password or null if cancelled
 */
function promptForMasterPasswordWithMessage(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      resolve(null);
      return;
    }
    
    // Create password input
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Enter master password';
    passwordInput.style.cssText = 'width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; margin-top: 12px; font-size: 14px;';
    
    messageEl.innerHTML = message;
    messageEl.appendChild(passwordInput);
    
    // Show both buttons
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Encrypt';
    
    const handleConfirm = () => {
      const password = passwordInput.value.trim();
      dialog.close();
      cleanup();
      resolve(password || null);
    };
    
    const handleCancel = () => {
      dialog.close();
      cleanup();
      resolve(null);
    };
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      passwordInput.removeEventListener('keypress', handleKeyPress);
      // Reset dialog
      confirmBtn.textContent = 'Delete';
      messageEl.innerHTML = '';
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    passwordInput.addEventListener('keypress', handleKeyPress);
    
    dialog.showModal();
    passwordInput.focus();
  });
}

function showAlertDialog(message) {
  try {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      console.error('SelectorPass: Dialog elements not found');
      return;
    }
    
    messageEl.textContent = message;
    
    // Hide cancel button for alert messages
    cancelBtn.style.display = 'none';
    confirmBtn.textContent = 'OK';
    
    const handleOK = () => {
      try {
        dialog.close();
        cleanup();
      } catch (error) {
        console.error('SelectorPass: Error in dialog OK handler:', error);
      }
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleOK);
      // Reset button states
      cancelBtn.style.display = 'inline-block';
      confirmBtn.textContent = 'Delete';
    };
    
    confirmBtn.addEventListener('click', handleOK);
    
    dialog.showModal();
  } catch (error) {
    console.error('SelectorPass: Error showing error dialog:', error);
  }
}

function showConfirmDialog(message, onConfirm) {
  try {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      console.error('SelectorPass: Dialog elements not found');
      return;
    }
    
    messageEl.textContent = message;
    
    // Show both buttons for confirmations
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Delete';
    
    const handleConfirm = () => {
      try {
        dialog.close();
        onConfirm();
        cleanup();
      } catch (error) {
        console.error('SelectorPass: Error in dialog confirm handler:', error);
      }
    };
    
    const handleCancel = () => {
      try {
        dialog.close();
        cleanup();
      } catch (error) {
        console.error('SelectorPass: Error in dialog cancel handler:', error);
      }
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    dialog.showModal();
  } catch (error) {
    console.error('SelectorPass: Error showing confirm dialog:', error);
  }
}

function showConfirmationDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirmDialog');
    const messageEl = dialog?.querySelector('.dialog-message');
    const confirmBtn = document.getElementById('dialogConfirm');
    const cancelBtn = document.getElementById('dialogCancel');
    
    if (!dialog || !messageEl || !confirmBtn || !cancelBtn) {
      resolve(false);
      return;
    }
    
    messageEl.textContent = message;
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'OK';
    
    const handleConfirm = () => {
      dialog.close();
      cleanup();
      resolve(true);
    };
    
    const handleCancel = () => {
      dialog.close();
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      confirmBtn.textContent = 'Delete';
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    dialog.showModal();
  });
}

async function deleteCredential(domain, index) {
  try {
    const domains = await loadData();
    
    if (!domains[domain] || !domains[domain].credentials || !domains[domain].credentials[index]) {
      console.error('SelectorPass: Invalid domain or credential index');
      return;
    }
    
    const credential = domains[domain].credentials[index];
    
    showConfirmDialog(
      `Delete credential for "${credential.username}" on ${domain}?`,
      async () => {
        try {
          domains[domain].credentials.splice(index, 1);
          await saveData(domains);
          await loadAndDisplayDomains();
        } catch (error) {
          console.error('SelectorPass: Error deleting credential:', error);
          showConfirmDialog('Error deleting credential. Please try again.', () => {});
        }
      }
    );
  } catch (error) {
    console.error('SelectorPass: Error in deleteCredential:', error);
  }
}

function editDomain(domain) {
  try {
    const domainItem = document.querySelector(`[data-domain="${domain}"]`)?.closest('.domain-item');
    if (!domainItem) {
      console.error('SelectorPass: Domain item not found for editing');
      return;
    }
    
    const domainSpan = domainItem.querySelector('.domain-name');
    const domainInput = domainSpan?.nextElementSibling;
    const selectorDisplay = domainItem.querySelector('.selector-display');
    const selectorEdit = domainItem.querySelector('.selector-edit');
    const editBtn = domainItem.querySelector('[data-action="edit-domain"]');
    const saveBtn = domainItem.querySelector('[data-action="save-domain"]');
    const cancelBtn = domainItem.querySelector('[data-action="cancel-edit"]');
    
    if (!domainSpan || !domainInput || !selectorDisplay || !selectorEdit || !editBtn || !saveBtn || !cancelBtn) {
      console.error('SelectorPass: Required elements not found for domain editing');
      return;
    }
    
    // Show edit mode for domain
    domainSpan.style.display = 'none';
    domainInput.style.display = 'inline-block';
    domainInput.focus();
    
    // Show edit mode for selectors
    selectorDisplay.style.display = 'none';
    selectorEdit.style.display = 'block';
    
    // Switch buttons
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  } catch (error) {
    console.error('SelectorPass: Error editing domain:', error);
  }
}

async function saveDomainEdit(oldDomain) {
  try {
    const domainItem = document.querySelector(`[data-domain="${oldDomain}"]`)?.closest('.domain-item');
    if (!domainItem) {
      console.error('SelectorPass: Domain item not found');
      return;
    }
    
    const domainInput = domainItem.querySelector('.domain-edit-input');
    const usernameInput = domainItem.querySelector('[data-field="usernameSelector"]');
    const passwordInput = domainItem.querySelector('[data-field="passwordSelector"]');
    const autoSortCheckbox = domainItem.querySelector('[data-field="autoSortRecent"]');
    
    if (!domainInput || !usernameInput || !passwordInput || !autoSortCheckbox) {
      console.error('SelectorPass: Required form elements not found');
      return;
    }
    
    const newDomain = domainInput.value.trim();
    const newUsernameSelector = usernameInput.value.trim();
    const newPasswordSelector = passwordInput.value.trim();
    const autoSortRecent = autoSortCheckbox.checked;
    
    if (!newDomain || !newUsernameSelector || !newPasswordSelector) {
      showAlertDialog('All fields are required');
      return;
    }
    
    if (!isValidDomain(newDomain)) {
      showAlertDialog('Please enter a valid domain name');
      return;
    }
    
    if (!isValidSelector(newUsernameSelector) || !isValidSelector(newPasswordSelector)) {
      showAlertDialog('Please enter valid CSS selectors');
      return;
    }
    
    const domains = await loadData();
    
    if (newDomain !== oldDomain && domains[newDomain]) {
      showAlertDialog('Domain already exists');
      return;
    }
    
    // Update or create domain with new values
    const domainData = {
      usernameSelector: newUsernameSelector.trim(),
      passwordSelector: newPasswordSelector.trim(),
      autoSortRecent: autoSortRecent,
      credentials: domains[oldDomain]?.credentials || []
    };
    
    if (newDomain !== oldDomain) {
      domains[newDomain] = domainData;
      delete domains[oldDomain];
    } else {
      domains[oldDomain] = domainData;
    }
    
    await saveData(domains);
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error saving domain edit:', error);
    showConfirmDialog('Error saving changes. Please try again.', () => {});
  }
}

function cancelDomainEdit(domain) {
  try {
    const domainItem = document.querySelector(`[data-domain="${domain}"]`)?.closest('.domain-item');
    if (!domainItem) {
      console.error('SelectorPass: Domain item not found for cancel');
      return;
    }
    
    const domainSpan = domainItem.querySelector('.domain-name');
    const domainInput = domainSpan?.nextElementSibling;
    const selectorDisplay = domainItem.querySelector('.selector-display');
    const selectorEdit = domainItem.querySelector('.selector-edit');
    const editBtn = domainItem.querySelector('[data-action="edit-domain"]');
    const saveBtn = domainItem.querySelector('[data-action="save-domain"]');
    const cancelBtn = domainItem.querySelector('[data-action="cancel-edit"]');
    
    if (!domainSpan || !domainInput || !selectorDisplay || !selectorEdit || !editBtn || !saveBtn || !cancelBtn) {
      console.error('SelectorPass: Required elements not found for cancel');
      return;
    }
    
    // Reset domain input
    domainInput.value = domain;
    
    // Hide edit mode for domain
    domainSpan.style.display = 'inline-block';
    domainInput.style.display = 'none';
    
    // Hide edit mode for selectors
    selectorDisplay.style.display = 'block';
    selectorEdit.style.display = 'none';
    
    // Switch buttons back
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
  } catch (error) {
    console.error('SelectorPass: Error canceling domain edit:', error);
  }
}

function editCredential(domain, index) {
  try {
    const credentialItem = document.querySelector(`[data-domain="${domain}"][data-index="${index}"]`)?.closest('.credential-item');
    if (!credentialItem) {
      console.error('SelectorPass: Credential item not found for editing');
      return;
    }
    
    const display = credentialItem.querySelector('.credential-display');
    const edit = credentialItem.querySelector('.credential-edit');
    const usernameInput = edit?.querySelector('.cred-username-input');
    
    if (!display || !edit || !usernameInput) {
      console.error('SelectorPass: Required elements not found for credential editing');
      return;
    }
    
    display.style.display = 'none';
    edit.style.display = 'flex';
    usernameInput.focus();
  } catch (error) {
    console.error('SelectorPass: Error editing credential:', error);
  }
}

async function saveCredential(domain, index) {
  try {
    const credentialItem = document.querySelector(`[data-domain="${domain}"][data-index="${index}"]`)?.closest('.credential-item');
    if (!credentialItem) {
      console.error('SelectorPass: Credential item not found');
      return;
    }
    
    const usernameInput = credentialItem.querySelector('.cred-username-input');
    const passwordInput = credentialItem.querySelector('.cred-password-input');
    
    if (!usernameInput || !passwordInput) {
      console.error('SelectorPass: Credential input fields not found');
      return;
    }
    
    const newUsername = usernameInput.value.trim();
    const newPassword = passwordInput.value.trim();
    
    if (!newUsername || !newPassword) {
      showAlertDialog('Username and password are required');
      return;
    }
    
    if (newUsername.length > 100 || newPassword.length > 100) {
      showAlertDialog('Username and password must be less than 100 characters');
      return;
    }
    
    const domains = await loadData();
    
    if (!domains[domain] || !domains[domain].credentials || !domains[domain].credentials[index]) {
      console.error('SelectorPass: Invalid domain or credential index');
      return;
    }
    
    const originalCredential = domains[domain].credentials[index];
    let credentialToSave = {
      username: newUsername.trim(),
      password: newPassword.trim()
    };
    
    // If original credential was encrypted, keep it encrypted
    if (originalCredential.encrypted) {
      // If master password not in memory, prompt for it
      if (!(await isMasterPasswordSet())) {
        const masterPassword = await promptForMasterPassword();
        if (!masterPassword) {
          return; // User cancelled
        }
        
        const isValid = await verifyMasterPassword(masterPassword);
        if (!isValid) {
          showAlertDialog('Incorrect master password');
          return;
        }
        
        await setMasterPassword(masterPassword, 'browser');
      }
      
      try {
        credentialToSave = await encryptCredential(credentialToSave);
      } catch (error) {
        console.error('SelectorPass: Error encrypting credential:', error);
        showAlertDialog('Error encrypting credential. Please try again.');
        return;
      }
    }
    
    domains[domain].credentials[index] = credentialToSave;
    
    await saveData(domains);
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error saving credential:', error);
    showConfirmDialog('Error saving credential. Please try again.', () => {});
  }
}

function cancelCredential(domain, index) {
  try {
    const credentialItem = document.querySelector(`[data-domain="${domain}"][data-index="${index}"]`)?.closest('.credential-item');
    if (!credentialItem) {
      console.error('SelectorPass: Credential item not found for cancel');
      return;
    }
    
    const display = credentialItem.querySelector('.credential-display');
    const edit = credentialItem.querySelector('.credential-edit');
    
    if (!display || !edit) {
      console.error('SelectorPass: Required elements not found for credential cancel');
      return;
    }
    
    display.style.display = 'flex';
    edit.style.display = 'none';
  } catch (error) {
    console.error('SelectorPass: Error canceling credential edit:', error);
  }
}

function togglePassword(domain, index) {
  try {
    const credentialItem = document.querySelector(`[data-domain="${domain}"][data-index="${index}"]`)?.closest('.credential-item');
    if (!credentialItem) {
      console.error('SelectorPass: Credential item not found for password toggle');
      return;
    }
    
    const passwordInput = credentialItem.querySelector('.cred-password-input');
    const toggleBtn = credentialItem.querySelector('.show-password-btn');
    
    if (!passwordInput || !toggleBtn) {
      console.error('SelectorPass: Password elements not found for toggle');
      return;
    }
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.textContent = '🙈';
    } else {
      passwordInput.type = 'password';
      toggleBtn.textContent = '👁️';
    }
  } catch (error) {
    console.error('SelectorPass: Error toggling password visibility:', error);
  }
}

function setupDragAndDrop(container) {
  let draggedItem = null;
  let draggedIndex = null;
  let draggedDomain = null;
  
  container.addEventListener('dragstart', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      draggedItem = credentialItem;
      draggedIndex = parseInt(credentialItem.dataset.index);
      draggedDomain = credentialItem.dataset.domain;
      credentialItem.style.opacity = '0.5';

    }
  });
  
  container.addEventListener('dragend', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      credentialItem.style.opacity = '1';
      draggedItem = null;
      draggedIndex = null;
      draggedDomain = null;
    }
  });
  
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem && credentialItem !== draggedItem) {
      credentialItem.style.borderTop = '2px solid #007bff';
    }
  });
  
  container.addEventListener('dragleave', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      credentialItem.style.borderTop = '';
    }
  });
  
  container.addEventListener('drop', async (e) => {
    e.preventDefault();
    
    // Clear all border indicators
    container.querySelectorAll('.credential-item').forEach(item => {
      item.style.borderTop = '';
    });
    
    const dropTarget = e.target.closest('.credential-item');
    if (!dropTarget || !draggedItem || dropTarget === draggedItem) {

      return;
    }
    
    const targetIndex = parseInt(dropTarget.dataset.index);
    const targetDomain = dropTarget.dataset.domain;
    
    // Only allow reordering within the same domain
    if (draggedDomain !== targetDomain) {

      return;
    }
    

    
    if (draggedIndex !== targetIndex) {
      await reorderCredentials(draggedDomain, draggedIndex, targetIndex);
    }
  });
}

async function reorderCredentials(domain, fromIndex, toIndex) {
  try {
    const domains = await loadData();
    
    if (!domains[domain] || !domains[domain].credentials) {
      console.error('SelectorPass: Invalid domain for reordering');
      return;
    }
    
    const credentials = domains[domain].credentials;
    
    if (fromIndex < 0 || fromIndex >= credentials.length || toIndex < 0 || toIndex >= credentials.length) {
      console.error('SelectorPass: Invalid indices for reordering');
      return;
    }
    
    // Remove item from original position
    const [movedItem] = credentials.splice(fromIndex, 1);
    
    // Insert at new position
    credentials.splice(toIndex, 0, movedItem);
    
    await saveData(domains);
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error reordering credentials:', error);
  }
}

async function deleteDomain(domain) {
  try {
    showConfirmDialog(
      `Delete domain ${domain} and all its credentials?`,
      async () => {
        try {
          const domains = await loadData();
          delete domains[domain];
          await saveData(domains);
          await loadAndDisplayDomains();
        } catch (error) {
          console.error('SelectorPass: Error deleting domain:', error);
          showConfirmDialog('Error deleting domain. Please try again.', () => {});
        }
      }
    );
  } catch (error) {
    console.error('SelectorPass: Error in deleteDomain:', error);
  }
}

// ============================================================================
// SECURITY SECTION
// ============================================================================

/**
 * Setup security section UI and state
 */
async function setupSecuritySection() {
  try {
    await updateSecurityUI();
  } catch (error) {
    console.error('SelectorPass: Error setting up security section:', error);
  }
}

/**
 * Setup security event listeners
 */
function setupSecurityEventListeners() {
  try {
    const setupMasterPasswordBtn = document.getElementById('setupMasterPasswordBtn');
    if (setupMasterPasswordBtn) {
      setupMasterPasswordBtn.addEventListener('click', () => {
        document.getElementById('setupMasterPasswordSection').style.display = 'none';
        document.getElementById('masterPasswordSection').style.display = 'block';
        document.getElementById('masterPassword').focus();
      });
    }
    

    
    const changeMasterPasswordBtn = document.getElementById('changeMasterPasswordBtn');
    if (changeMasterPasswordBtn) {
      changeMasterPasswordBtn.addEventListener('click', handleChangePassword);
    }
    
    const setMasterPasswordBtn = document.getElementById('setMasterPasswordBtn');
    if (setMasterPasswordBtn) {
      setMasterPasswordBtn.addEventListener('click', handleSetMasterPassword);
    }
    

    

    

    
    const encryptAllBtn = document.getElementById('encryptAllBtn');
    if (encryptAllBtn) {
      encryptAllBtn.addEventListener('click', handleEncryptAll);
    }
    

  } catch (error) {
    console.error('SelectorPass: Error setting up security event listeners:', error);
  }
}

/**
 * Update security UI based on current state
 */
async function updateSecurityUI() {
  try {
    const settings = await getSecuritySettings();
    const isLoggedIn = await isMasterPasswordSet();
    
    const setupSection = document.getElementById('setupMasterPasswordSection');
    const existingSection = document.getElementById('existingMasterPasswordSection');
    const statusText = document.getElementById('statusText');
    const masterPasswordSection = document.getElementById('masterPasswordSection');
    const unlockSection = document.getElementById('unlockSection');
    const encryptedSection = document.getElementById('encryptedSection');
    
    // Update login status indicator
    if (statusText) {
      if (isLoggedIn) {
        statusText.textContent = '🔓 Logged in';
        statusText.className = 'status-indicator logged-in';
      } else {
        statusText.textContent = '🚫 Logged out';
        statusText.className = 'status-indicator logged-out';
      }
    }
    
    // Show appropriate sections based on master password state
    if (settings.masterPasswordSet) {
      if (setupSection) setupSection.style.display = 'none';
      if (existingSection) existingSection.style.display = 'block';
      if (encryptedSection) encryptedSection.style.display = 'block';
    } else {
      if (setupSection) setupSection.style.display = 'block';
      if (existingSection) existingSection.style.display = 'none';
      if (encryptedSection) encryptedSection.style.display = 'none';
    }

  } catch (error) {
    console.error('SelectorPass: Error updating security UI:', error);
  }
}

function showSection(element) {
  if (element) element.style.display = 'block';
}

function hideSection(element) {
  if (element) element.style.display = 'none';
}



/**
 * Handle setting master password
 */
async function handleSetMasterPassword() {
  try {
    const masterPassword = document.getElementById('masterPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    
    if (!masterPassword || !confirmPassword) return;
    
    const password = masterPassword.value.trim();
    const confirm = confirmPassword.value.trim();
    
    if (!password) {
      showAlertDialog('Please enter a master password');
      return;
    }
    
    if (password.length < 8) {
      showAlertDialog('Master password must be at least 8 characters');
      return;
    }
    
    if (password !== confirm) {
      showAlertDialog('Passwords do not match');
      return;
    }
    
    // Set master password hash
    await setMasterPasswordHash(password);
    await setMasterPassword(password, 'browser');
    
    // Clear form and hide setup section
    masterPassword.value = '';
    confirmPassword.value = '';
    document.getElementById('masterPasswordSection').style.display = 'none';
    
    await updateSecurityUI();
    showAlertDialog('Master password set successfully!');
  } catch (error) {
    console.error('SelectorPass: Error setting master password:', error);
    showAlertDialog('Error setting master password. Please try again.');
  }
}







/**
 * Handle encrypt all credentials
 */
async function handleEncryptAll() {
  try {
    if (!await isMasterPasswordSet()) {
      showAlertDialog('Master password not available. Please unlock first.');
      return;
    }
    
    showConfirmDialog(
      'Encrypt all existing credentials? This cannot be undone.',
      async () => {
        try {
          await encryptAllCredentials(masterKey);
          await updateSecurityUI();
          await loadAndDisplayDomains();
          showAlertDialog('All credentials encrypted successfully!');
        } catch (error) {
          console.error('SelectorPass: Error encrypting all credentials:', error);
          showAlertDialog('Error encrypting credentials. Please try again.');
        }
      }
    );
  } catch (error) {
    console.error('SelectorPass: Error handling encrypt all:', error);
  }
}

/**
 * Handle change master password
 */
async function handleChangePassword() {
  try {
    const newMasterPassword = await promptForNewMasterPassword();
    if (!newMasterPassword) {
      return; // User cancelled
    }
    
    if (newMasterPassword.length < 8) {
      showAlertDialog('Master password must be at least 8 characters');
      return;
    }
    
    // Re-encrypt all existing encrypted credentials with new password
    await reencryptAllCredentials(newMasterPassword);
    
    // Update master password hash
    await setMasterPasswordHash(newMasterPassword);
    await setMasterPassword(newMasterPassword);
    
    await updateSecurityUI();
    showAlertDialog('Master password changed successfully!');
  } catch (error) {
    console.error('SelectorPass: Error changing master password:', error);
    showAlertDialog('Error changing master password. Please try again.');
  }
}

/**
 * Setup dynamic tooltip positioning
 */
function setupTooltip(button) {
  const tooltip = button.querySelector('.tooltip-text');
  if (!tooltip) return;
  
  button.addEventListener('mouseenter', () => {
    const rect = button.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 10}px`;
    tooltip.style.transform = 'translate(-50%, -100%)';
    tooltip.classList.add('show');
  });
  
  button.addEventListener('mouseleave', () => {
    tooltip.classList.remove('show');
  });
}

/**
 * Encrypt a single credential
 */
async function encryptSingleCredential(domain, index) {
  try {
    const settings = await getSecuritySettings();
    if (!settings.masterPasswordSet) {
      // First time encryption - set up master password
      const newMasterPassword = await promptForMasterPasswordSetup();
      if (!newMasterPassword) {
        return; // User cancelled
      }
      
      if (newMasterPassword.length < 8) {
        showAlertDialog('Master password must be at least 8 characters');
        return;
      }
      
      await setMasterPasswordHash(newMasterPassword);
      await setMasterPassword(newMasterPassword);
    }
    
    // Check if master password is available
    const isLoggedIn = await isMasterPasswordSet();
    console.log('SelectorPass: Encrypt check - logged in:', isLoggedIn);
    if (!isLoggedIn) {
      showAlertDialog('Please login first to encrypt credentials.');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = await showConfirmationDialog('Encrypt this credential?');
    if (!confirmed) {
      return;
    }
    
    const domains = await loadData();
    const credential = domains[domain]?.credentials[index];
    
    if (!credential || credential.encrypted) {
      return; // Already encrypted or doesn't exist
    }
    
    // Encrypt the credential
    const encryptedCredential = await encryptCredential(credential);
    domains[domain].credentials[index] = encryptedCredential;
    
    await saveData(domains);
    await loadAndDisplayDomains();
    await updateSecurityUI();
  } catch (error) {
    console.error('SelectorPass: Error encrypting credential:', error);
    showAlertDialog('Error encrypting credential. Please try again.');
  }
}

/**
 * Decrypt a single credential
 */
async function decryptSingleCredential(domain, index) {
  try {
    // Check if master password is available
    if (!await isMasterPasswordSet()) {
      showAlertDialog('Please login first to remove encryption.');
      return;
    }
    
    // Show confirmation dialog
    const confirmed = await showConfirmationDialog('Remove encryption from this credential?');
    if (!confirmed) {
      return;
    }
    
    const domains = await loadData();
    const credential = domains[domain]?.credentials[index];
    
    if (!credential || !credential.encrypted) {
      return; // Not encrypted or doesn't exist
    }
    
    // Decrypt the credential
    const decryptedCredential = await decryptCredential(credential);
    domains[domain].credentials[index] = decryptedCredential;
    
    await saveData(domains);
    await loadAndDisplayDomains();
    await updateSecurityUI();
  } catch (error) {
    console.error('SelectorPass: Error decrypting credential:', error);
    showAlertDialog('Error decrypting credential. Please try again.');
  }
}

/**
 * Check if there are any unencrypted credentials
 */
async function checkForUnencryptedCredentials() {
  try {
    const domains = await loadData();
    
    for (const config of Object.values(domains)) {
      if (config.credentials) {
        for (const cred of config.credentials) {
          if (!cred.encrypted) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('SelectorPass: Error checking for unencrypted credentials:', error);
    return false;
  }
}

/**
 * Check login status and update UI accordingly
 */
async function checkLoginStatus() {
  try {
    const isLoggedIn = await isMasterPasswordSet();
    if (isLoggedIn) {
      await updateSecurityUI();
    }
  } catch (error) {
    // Silent error handling
  }
}
/**
 * Decrypt credential for editing if logged in
 * @param {Object} credential - Encrypted credential
 * @returns {Promise<Object|null>} Decrypted credential or null
 */
async function decryptCredentialForEdit(credential) {
  try {
    if (!credential.encrypted) {
      return credential;
    }
    
    const isLoggedIn = await isMasterPasswordSet();
    if (!isLoggedIn) {
      return null;
    }
    
    return await decryptCredential(credential);
  } catch (error) {
    return null;
  }
}
/**
 * Setup connection to background script for login status updates
 */
function setupLoginStatusConnection() {
  const port = chrome.runtime.connect({ name: 'loginStatus' });
  port.onMessage.addListener((message) => {
    if (message.action === 'loginStatusChanged') {
      updateSecurityUI();
    }
  });
}

})();