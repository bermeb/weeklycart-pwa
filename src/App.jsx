
import './App.css'
import {useLocalStorage} from "./hooks/useLocalStorage.js";
import {useState} from "react";
import {useAutoReset} from "./hooks/useAutoReset.js";
import InstallPrompt from "./components/InstallPrompt.jsx";
import Header from "./components/Header.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import AddItemForm from "./components/AddItemForm.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import InfoFooter from "./components/InfoFooter.jsx";

const initialItems = [
    { id: 1, name: 'Proteinmilch', amount: '1L', checked: false },
    { id: 2, name: 'Eier', amount: '10 Stück', checked: false },
    { id: 3, name: 'Putenbrustfilet', amount: '250g', checked: false }
]

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

function App() {
    const [items, setItems] = useLocalStorage('shoppingItems', initialItems)
    const [autoReset, setAutoReset] = useLocalStorage('autoReset', true)
    const [resetDay, setResetDay] = useLocalStorage('resetDay', 6) // Samstag
    const [lastResetDate, setLastResetDate] = useLocalStorage('lastResetDate', new Date().toDateString())
    const [showSettings, setShowSettings] = useState( false)

    // Auto-Reset hook
    useAutoReset(autoReset, resetDay, lastResetDate, () => {
        resetList()
    })

    // Toggle item checked status (manual reset/check individual items)
    const toggleItem = (id) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ))
    }

    const addItem = (name, amount) => {
        if (!name.trim()) return

        const newId = Math.max(...items.map(item => item.id), 0) + 1
        setItems(prev => [...prev, {
            id: newId,
            name: name.trim(),
            amount: amount.trim() || '1 Stück',
            checked: false
        }])
    }

    const deleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id))
    }

    const editItem = (id, newName, newAmount) => {
        setItems(prev => prev.map(item =>
        item.id === id
        ? { ...item,
                name: newName.trim(),
                amount: newAmount.trim() || '1 Stück'}
            : item
        ))
    }

    const resetList = () => {
        setItems(prev => prev.map(item => ({ ...item, checked: false })))
        setLastResetDate(new Date().toDateString())
    }

    const getNextResetDate = () => {
        const today = new Date()
        const daysUntilReset = (resetDay - today.getDay + 7) % 7
        const nextReset = new Date(today)
        nextReset.setDate(today.getDate() + (daysUntilReset || 7))
        return nextReset.toLocaleDateString('de-DE')
    }

    const checkedCount = items.filter(item => item.checked).length
    const totalCount = items.length
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

    return (
        <div className="app">
            <InstallPrompt />

            <Header
                progress={progress}
                checkedCount={checkedCount}
                totalCount={totalCount}
                onSettingsClick={() => setShowSettings(!showSettings)}
            />

            {showSettings && (
                <SettingsPanel
                    autoReset={autoReset}
                    resetDay={resetDay}
                    weekDays={weekDays}
                    nextResetDate={getNextResetDate()}
                    onAutoResetChange={setAutoReset}
                    onResetDayChange={setResetDay}
                    onManualReset={resetList}
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
            />
        </div>
    )
}

export default App
