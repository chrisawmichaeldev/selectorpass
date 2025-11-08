/**
 * SelectorPass Options Page Script
 * Handles the extension settings interface for domain configuration and credential management
 */

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
    await loadAndDisplayDomains();
    
    // Handle URL parameters for domain pre-population
    handleUrlParameters();
    
    // Re-enable transitions after a brief delay
    setTimeout(() => {
      document.body.classList.remove('no-transition');
    }, 50);
  } catch (error) {
    console.error('SelectorPass: Error initializing options page:', error);
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
    console.error('SelectorPass: Error handling URL parameters:', error);
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
    console.error('SelectorPass: Error loading data:', error);
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
    console.error('SelectorPass: Error saving data:', error);
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
    } else {
      console.error('SelectorPass: Save Domain button not found!');
    }
    
    // Setup collapsible sections
    const addDomainHeader = document.getElementById('addDomainHeader');
    if (addDomainHeader) {
      addDomainHeader.addEventListener('click', toggleAddDomainSection);
    }
    
    const manageDomainsHeader = document.getElementById('manageDomainsHeader');
    if (manageDomainsHeader) {
      manageDomainsHeader.addEventListener('click', toggleManageDomainsSection);
    }
    
    // Setup Buy Me a Coffee button
    const buyCoffeeBtn = document.getElementById('buy-coffee');
    if (buyCoffeeBtn) {
      buyCoffeeBtn.addEventListener('click', () => {
        try {
          // amazonq-ignore-next-line
          chrome.tabs.create({ url: 'https://buymeacoffee.com/cawmdev' });
        } catch (error) {
          console.error('SelectorPass: Error opening donation page:', error);
        }
      });
    }
  } catch (error) {
    console.error('SelectorPass: Error setting up event listeners:', error);
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
    // amazonq-ignore-next-line
    const section = document.querySelector('.collapsible');
    if (!section) {
      console.error('SelectorPass: Collapsible section not found');
      return;
    }
    
    section.classList.toggle('expanded');
    
    // Save the current state
    const isExpanded = section.classList.contains('expanded');
    await chrome.storage.local.set({ addDomainExpanded: isExpanded });
  } catch (error) {
    console.error('SelectorPass: Error toggling add domain section:', error);
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
// amazonq-ignore-next-line
async function restoreAddDomainState() {
  try {
    const result = await chrome.storage.local.get(['addDomainExpanded', 'manageDomainsExpanded']);
    const addDomainExpanded = result.addDomainExpanded || false;
    const manageDomainsExpanded = result.manageDomainsExpanded !== false;
    
    const addDomainSection = document.getElementById('addDomainHeader')?.closest('.section');
    if (addDomainExpanded && addDomainSection) {
      addDomainSection.classList.add('expanded');
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
    
    // amazonq-ignore-next-line
    const domainItem = document.querySelector(`[data-domain="${domain}"].domain-collapsible`);
    
    // amazonq-ignore-next-line
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
  ['toggle-password', (domain, button) => togglePassword(domain, parseInt(button.dataset.index))]
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
        // amazonq-ignore-next-line
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
  // amazonq-ignore-next-line
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

/**
 * Validate CSS selector input
 * @param {string} selector - CSS selector to validate
 * @returns {boolean} True if valid
 */
// amazonq-ignore-next-line
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
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
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
    // amazonq-ignore-next-line
    container.addEventListener('click', handleButtonClick);
    
    // Add drag and drop listeners
    setupDragAndDrop(container);
    
    // Restore domain collapse states
    await restoreDomainStates();
  } catch (error) {
    console.error('SelectorPass: Error displaying domains:', error);
  }
}

// amazonq-ignore-next-line
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
  // amazonq-ignore-next-line
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
  // amazonq-ignore-next-line
  usernameLine.textContent = `Username selector: ${config.usernameSelector.trim()}`;
  const passwordLine = document.createElement('div');
  // amazonq-ignore-next-line
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
  const edit = createSelectorEditForm(config);
  
  selectorInfo.appendChild(display);
  selectorInfo.appendChild(edit);
  
  return selectorInfo;
}

function createSelectorEditForm(config) {
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
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  usernameInput.value = config.usernameSelector.trim();
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
  // amazonq-ignore-next-line
  passwordInput.value = config.passwordSelector.trim();
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
  // amazonq-ignore-next-line
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
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  username.textContent = cred.username.trim();
  
  const buttons = document.createElement('div');
  buttons.className = 'credential-buttons';
  
  const editBtn = createButton('Edit', 'edit-btn', { domain, index, action: 'edit-credential' });
  const deleteBtn = createButton('Delete', 'delete-btn', { domain, index, action: 'delete-credential' });
  
  buttons.appendChild(editBtn);
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
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.className = 'cred-username-input';
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  usernameInput.value = cred.username.trim();
  usernameInput.placeholder = 'Username';
  
  const passwordField = document.createElement('div');
  passwordField.className = 'password-field';
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.className = 'cred-password-input';
  // amazonq-ignore-next-line
  passwordInput.value = cred.password.trim();
  passwordInput.placeholder = 'Password';
  
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
  
  edit.appendChild(usernameInput);
  edit.appendChild(passwordField);
  edit.appendChild(buttons);
  
  return edit;
}

function createCredentialForm(domain) {
  const form = document.createElement('div');
  form.className = 'credential-form';
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  // amazonq-ignore-next-line
  usernameInput.placeholder = 'Username';
  usernameInput.id = `username-${domain}`;
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordInput.id = `password-${domain}`;
  
  const addBtn = createButton('Add', 'add-credential-btn', { domain, action: 'add-credential' });
  
  form.appendChild(usernameInput);
  form.appendChild(passwordInput);
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
    
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
    domains[domain].credentials.push({ 
      // amazonq-ignore-next-line
      username: username, 
      password: password 
    });
    
    await saveData(domains);
    
    // Clear inputs
    usernameInput.value = '';
    passwordInput.value = '';
    
    // amazonq-ignore-next-line
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error adding credential:', error);
    showConfirmDialog('Error adding credential. Please try again.', () => {});
  }
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

async function deleteCredential(domain, index) {
  try {
    const domains = await loadData();
    
    // amazonq-ignore-next-line
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
    
    // amazonq-ignore-next-line
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
      // amazonq-ignore-next-line
      usernameSelector: newUsernameSelector.trim(),
      passwordSelector: newPasswordSelector.trim(),
      autoSortRecent: autoSortRecent,
      credentials: domains[oldDomain]?.credentials || []
    };
    
    if (newDomain !== oldDomain) {
      domains[newDomain] = domainData;
      // amazonq-ignore-next-line
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
    
    // amazonq-ignore-next-line
    // amazonq-ignore-next-line
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

// amazonq-ignore-next-line
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
    
    domains[domain].credentials[index] = {
      // amazonq-ignore-next-line
      // amazonq-ignore-next-line
      // amazonq-ignore-next-line
      username: newUsername.trim(),
      password: newPassword.trim()
    };
    
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
    
    // amazonq-ignore-next-line
    display.style.display = 'flex';
    edit.style.display = 'none';
  } catch (error) {
    console.error('SelectorPass: Error canceling credential edit:', error);
  }
}

// amazonq-ignore-next-line
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
  
  // amazonq-ignore-next-line
  container.addEventListener('dragstart', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      draggedItem = credentialItem;
      draggedIndex = parseInt(credentialItem.dataset.index);
      draggedDomain = credentialItem.dataset.domain;
      credentialItem.style.opacity = '0.5';

    }
  });
  
  // amazonq-ignore-next-line
  container.addEventListener('dragend', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      credentialItem.style.opacity = '1';
      draggedItem = null;
      draggedIndex = null;
      draggedDomain = null;
    }
  });
  
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem && credentialItem !== draggedItem) {
      credentialItem.style.borderTop = '2px solid #007bff';
    }
  });
  
  // amazonq-ignore-next-line
  container.addEventListener('dragleave', (e) => {
    const credentialItem = e.target.closest('.credential-item');
    if (credentialItem) {
      credentialItem.style.borderTop = '';
    }
  });
  
  // amazonq-ignore-next-line
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
    // amazonq-ignore-next-line
    await loadAndDisplayDomains();
  } catch (error) {
    console.error('SelectorPass: Error reordering credentials:', error);
  }
}

async function deleteDomain(domain) {
  // amazonq-ignore-next-line
  // amazonq-ignore-next-line
  try {
    showConfirmDialog(
      `Delete domain ${domain} and all its credentials?`,
      // amazonq-ignore-next-line
      async () => {
        try {
          const domains = await loadData();
          // amazonq-ignore-next-line
          delete domains[domain];
          await saveData(domains);
          await loadAndDisplayDomains();
        } catch (error) {
          console.error('SelectorPass: Error deleting domain:', error);
          showConfirmDialog('Error deleting domain. Please try again.', () => {});
        }
      }
    // amazonq-ignore-next-line
    );
  // amazonq-ignore-next-line
  } catch (error) {
    console.error('SelectorPass: Error in deleteDomain:', error);
  }
}