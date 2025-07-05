/**
 * Validation and sanitization utilities for WeeklyCart
 */

// Configuration constants
export const VALIDATION_LIMITS = {
  MAX_URL_LENGTH: 8192, // Maximum URL length for most browsers
  MAX_IMPORT_SIZE: 1024 * 1024, // 1MB max import size
  MAX_LISTS_COUNT: 100,
  MAX_ITEMS_PER_LIST: 500,
  MAX_STRING_LENGTH: 1000,
  QR_CODE_SIZE: '200x200'
}

/**
 * Validates input length before processing
 * @param {string} input - The string to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export const validateInputLength = (input, maxLength = VALIDATION_LIMITS.MAX_STRING_LENGTH) => {
  if (typeof input !== 'string') {
    return { isValid: false, error: 'Input must be a string' }
  }
  
  if (input.length > maxLength) {
    return { isValid: false, error: `Input exceeds maximum length of ${maxLength} characters` }
  }
  
  return { isValid: true }
}

/**
 * Sanitizes and validates a string input
 * @param {string} input - The string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
export const sanitizeString = (input, maxLength = VALIDATION_LIMITS.MAX_STRING_LENGTH) => {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Validate length first
  const lengthValidation = validateInputLength(input, maxLength)
  if (!lengthValidation.isValid) {
    console.warn('Input length validation failed:', lengthValidation.error)
  }
  
  // Remove HTML tags and limit length
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
    .trim()
    .slice(0, maxLength)
}

/**
 * Validates URL parameters for safe processing
 * @param {string} urlParam - The URL parameter to validate
 * @returns {{isValid: boolean, error?: string, data?: any}} Validation result
 */
export const validateUrlImport = (urlParam) => {
  // Check URL length
  if (!urlParam || urlParam.length > VALIDATION_LIMITS.MAX_URL_LENGTH) {
    return {
      isValid: false,
      error: 'Import link is too long or empty'
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /<script/i,
    /eval\(/i,
    /expression\(/i
  ]

  if (suspiciousPatterns.some(pattern => pattern.test(urlParam))) {
    return {
      isValid: false,
      error: 'Invalid import link format'
    }
  }

  try {
    // Validate base64 encoding
    const decoded = atob(urlParam)
    
    // Check decoded size
    if (decoded.length > VALIDATION_LIMITS.MAX_IMPORT_SIZE) {
      return {
        isValid: false,
        error: 'Import data is too large'
      }
    }

    // Validate JSON structure
    const data = JSON.parse(decodeURIComponent(decoded))
    
    return validateImportData(data)
  } catch {
    return {
      isValid: false,
      error: 'Invalid import link format'
    }
  }
}

/**
 * Validates imported data structure and content
 * @param {any} data - The data to validate
 * @returns {{isValid: boolean, error?: string}} Validation result
 */
export const validateImportData = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid data format' }
  }

  if (!data.version) {
    return { isValid: false, error: 'Missing version information' }
  }

  let listsToValidate = []

  // Handle both single list and multiple lists format
  if (data.lists && Array.isArray(data.lists)) {
    listsToValidate = data.lists
  } else if (data.list && typeof data.list === 'object') {
    listsToValidate = [data.list]
  } else {
    return { isValid: false, error: 'No valid list data found' }
  }

  // Check limits
  if (listsToValidate.length > VALIDATION_LIMITS.MAX_LISTS_COUNT) {
    return {
      isValid: false,
      error: `Too many lists (max ${VALIDATION_LIMITS.MAX_LISTS_COUNT})`
    }
  }

  // Validate each list
  for (const list of listsToValidate) {
    if (!list.name || typeof list.name !== 'string') {
      return { isValid: false, error: 'Invalid list name' }
    }

    if (!Array.isArray(list.items)) {
      return { isValid: false, error: 'Invalid list items structure' }
    }

    if (list.items.length > VALIDATION_LIMITS.MAX_ITEMS_PER_LIST) {
      return {
        isValid: false,
        error: `List "${list.name}" has too many items (max ${VALIDATION_LIMITS.MAX_ITEMS_PER_LIST})`
      }
    }

    // Validate each item
    for (const item of list.items) {
      if (!item.name || typeof item.name !== 'string') {
        return { isValid: false, error: 'Invalid item name in list' }
      }

      if (!item.amount || typeof item.amount !== 'string') {
        return { isValid: false, error: 'Invalid item amount in list' }
      }

      // Sanitize strings
      item.name = sanitizeString(item.name, 200)
      item.amount = sanitizeString(item.amount, 50)
    }

    // Sanitize list name
    list.name = sanitizeString(list.name, 100)
  }

  return { isValid: true }
}

/**
 * Checks if localStorage has enough space for new data
 * @param {string} data - The data to be stored
 * @returns {{hasSpace: boolean, error?: string}} Space check result
 */
export const checkStorageSpace = (data) => {
  try {
    const testKey = '__storage_test__'
    const serializedData = JSON.stringify(data)
    
    // Try to store the data temporarily
    localStorage.setItem(testKey, serializedData)
    localStorage.removeItem(testKey)
    
    return { hasSpace: true }
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      return {
        hasSpace: false,
        error: 'Not enough storage space available'
      }
    }
    return {
      hasSpace: false,
      error: 'Storage access error'
    }
  }
}

/**
 * Validates network connectivity for external APIs
 * @returns {Promise<boolean>} True if online, false if offline
 */
export const checkNetworkConnectivity = async () => {
  if (!navigator.onLine) {
    return false
  }

  try {
    // Quick connectivity check with a small request and proper timeout handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    await fetch('https://api.qrserver.com/v1/create-qr-code/?size=1x1&data=test', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return true
  } catch {
    // Handles both network errors and timeout aborts
    return false
  }
}