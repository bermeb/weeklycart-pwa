import { validateUrlImport, VALIDATION_LIMITS, checkNetworkConnectivity } from './validation.js'

// URL-based sharing utilities
export const encodeListData = (listData) => {
  const jsonString = JSON.stringify(listData)
  return btoa(encodeURIComponent(jsonString))
}

export const decodeListData = (encodedData) => {
  const validation = validateUrlImport(encodedData)
  if (!validation.isValid) {
    throw new Error(validation.error)
  }
  
  try {
    const jsonString = decodeURIComponent(atob(encodedData))
    return JSON.parse(jsonString)
  } catch {
    throw new Error('Invalid share link format')
  }
}

export const generateShareUrl = (listData) => {
  const encodedData = encodeListData(listData)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?import=${encodedData}`
}

// Web Share API utilities
export const isWebShareSupported = () => {
  return 'share' in navigator && typeof navigator.share === 'function'
}

export const shareViaWebShare = async (listData, isSingleList = false) => {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API not supported')
  }

  const shareUrl = generateShareUrl(listData)
  const listName = isSingleList ? listData.list.name : 'Einkaufslisten'
  
  // Check if the URL is too long for sharing
  if (shareUrl.length > VALIDATION_LIMITS.MAX_URL_LENGTH) {
    throw new Error('Share too large')
  }
  
  const shareData = {
    title: `${listName} - WeeklyCart`,
    text: `Hier ist meine Einkaufsliste: ${listName}`,
    url: shareUrl
  }
  
  // Check if the data can be shared before attempting
  if (navigator.canShare && !navigator.canShare(shareData)) {
    throw new Error('Share data not supported')
  }
  
  try {
    await navigator.share(shareData)
    return true
  } catch (error) {
    if (error.name === 'AbortError') {
      return false // User cancelled
    }
    if (error.name === 'NotAllowedError') {
      throw new Error('Permission denied')
    }
    throw error
  }
}

// Clipboard sharing
export const copyShareUrl = async (listData) => {
  const shareUrl = generateShareUrl(listData)
  
  try {
    await navigator.clipboard.writeText(shareUrl)
    return shareUrl
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = shareUrl
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return shareUrl
  }
}

// QR Code generation with data compression
export const generateQRCode = async (listData) => {
  const isOnline = await checkNetworkConnectivity()
  if (!isOnline) {
    throw new Error('Internet connection required for QR code generation')
  }
  
  const shareUrl = generateShareUrl(listData)
  
  // Check if URL is too long for QR codes
  if (shareUrl.length > VALIDATION_LIMITS.QR_URL_LIMIT) {
    throw new Error('Share too large')
  }
  
  const qrServiceUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${VALIDATION_LIMITS.QR_CODE_SIZE}&data=${encodeURIComponent(shareUrl)}`
  
  // Test if QR service is reachable
  try {
    await fetch(qrServiceUrl, { method: 'HEAD', mode: 'no-cors' })
    return qrServiceUrl
  } catch {
    throw new Error('QR code service unavailable')
  }
}

// Create compressed share data for large lists
export const createCompressedShareData = (listData) => {
  // For very large datasets, only include essential data
  if (listData.lists) {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      lists: listData.lists.map(list => ({
        name: list.name.substring(0, 50), // Limit name length
        items: list.items.slice(0, 20).map(item => ({ // Limit items count
          name: item.name.substring(0, 30),
          amount: item.amount.substring(0, 10)
        }))
      }))
    }
  } else if (listData.list) {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      list: {
        name: listData.list.name.substring(0, 50),
        items: listData.list.items.slice(0, 50).map(item => ({
          name: item.name.substring(0, 30),
          amount: item.amount.substring(0, 10)
        }))
      }
    }
  }
  return listData
}

// Text-based sharing for messaging apps
export const generateShareText = (listData, isSingleList = false) => {
  const shareUrl = generateShareUrl(listData)
  
  if (isSingleList) {
    const list = listData.list
    let text = `🛒 ${list.name}\n\n`
    
    list.items.forEach(item => {
      text += `• ${item.name}`
      if (item.amount && item.amount !== '1 Stück') {
        text += ` (${item.amount})`
      }
      text += '\n'
    })
    
    text += `\nLink zum Importieren: ${shareUrl}`
    return text
  } else {
    const lists = listData.lists
    let text = `Einkaufslisten (${lists.length})\n\n`
    
    lists.forEach(list => {
      text += `📋 ${list.name} (${list.items.length} Artikel)\n`
    })
    
    text += `\nLink zum Importieren: ${shareUrl}`
    return text
  }
}