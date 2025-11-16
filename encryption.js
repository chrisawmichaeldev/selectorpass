/**
 * SelectorPass Encryption Module
 * Provides AES-256-GCM encryption for credential storage
 */

(() => {
  'use strict';

// ============================================================================
// ENCRYPTION CORE
// ============================================================================

/**
 * Encrypt data using AES-256-GCM with PBKDF2 key derivation
 * @param {Object} data - Data to encrypt
 * @param {string} masterPassword - Master password for encryption
 * @returns {Promise<Object>} Encrypted data with salt and IV
 */
async function encryptData(data, masterPassword) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // PBKDF2 key derivation
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']
  );
  
  // AES-GCM encryption
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data))
  );
  
  return {
    encrypted: Array.from(new Uint8Array(encrypted)),
    salt: Array.from(salt),
    iv: Array.from(iv)
  };
}

/**
 * Decrypt data using AES-256-GCM
 * @param {Object} encryptedData - Encrypted data with salt and IV
 * @param {string} masterPassword - Master password for decryption
 * @returns {Promise<Object>} Decrypted data
 */
async function decryptData(encryptedData, masterPassword) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  
  // Recreate key from master password
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(masterPassword), 'PBKDF2', false, ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new Uint8Array(encryptedData.salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
  );
  
  // AES-GCM decryption
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(encryptedData.iv) },
    key, new Uint8Array(encryptedData.encrypted)
  );
  
  return JSON.parse(decoder.decode(decrypted));
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Set master password in background script session
 * @param {string} password - Master password
 * @param {string} duration - Session duration
 */
async function setMasterPassword(password, duration = 'browser') {
  try {
    await chrome.runtime.sendMessage({ 
      action: 'setMasterPassword', 
      password, 
      duration 
    });
  } catch (error) {
    console.error('Failed to set master password:', error);
  }
}

/**
 * Clear master password from background script session
 */
async function clearMasterPassword() {
  try {
    await chrome.runtime.sendMessage({ action: 'clearMasterPassword' });
  } catch (error) {
    console.error('Failed to clear master password:', error);
  }
}

/**
 * Check if master password is available in background script
 * @returns {Promise<boolean>} True if master password is set
 */
async function isMasterPasswordSet() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'isMasterPasswordSet' });
    return response?.isSet || false;
  } catch (error) {
    return false;
  }
}

/**
 * Get master password from background script
 * @returns {Promise<string|null>} Master password or null
 */
async function getMasterPassword() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getMasterPassword' });
    return response?.masterPassword || null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// CREDENTIAL ENCRYPTION
// ============================================================================

/**
 * Encrypt a single credential
 * @param {Object} credential - Credential object with username and password
 * @returns {Promise<Object>} Encrypted credential
 */
async function encryptCredential(credential) {
  const masterKey = await getMasterPassword();
  if (!masterKey) {
    throw new Error('Master password not set');
  }
  
  // Only encrypt the password, keep username in plain text
  const encryptedPassword = await encryptData(credential.password, masterKey);
  return {
    username: credential.username,
    password: encryptedPassword,
    encrypted: true
  };
}

/**
 * Decrypt a single credential
 * @param {Object} encryptedCredential - Encrypted credential object
 * @returns {Promise<Object>} Decrypted credential
 */
async function decryptCredential(encryptedCredential) {
  const masterKey = await getMasterPassword();
  if (!masterKey) {
    throw new Error('Master password not set');
  }
  
  // Decrypt only the password, username is already in plain text
  const decryptedPassword = await decryptData(encryptedCredential.password, masterKey);
  return {
    username: encryptedCredential.username,
    password: decryptedPassword
  };
}

/**
 * Decrypt a single credential with provided master password
 * @param {Object} encryptedCredential - Encrypted credential object
 * @param {string} masterPassword - Master password for decryption
 * @returns {Promise<Object>} Decrypted credential
 */
async function decryptCredentialDirectly(encryptedCredential, masterPassword) {
  // Decrypt only the password, username is already in plain text
  const decryptedPassword = await decryptData(encryptedCredential.password, masterPassword);
  return {
    username: encryptedCredential.username,
    password: decryptedPassword
  };
}



// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Get security settings
 * @returns {Promise<Object>} Security settings object
 */
async function getSecuritySettings() {
  const result = await chrome.storage.local.get(['securitySettings']);
  return result.securitySettings || {
    masterPasswordSet: false,
    pbkdf2Iterations: 100000
  };
}

/**
 * Save security settings
 * @param {Object} settings - Security settings to save
 */
async function saveSecuritySettings(settings) {
  await chrome.storage.local.set({ securitySettings: settings });
}

/**
 * Check if encryption is available
 * @returns {Promise<boolean>} True if master password is set
 */
async function isEncryptionEnabled() {
  const settings = await getSecuritySettings();
  return settings.masterPasswordSet;
}

/**
 * Verify master password against stored hash
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} True if password is correct
 */
async function verifyMasterPassword(password) {
  const settings = await getSecuritySettings();
  if (!settings.masterPasswordHash) {
    return false;
  }
  
  // Simple verification - in production, use proper password hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hash === settings.masterPasswordHash;
}

/**
 * Set master password hash
 * 
 * Hashes the master password using SHA-256 and stores it for
 * future verification. Only the hash is stored, never the plaintext.
 * 
 * @param {string} password - Master password to hash and store
 */
async function setMasterPasswordHash(password) {
  // Create SHA-256 hash of the master password
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const settings = await getSecuritySettings();
  settings.masterPasswordHash = hash;
  settings.masterPasswordSet = true;
  await saveSecuritySettings(settings);
}

// ============================================================================
// GLOBAL EXPOSURE
// ============================================================================

// Expose functions to global scope for use by popup and options
window.encryptData = encryptData;
window.decryptData = decryptData;
window.setMasterPassword = setMasterPassword;
window.clearMasterPassword = clearMasterPassword;
window.isMasterPasswordSet = isMasterPasswordSet;
window.getMasterPassword = getMasterPassword;
window.encryptCredential = encryptCredential;
window.decryptCredential = decryptCredential;
window.decryptCredentialDirectly = decryptCredentialDirectly;
window.getSecuritySettings = getSecuritySettings;
window.saveSecuritySettings = saveSecuritySettings;
window.isEncryptionEnabled = isEncryptionEnabled;
window.verifyMasterPassword = verifyMasterPassword;
window.setMasterPasswordHash = setMasterPasswordHash;

})();
