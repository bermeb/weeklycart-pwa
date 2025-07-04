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
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName('shopping-lists', 'json');
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportListsToText = (lists) => {
  let textContent = `Shopping Lists Export\n`;
  textContent += `Exported: ${new Date().toLocaleString()}\n`;
  textContent += `${'='.repeat(50)}\n\n`;
  
  lists.forEach(list => {
    textContent += `${list.name}\n`;
    textContent += `${'-'.repeat(list.name.length)}\n`;
    
    list.items.forEach(item => {
      const status = item.completed ? '✓' : '○';
      textContent += `${status} ${item.name}`;
      if (item.quantity > 1) {
        textContent += ` (${item.quantity})`;
      }
      textContent += '\n';
    });
    textContent += '\n';
  });
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName('shopping-lists', 'txt');
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName(`list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}`, 'json');
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportSingleListToText = (list) => {
  let textContent = `${list.name}\n`;
  textContent += `${'-'.repeat(list.name.length)}\n`;
  textContent += `Exported: ${new Date().toLocaleString()}\n\n`;
  
  list.items.forEach(item => {
    const status = item.completed ? '✓' : '○';
    textContent += `${status} ${item.name}`;
    if (item.quantity > 1) {
      textContent += ` (${item.quantity})`;
    }
    textContent += '\n';
  });
  
  const blob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const fileName = generateFileName(`list-${list.name.replace(/[^a-zA-Z0-9]/g, '-')}`, 'txt');
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importListsFromJSON = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        const validationResult = validateImportData(jsonData);
        
        if (!validationResult.isValid) {
          reject(new Error(validationResult.error));
          return;
        }
        
        resolve(jsonData);
      } catch {
        reject(new Error('Invalid JSON file format'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

export const validateImportData = (data) => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid data format' };
  }
  
  if (!data.version) {
    return { isValid: false, error: 'Missing version information' };
  }
  
  if (data.lists && Array.isArray(data.lists)) {
    // Multiple lists import
    for (const list of data.lists) {
      if (!list.name || !Array.isArray(list.items)) {
        return { isValid: false, error: 'Invalid list structure' };
      }
      
      for (const item of list.items) {
        if (!item.name || !item.amount) {
          return { isValid: false, error: 'Invalid item structure' };
        }
      }
    }
  } else if (data.list && typeof data.list === 'object') {
    // Single list import
    const list = data.list;
    if (!list.name || !Array.isArray(list.items)) {
      return { isValid: false, error: 'Invalid list structure' };
    }
    
    for (const item of list.items) {
      if (!item.name || !item.amount) {
        return { isValid: false, error: 'Invalid item structure' };
      }
    }
  } else {
    return { isValid: false, error: 'No valid list data found' };
  }
  
  return { isValid: true };
};

export const generateFileName = (baseName, extension) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}-${timestamp}.${extension}`;
};

export const processImportedData = (importedData, currentLists, mergeStrategy = 'append') => {
  const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  let listsToImport = [];
  
  // Handle both single list and multiple lists format
  if (importedData.lists && Array.isArray(importedData.lists)) {
    listsToImport = importedData.lists;
  } else if (importedData.list) {
    listsToImport = [importedData.list];
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
  }));
  
  if (mergeStrategy === 'replace') {
    return processedLists;
  } else {
    // Append strategy - handle name conflicts
    const existingNames = new Set(currentLists.map(list => list.name));
    
    processedLists.forEach(list => {
      let originalName = list.name;
      let counter = 1;
      
      while (existingNames.has(list.name)) {
        list.name = `${originalName} (${counter})`;
        counter++;
      }
      
      existingNames.add(list.name);
    });
    
    return [...currentLists, ...processedLists];
  }
};