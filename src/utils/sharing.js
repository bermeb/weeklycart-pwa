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
  return 'share' in navigator
}

export const shareViaWebShare = async (listData, isSingleList = false) => {
  if (!isWebShareSupported()) {
    throw new Error('Web Share API not supported')
  }

  const shareUrl = generateShareUrl(listData)
  const listName = isSingleList ? listData.list.name : 'Einkaufslisten'
  
  try {
    await navigator.share({
      title: `${listName} - WeeklyCart`,
      text: `Hier ist meine Einkaufsliste: ${listName}`,
      url: shareUrl
    })
    return true
  } catch (error) {
    if (error.name === 'AbortError') {
      return false // User cancelled
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

// QR Code generation (using QR Server API)
export const generateQRCode = async (listData) => {
  const isOnline = await checkNetworkConnectivity()
  if (!isOnline) {
    throw new Error('Internet connection required for QR code generation')
  }
  
  const shareUrl = generateShareUrl(listData)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${VALIDATION_LIMITS.QR_CODE_SIZE}&data=${encodeURIComponent(shareUrl)}`
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