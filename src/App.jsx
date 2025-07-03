import React, {useMemo, useState} from "react";
import {useLocalStorage} from "./hooks/useLocalStorage.js";
import {useAutoReset} from "./hooks/useAutoReset.js";
import InstallPrompt from "./components/InstallPrompt.jsx";
import Header from "./components/Header.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import AddItemForm from "./components/AddItemForm.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import InfoFooter from "./components/InfoFooter.jsx";
import './App.css'
import ListSelector from "./components/ListSelector.jsx";

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
    const [showSettings, setShowSettings] = useState( false)
    const [showListSelector, setShowListSelector] = useState(false)

    // Auto-Reset hook
    useAutoReset(autoReset, resetDay, lastResetDate, () => {
        resetAllLists()
    })

    const currentList = lists.find(list => list.id === currentListId) || lists[0]
    const items = useMemo(() => currentList?.items || [], [currentList?.items])

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

    // Calculate progress for current list
    // useMemo for optimized updating of progress
    const { checkedCount, totalCount, progress } = useMemo(() => {
        const checked = items.filter(item => item.checked).length
        const total = items.length
        const progressPercent = total > 0 ? (checked / total) * 100 : 0

        return {
            checkedCount: checked,
            totalCount: total,
            progress: progressPercent
        }
    }, [items])

    return (
        <div className="app">
            <InstallPrompt />

            <Header
                progress={progress}
                checkedCount={checkedCount}
                totalCount={totalCount}
                currentListName={currentList?.name || 'Liste'}
                onSettingsClick={() => setShowSettings(!showSettings)}
                onListSelectorClick={() => setShowListSelector(!showListSelector)}
            />

            {showSettings && (
                <SettingsPanel
                    autoReset={autoReset}
                    resetDay={resetDay}
                    weekDays={weekDays}
                    onAutoResetChange={setAutoReset}
                    onResetDayChange={setResetDay}
                    onManualReset={resetAllLists}
                    listsCount={lists.length}
                />
            )}

            {showListSelector && (
                <ListSelector
                    lists={lists}
                    currentListId={currentListId}
                    onSelectList={setCurrentListId}
                    onCreateList={createList}
                    onRenameList={renameList}
                    onDeleteList={deleteList}
                    onClose={() => setShowListSelector(false)}
                />
            )}

            <AddItemForm onAddItem={addItem} />

            <ShoppingList
                items={items}
                onToggleItem={toggleItem}
                onDeleteItem={deleteItem}
                onEditItem={editItem}
            />

            <InfoFooter
                autoReset={autoReset}
                resetDay={resetDay}
                weekDays={weekDays}
                listsCount={lists.length}
                onResetCurrentList={resetCurrentList}
            />
        </div>
    )
}

export default App
