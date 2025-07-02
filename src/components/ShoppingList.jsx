import React, { useState } from 'react'
import { Check, Trash2, ShoppingCart, Edit3, Save, X, ClipboardList, CheckCircle } from 'lucide-react'

const ShoppingListItem = ({ item, onToggle, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(item.name)
    const [editAmount, setEditAmount] = useState(item.amount)

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleSave = () => {
        if (editName.trim()) {
            onEdit(item.id, editName.trim(), editAmount.trim())
            setIsEditing(false)
        }
    }

    const handleCancel = () => {
        setEditName(item.name)
        setEditAmount(item.amount)
        setIsEditing(false)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave()
        }
        if (e.key === 'Escape') {
            handleCancel()
        }
    }

    const handleToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle(item.id)
    }

    if (isEditing) {
        return (
            <div className="list-item editing">
                <div className="item-content">
                    <div className="checkbox disabled">
                        <Check size={16} color="#d1d5db" />
                    </div>
                    <div className="edit-inputs">
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="edit-input edit-name"
                            placeholder="Artikel..."
                            maxLength={30}
                            autoFocus
                        />
                        <input
                            type="text"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="edit-input edit-amount"
                            placeholder="Menge..."
                            maxLength={15}
                        />
                    </div>
                </div>
                <div className="edit-actions">
                    <button
                        onClick={handleSave}
                        className="edit-btn save-btn"
                        disabled={!editName.trim()}
                        aria-label="Änderungen speichern">
                        <Save size={16} />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="edit-btn cancel-btn"
                        aria-label="Bearbeitung abbrechen">
                        <X size={16} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`list-item ${item.checked ? 'checked' : ''} ${item.checked ? 'completed' : ''}`}
        >
            <div className="item-content">
                <label className="checkbox-container" onClick={handleToggle}>
                    <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={handleToggle}
                        className="checkbox-input"
                    />
                    <span className="checkbox-custom">
            {item.checked && <Check size={14} />}
          </span>
                </label>
                <div
                    className="item-text"
                    onClick={handleToggle}
                    style={{ cursor: 'pointer' }}>
                    <span className="item-name">{item.name}</span>
                    <span className="item-amount">{item.amount || '1 Stück'}</span>
                </div>
            </div>

            <div className="item-actions">
                {!item.checked && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            handleEdit()
                        }}
                        className="edit-btn"
                        aria-label="Artikel bearbeiten">
                        <Edit3 size={16} />
                    </button>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(item.id)
                    }}
                    className="delete-btn"
                    aria-label="Artikel löschen">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    )
}

const EmptyState = () => (
    <div className="empty-state">
        <div className="empty-icon">
            <ShoppingCart size={32} />
        </div>
        <p className="empty-title">Keine Artikel vorhanden</p>
        <p className="empty-subtitle">Füge oben einen neuen Artikel hinzu</p>
    </div>
)

const ShoppingList = ({ items, onToggleItem, onDeleteItem, onEditItem }) => {
    const uncheckedItems = items.filter(item => !item.checked)
    const checkedItems = items.filter(item => item.checked)

    if (items.length === 0) {
        return (
            <div className="list-container">
                <EmptyState />
            </div>
        )
    }

    return (
        <div className="list-container">
            <div className="shopping-list">
                {/* Unchecked Items */}
                {uncheckedItems.length > 0 && (
                    <div className="items-section">
                        <h3 className="section-title">
                            <ClipboardList size={18} />
                            Nicht gekauft ({uncheckedItems.length})
                        </h3>
                        {uncheckedItems.map(item => (
                            <ShoppingListItem
                                key={item.id}
                                item={item}
                                onToggle={onToggleItem}
                                onDelete={onDeleteItem}
                                onEdit={onEditItem}
                            />
                        ))}
                    </div>
                )}

                {/* Checked Items */}
                {checkedItems.length > 0 && (
                    <div className="items-section">
                        <h3 className="section-title">
                            <CheckCircle size={18} />
                            Gekauft ({checkedItems.length})
                        </h3>
                        <div className="completed-items">
                            {checkedItems.map(item => (
                                <ShoppingListItem
                                    key={item.id}
                                    item={item}
                                    onToggle={onToggleItem}
                                    onDelete={onDeleteItem}
                                    onEdit={onEditItem}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShoppingList