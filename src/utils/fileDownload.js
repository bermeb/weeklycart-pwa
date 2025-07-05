/**
 * Optimized file download utility
 * Reduces DOM manipulation and improves performance
 */

/**
 * Creates and triggers a file download
 * @param {string} content - File content
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 */
export const downloadFile = (content, filename, mimeType = 'application/octet-stream') => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  // Create a temporary link element
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Generates a timestamped filename
 * @param {string} baseName - Base name for the file
 * @param {string} extension - File extension
 * @returns {string} Generated filename with timestamp
 */
export const generateTimestampedFilename = (baseName, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `${baseName}-${timestamp}.${extension}`
}