import {useLocalStorage} from "./hooks/useLocalStorage.js";
import {useMemo, useState} from "react";
import {useAutoReset} from "./hooks/useAutoReset.js";
import InstallPrompt from "./components/InstallPrompt.jsx";
import Header from "./components/Header.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import AddItemForm from "./components/AddItemForm.jsx";
import ShoppingList from "./components/ShoppingList.jsx";
import InfoFooter from "./components/InfoFooter.jsx";
import './App.css'

const initialItems = [
    { id: 1, name: 'Proteinmilch', amount: '1L', checked: false },
    { id: 2, name: 'Eier', amount: '10 Stück', checked: false },
    { id: 3, name: 'Putenbrustfilet', amount: '250g', checked: false }
]

const weekDays = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']

function App() {
    const [items, setItems] = useLocalStorage('shoppingItems', initialItems)
    const [autoReset, setAutoReset] = useLocalStorage('autoReset', true)
    const [resetDay, setResetDay] = useLocalStorage('resetDay', 5) // Samstag
    const [lastResetDate, setLastResetDate] = useLocalStorage('lastResetDate', new Date().toDateString())
    const [showSettings, setShowSettings] = useState( false)

    // Auto-Reset hook
    useAutoReset(autoReset, resetDay, lastResetDate, () => {
        resetList()
    })

    // Toggle item checked status (manual reset/check individual items)
    const toggleItem = (id) => {
        setItems(prev => {
            const updatedItems = prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
            )
            console.log('Items updated:', updatedItems)
            return updatedItems
        })
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
                ? { ...item, name: newName.trim(), amount: newAmount.trim() || '1 Stück' }
                : item
        ))
    }

    const resetList = () => {
        setItems(prev => prev.map(item => ({ ...item, checked: false })))
        setLastResetDate(new Date().toDateString())
    }

    const { checkedCount, totalCount, progress } = useMemo(() => {
        const checked = items.filter(item => item.checked).length
        const total = items.length
        const progressPercent = total > 0 ? (checked / total) * 100 : 0

        console.log('Progress calculated:', { checked, total, progressPercent })

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
                onSettingsClick={() => setShowSettings(!showSettings)}
            />

            {showSettings && (
                <SettingsPanel
                    autoReset={autoReset}
                    resetDay={resetDay}
                    weekDays={weekDays}
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
