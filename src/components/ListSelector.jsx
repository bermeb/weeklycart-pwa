import React, { useState } from "react";
import { Plus, Edit3, Trash2, Check, X, List, Calendar } from 'lucide-react'

const ListSelector = ({
                          lists,
                          currentListId,
                          onSelectList,
                          onCreateList,
                          onRenameList,
                          onDeleteList,
                          onClose
                      }) => {
    const [newListName, setNewListName] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingListId, setEditingListId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const [validationError, setValidationError] = useState('')

    const handleCreateList = () => {
        const error = validateListName(newListName)
        if (error) {
            setValidationError(error)
            return
        }

        onCreateList(newListName.trim())
        handleNameChange('')
        setShowCreateForm(false)
        setValidationError('')
        onClose()
    }

    const handleStartEdit = (list) => {
        setEditingListId(list.id)
        handleEditNameChange(list.name)
    }

    const handleSaveEdit = () => {
        const error = validateListName(editingName, editingListId)
        if (error) {
            setValidationError(error)
            return
        }

        onRenameList(editingListId, editingName.trim())
        setEditingListId(null)
        handleEditNameChange('')
        setValidationError('')
    }

    const handleCancelEdit = () => {
        setEditingListId(null)
        handleEditNameChange('')
    }

    const handleDeleteList = (list) => {
        const error = validateListDeletion(list.id)
        if (error) {
            setValidationError(error)
            return
        }

        if (confirm(`Liste "${list.name}" wirklich löschen?`)) {
            onDeleteList(list.id)
            setValidationError('')
        }
    }

    const handleNameChange = (value) => {
        setNewListName(value)
        if (validationError) setValidationError('')
    }

    const handleEditNameChange = (value) => {
        setEditingName(value)
        if (validationError) setValidationError('')
    }

    const validateListName = (name, excludeId = null) => {
        const trimmedName = name.trim()

        if (!trimmedName) {
            return 'Listenname darf nicht leer sein.'
        }
        if (trimmedName.length > 30) {
            return 'Listenname darf maximal 30 Zeichen lang sein.'
        }

        const isDuplicate = lists.some(list =>
            list.id !== excludeId &&
            list.name.toLowerCase() === trimmedName.toLowerCase()
        )

        if (isDuplicate) {
            return 'Eine Liste mit diesem Namen existiert bereits.'
        }

        return null
    }

    const validateListDeletion = (listId) => {
        if (lists.length <= 1) {
            return 'Die letzte Liste kann nicht gelöscht werden.'
        }

        const listToDelete = lists.find(list => list.id === listId)
        if (!listToDelete) {
            return 'Liste nicht gefunden.'
        }

        return null
    }

    const handleKeyPress = (e, action) => {
        if (e.key === 'Enter') {
            action()
        }
        if (e.key === 'Escape') {
            if (editingListId) {
                handleCancelEdit()
            } else {
                setShowCreateForm(false)
                onClose()
            }
        }
    }

    return (
        <div className="list-selector-overlay" onClick={onClose}>
            <div className="list-selector-panel" onClick={(e) => e.stopPropagation()}>
                <div className="list-selector-header">
                    <h3 className="list-selector-title">
                        <List size={18}/>
                        Meine Listen
                    </h3>
                    <button onClick={onClose} className="close-btn" aria-label="Schließen">
                        <X size={18}/>
                    </button>
                </div>

                <div className="lists-container">
                    {lists.map(list => (
                        <div
                            key={list.id}
                            className={`list-item-selector ${list.id === currentListId ? 'active' : ''}`}
                        >
                            <div
                                className="list-item-content"
                                onClick={() => {
                                    onSelectList(list.id)
                                    onClose()
                                }}>
                                {editingListId === list.id ? (
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => handleEditNameChange(e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, handleSaveEdit)}
                                        className="edit-list-input"
                                        placeholder="Listenname..."
                                        maxLength={30}
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <div className="list-info">
                                            <span className="list-name">{list.name}</span>
                                            <span className="list-stats">
                        {list.items.filter(item => item.checked).length} / {list.items.length} erledigt
                      </span>
                                        </div>
                                        {list.id === currentListId && (
                                            <div className="current-indicator">
                                                <Check size={14}/>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="list-actions">
                                {editingListId === list.id ? (
                                    <>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="action-btn save-btn"
                                            disabled={!editingName.trim()}
                                            aria-label="Speichern">
                                            <Check size={14}/>
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="action-btn cancel-btn"
                                            aria-label="Abbrechen">
                                            <X size={14}/>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleStartEdit(list)
                                            }}
                                            className="action-btn edit-btn"
                                            aria-label="Umbenennen">
                                            <Edit3 size={14}/>
                                        </button>
                                        {lists.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteList(list)
                                                }}
                                                className="action-btn delete-btn"
                                                aria-label="Löschen">
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {validationError && (
                    <div className="validation-error">
                        {validationError}
                    </div>
                )}

                <div className="create-list-section">
                    {showCreateForm ? (
                        <div className="create-form">
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, handleCreateList)}
                                placeholder="z.B. Mediterrane meal prep"
                                maxLength={30}
                                className="create-list-input"
                                autoFocus
                            />
                            <div className="create-actions">
                                <button
                                    onClick={handleCreateList}
                                    disabled={!newListName.trim()}
                                    className="create-btn"
                                    aria-label="Liste erstellen">
                                    <Check size={14}/>
                                    Erstellen
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false)
                                        handleNameChange('')
                                    }}
                                    className="cancel-create-btn"
                                    aria-label="Abbrechen">
                                    Abbrechen
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="add-list-btn"
                            aria-label="Neue Liste erstellen">
                            <Plus size={16}/>
                            Neue Liste erstellen
                        </button>
                    )}
                </div>

                <div className="list-selector-footer">
                    <div className="footer-info">
                        <Calendar size={12}/>
                        <span>Alle Listen werden automatisch zurückgesetzt</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListSelector