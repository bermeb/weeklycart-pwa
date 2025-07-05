import React, {useState, useEffect} from "react"
import {useLocalStorage} from "./hooks/useLocalStorage.js"
import {useAutoReset} from "./hooks/useAutoReset.js"
import {useListStats} from "./hooks/useListStats.js"
import InstallPrompt from "./components/InstallPrompt.jsx"
import Header from "./components/Header.jsx"
import SettingsPanel from "./components/SettingsPanel.jsx"
import AddItemForm from "./components/AddItemForm.jsx"
import ShoppingList from "./components/ShoppingList.jsx"
import InfoFooter from "./components/InfoFooter.jsx"
import ListSelector from "./components/ListSelector.jsx"
import ShareModal from "./components/ShareModal.jsx"
import ErrorBoundary from "./components/ErrorBoundary.jsx"
import { decodeListData } from "./utils/sharing.js"
import { processImportedData } from "./utils/dataExport.js"
import { checkStorageSpace } from "./utils/validation.js"
import './App.css'

const defaultItems = [
    { id: 1, name: 'Proteinmilch', amount: '1L', checked: false },
    { id: 2, name: 'Eier', amount: '10 Stück', checked: false },
    { id: 3, name: 'Putenbrustfilet', amount: '250g', checked: false }
]

const initialLists = [
    {
        id: 1,
        name: 'Wocheneinkauf',
        items: [...defaultItems],
        createdAt: new Date().toISOString()
    }
]

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

function App() {
    const [lists, setLists] = useLocalStorage('shoppingLists', initialLists)
    const [currentListId, setCurrentListId] = useLocalStorage('currentListId', 1)
    const [autoReset, setAutoReset] = useLocalStorage('autoReset', true)
    const [resetDay, setResetDay] = useLocalStorage('resetDay', 5) // Samstag
    const [lastResetDate, setLastResetDate] = useLocalStorage('lastResetDate', new Date().toDateString())
    const [showSettings, setShowSettings] = useState(false)
    const [showListSelector, setShowListSelector] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [shareListId, setShareListId] = useState(null)
    const [importNotification, setImportNotification] = useState('')

    // Auto-Reset hook
    useAutoReset(autoReset, resetDay, lastResetDate, () => {
        resetAllLists()
    })

    // Handle URL-based imports
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const importData = urlParams.get('import')
        
        if (importData) {
            try {
                const decodedData = decodeListData(importData)
                const processedLists = processImportedData(decodedData, lists, 'append')
                
                // Check storage space before importing
                const storageCheck = checkStorageSpace(processedLists)
                if (!storageCheck.hasSpace) {
                    setImportNotification(`Import failed: ${storageCheck.error}`)
                    setTimeout(() => setImportNotification(''), 5000)
                    return
                }
                
                setLists(processedLists)
                
                const importedCount = decodedData.lists ? decodedData.lists.length : 1
                setImportNotification(`${importedCount} Liste(n) erfolgreich importiert!`)
                
                // Clean up URL
                window.history.replaceState({}, document.title, window.location.pathname)
                
                setTimeout(() => setImportNotification(''), 5000)
            } catch (error) {
                setImportNotification(`Import failed: ${error.message}`)
                setTimeout(() => setImportNotification(''), 5000)
            }
        }
    }, [lists, setLists])

    // Use custom hook for performance optimization
    const { currentList, items, checkedCount, totalCount, progress } = useListStats(lists, currentListId)

    // Toggle item checked status (manual reset/check individual items)
    const toggleItem = (id) => {
        setLists(prev => prev.map(list =>
            list.id === currentListId
                ? {
                    ...list,
                    items: list.items.map(item =>
                        item.id === id ? { ...item, checked: !item.checked } : item
                    )
                }
                : list
        ))
    }

    // Add new item to current list
    const addItem = (name, amount) => {
        if (!name.trim()) return

        setLists(prev => prev.map(list =>
            list.id === currentListId
                ? {
                    ...list,
                    items: [...list.items, {
                        id: Math.max(...list.items.map(item => item.id), 0) + 1,
                        name: name.trim(),
                        amount: amount.trim() || '1 Stück',
                        checked: false,
                        permanent: false
                    }]
                }
                : list
        ))
    }

    // Delete item from current list
    const deleteItem = (id) => {
        setLists(prev => prev.map(list =>
            list.id === currentListId
                ? {
                    ...list,
                    items: list.items.filter(item => item.id !== id)
                }
                : list
        ))
    }

    // Edit item in current list
    const editItem = (id, newName, newAmount) => {
        setLists(prev => prev.map(list =>
            list.id === currentListId
                ? {
                    ...list,
                    items: list.items.map(item =>
                        item.id === id
                            ? { ...item, name: newName.trim(), amount: newAmount.trim() || '1 Stück' }
                            : item
                    )
                }
                : list
        ))
    }

    const createList = (name) => {
        const newId = Math.max(...lists.map(list => list.id), 0) + 1
        const newList = {
            id: newId,
            name: name.trim(),
            items: [],
            createdAt: new Date().toISOString()
        }
        setLists(prev => [...prev, newList])
        setCurrentListId(newId)
    }

    const renameList = (id, newName) => {
        setLists(prev => prev.map(list =>
            list.id === id ? { ...list, name: newName.trim() } : list
        ))
    }

    const deleteList = (id) => {
        if (lists.length <= 1) return // Don't delete the last list

        setLists(prev => prev.filter(list => list.id !== id))

        // If deleting current list, switch to first remaining list
        if (id === currentListId) {
            const remainingLists = lists.filter(list => list.id !== id)
            setCurrentListId(remainingLists[0]?.id || 1)
        }
    }

    const resetCurrentList = () => {
        setLists(prev => prev.map(list =>
            list.id === currentListId
                ? {
                    ...list,
                    items: list.items.map(item => ({ ...item, checked: false }))
                }
                : list
        ))
        setLastResetDate(new Date().toDateString())
    }

    const resetAllLists = () => {
        setLists(prev => prev.map(list => ({
            ...list,
            items: list.items.map(item => ({ ...item, checked: false }))
        })))
        setLastResetDate(new Date().toDateString())
    }

    const handleImportLists = (importedLists) => {
        setLists(importedLists)
        
        // If current list no longer exists, switch to first available list
        if (!importedLists.find(list => list.id === currentListId)) {
            setCurrentListId(importedLists[0]?.id || 1)
        }
    }

    const handleShareList = (listId) => {
        setShareListId(listId)
        setShowShareModal(true)
    }

    const handleCloseShareModal = () => {
        setShowShareModal(false)
        setShareListId(null)
    }
    return (
        <div className="app">
            <ErrorBoundary 
                componentName="InstallPrompt" 
                fallbackMessage="Die Installation konnte nicht geladen werden.">
                <InstallPrompt />
            </ErrorBoundary>

            <ErrorBoundary 
                componentName="Header" 
                fallbackMessage="Die Kopfzeile konnte nicht geladen werden.">
                <Header
                    progress={progress}
                    checkedCount={checkedCount}
                    totalCount={totalCount}
                    currentListName={currentList?.name || 'Liste'}
                    onSettingsClick={() => setShowSettings(!showSettings)}
                    onListSelectorClick={() => setShowListSelector(!showListSelector)}
                    onShareClick={() => handleShareList(currentListId)}
                />
            </ErrorBoundary>

            {importNotification && (
                <div 
                    className="import-notification"
                    role={importNotification.includes('Fehler') || importNotification.includes('failed') ? 'alert' : 'status'}
                    aria-live="polite">
                    {importNotification}
                </div>
            )}

            {showSettings && (
                <ErrorBoundary 
                    componentName="SettingsPanel" 
                    fallbackMessage="Die Einstellungen konnten nicht geladen werden.">
                    <SettingsPanel
                        autoReset={autoReset}
                        resetDay={resetDay}
                        weekDays={weekDays}
                        onAutoResetChange={setAutoReset}
                        onResetDayChange={setResetDay}
                        onManualReset={resetAllLists}
                        listsCount={lists.length}
                        lists={lists}
                        currentList={currentList}
                        onImportLists={handleImportLists}
                    />
                </ErrorBoundary>
            )}

            {showListSelector && (
                <ErrorBoundary 
                    componentName="ListSelector" 
                    fallbackMessage="Die Listenauswahl konnte nicht geladen werden.">
                    <ListSelector
                        lists={lists}
                        currentListId={currentListId}
                        onSelectList={setCurrentListId}
                        onCreateList={createList}
                        onRenameList={renameList}
                        onDeleteList={deleteList}
                        onClose={() => setShowListSelector(false)}
                        onShareList={handleShareList}
                    />
                </ErrorBoundary>
            )}

            {showShareModal && (
                <ErrorBoundary 
                    componentName="ShareModal" 
                    fallbackMessage="Das Teilen-Fenster konnte nicht geladen werden.">
                    <ShareModal
                        isOpen={showShareModal}
                        onClose={handleCloseShareModal}
                        lists={lists}
                        currentListId={shareListId || currentListId}
                        shareType="current"
                    />
                </ErrorBoundary>
            )}

            <ErrorBoundary 
                componentName="AddItemForm" 
                fallbackMessage="Das Formular konnte nicht geladen werden.">
                <AddItemForm onAddItem={addItem} />
            </ErrorBoundary>

            <ErrorBoundary 
                componentName="ShoppingList" 
                fallbackMessage="Die Einkaufsliste konnte nicht geladen werden.">
                <ShoppingList
                    items={items}
                    onToggleItem={toggleItem}
                    onDeleteItem={deleteItem}
                    onEditItem={editItem}
                />
            </ErrorBoundary>

            <ErrorBoundary 
                componentName="InfoFooter" 
                fallbackMessage="Die Fußzeile konnte nicht geladen werden.">
                <InfoFooter
                    autoReset={autoReset}
                    resetDay={resetDay}
                    weekDays={weekDays}
                    listsCount={lists.length}
                    onResetCurrentList={resetCurrentList}
                />
            </ErrorBoundary>
        </div>
    )
}

export default App
