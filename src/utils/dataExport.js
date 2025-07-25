import { downloadFile, generateTimestampedFilename } from './fileDownload.js'

export const exportListsToJSON = (lists) => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    lists: lists.map(list => ({
      name: list.name,
      items: list.items.map(item => ({
        name: item.name,
        amount: item.amount
      }))
    }))
  }
  
  const jsonString = JSON.stringify(exportData, null, 2)
  const fileName = generateTimestampedFilename('shopping-lists', 'json')
  downloadFile(jsonString, fileName, 'application/json')
}

export const exportListsToText = (lists) => {
  let textContent = `Shopping Lists Export\n`
  textContent += `Exported: ${new Date().toLocaleString()}\n`
  textContent += `${'='.repeat(50)}\n\n`
  
  lists.forEach(list => {
    textContent += `${list.name}\n`
    textContent += `${'-'.repeat(list.name.length)}\n`
    
    list.items.forEach(item => {
      const status = item.completed ? '✓' : '○'
      textContent += `${status} ${item.name}`
      if (item.amount && item.amount !== '1 Stück') {
        textContent += ` (${item.amount})`
      }
      textContent += '\n'
    })
    textContent += '\n'
  })
  
  const fileName = generateTimestampedFilename('shopping-lists', 'txt')
  downloadFile(textContent, fileName, 'text/plain')
}

export const exportSingleListToJSON = (list) => {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    list: {
      name: list.name,
      items: list.items.map(item => ({
        name: item.name,
        amount: item.amount
      }))
    }
  }
  
  const jsonString = JSON.stringify(exportData, null, 2)
  const fileName = generateTimestampedFilename(`list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}`, 'json')
  downloadFile(jsonString, fileName, 'application/json')
}

export const exportSingleListToText = (list) => {
  let textContent = `${list.name}\n`
  textContent += `${'-'.repeat(list.name.length)}\n`
  textContent += `Exported: ${new Date().toLocaleString()}\n\n`
  
  list.items.forEach(item => {
    const status = item.completed ? '✓' : '○'
    textContent += `${status} ${item.name}`
    if (item.amount && item.amount !== '1 Stück') {
      textContent += ` (${item.amount})`
    }
    textContent += '\n'
  })
  
  const fileName = generateTimestampedFilename(`list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}`, 'txt')
  downloadFile(textContent, fileName, 'text/plain')
}

import { validateImportData } from './validation.js'

export const importListsFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)
        const validationResult = validateImportData(jsonData)
        
        if (!validationResult.isValid) {
          reject(new Error(validationResult.error))
          return
        }
        
        resolve(jsonData)
      } catch {
        reject(new Error('Invalid JSON file format'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Error reading file'))
    }
    
    reader.readAsText(file)
  })
}

export const processImportedData = (importedData, currentLists, mergeStrategy = 'append') => {
  const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)
  
  let listsToImport = []
  
  // Handle both single list and multiple lists format
  if (importedData.lists && Array.isArray(importedData.lists)) {
    listsToImport = importedData.lists
  } else if (importedData.list) {
    listsToImport = [importedData.list]
  }
  
  const processedLists = listsToImport.map(list => ({
    id: generateUniqueId(),
    name: list.name,
    items: list.items.map(item => ({
      id: generateUniqueId(),
      name: item.name,
      amount: item.amount,
      checked: false
    }))
  }))
  
  if (mergeStrategy === 'replace') {
    return processedLists
  } else {
    // Append strategy - handle name conflicts
    const existingNames = new Set(currentLists.map(list => list.name))
    
    processedLists.forEach(list => {
      let originalName = list.name
      let counter = 1
      
      while (existingNames.has(list.name)) {
        list.name = `${originalName} (${counter})`
        counter++
      }
      
      existingNames.add(list.name)
    })
    
    return [...currentLists, ...processedLists]
  }
}