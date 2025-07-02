import React, { useState, useRef } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'

const quickUnits = ['g', 'kg', 'L', 'ml', 'Stück', 'Pack']

const AddItemForm = ({ onAddItem }) => {
    const [itemName, setItemName] = useState('')
    const [itemAmount, setItemAmount] = useState('')
    const nameInputRef = useRef(null)
    const amountInputRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (itemName.trim()) {
            onAddItem(itemName.trim(), itemAmount.trim() || '1 Stück')
            setItemName('')
            setItemAmount('')
            nameInputRef.current?.focus()
        }
    }

    const handleNameKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (!itemAmount.trim()) {
                amountInputRef.current?.focus()
            } else {
                handleSubmit(e)
            }
        }
    }

    const handleAmountKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const addQuickUnit = (unit) => {
        const currentValue = itemAmount.trim()

        if (currentValue && !currentValue.includes(unit)) {
            // Wenn schon eine Zahl da ist, unit anhängen
            if (/^\d+$/.test(currentValue)) {
                setItemAmount(currentValue + unit)
            } else {
                setItemAmount(currentValue + ' ' + unit)
            }
        } else if (!currentValue) {
            if (unit === 'Stück' || unit === 'Pack') {
                setItemAmount('1 ' + unit)
            } else {
                setItemAmount('')
                amountInputRef.current?.focus()
                amountInputRef.current?.setAttribute('placeholder', '500' + unit)
            }
        }
    }

    return (
        <div className="add-item-section">
            <div className="add-item-header">
                <h3 className="add-item-title">
                    <ShoppingCart size={18} />
                    Artikel hinzufügen
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="add-form">
                <input
                    ref={nameInputRef}
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    onKeyDown={handleNameKeyPress}
                    placeholder="Artikel..."
                    maxLength={30}
                    className="add-input name-input"
                    aria-label="Artikel name eingeben"
                />
                <input
                    ref={amountInputRef}
                    type="text"
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    onKeyDown={handleAmountKeyPress}
                    placeholder="Menge..."
                    maxLength={15}
                    className="add-input amount-input"
                    aria-label="Menge eingeben"
                />
                <button
                    type="submit"
                    disabled={!itemName.trim()}
                    className="add-btn"
                    aria-label="Artikel zur Liste hinzufügen">
                    <Plus size={18} />
                </button>
            </form>

            <div className="quick-units">
                <span className="quick-units-label">Schnell-Einheiten:</span>
                {quickUnits.map(unit => (
                    <button
                        key={unit}
                        type="button"
                        onClick={() => addQuickUnit(unit)}
                        className="unit-btn"
                        aria-label={`${unit} hinzufügen`}>
                        {unit}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default AddItemForm