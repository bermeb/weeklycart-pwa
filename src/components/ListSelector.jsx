import React, { useState } from "react" 
import { Plus, Edit3, Trash2, Check, X, List, Calendar, Share2 } from 'lucide-react'
import ShareModal from './ShareModal'

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
    if (!isOpen) return null 

    return (
        <div className="confirmation-overlay" onClick={onCancel}>
            <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirmation-content">
                    <p>{message}</p>
                    <div className="confirmation-actions">
                        <button onClick={onConfirm} className="confirm-btn">
                            Ja, löschen
                        </button>
                        <button onClick={onCancel} className="cancel-btn">
                            Abbrechen
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) 
} 

class ListSelectorErrorBoundary extends React.Component {
    constructor(props) {
        super(props) 
        this.state = { hasError: false, error: null } 
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error } 
    }

    componentDidCatch(error, errorInfo) {
        console.error('ListSelector Error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h3>Etwas ist schiefgelaufen</h3>
                    <p>Die Listenauswahl konnte nicht geladen werden.</p>
                    <button onClick={() => this.setState({ hasError: false })}>
                        Erneut versuchen
                    </button>
                </div>
            ) 
        }

        return this.props.children 
    }
}

const ListSelector = ({
                          lists,
                          currentListId,
                          onSelectList,
                          onCreateList,
                          onRenameList,
                          onDeleteList,
                          onClose,
                          onShareList
                      }) => {
    const [newListName, setNewListName] = useState('')
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingListId, setEditingListId] = useState(null)
    const [editingName, setEditingName] = useState('')
    const [validationError, setValidationError] = useState('')
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        listId: null,
        listName: ''
    })
    const [showShareAllModal, setShowShareAllModal] = useState(false)

    const safeLocalStorageOperation = (operation, fallback = null) => {
        try {
            return operation()
        } catch (error) {
            console.error('localStorage operation failed:', error) 
            setValidationError('Speichervorgang fehlgeschlagen. Bitte versuchen Sie es erneut.') 
            return fallback
        }
    } 

    const handleCreateList = () => {
        const error = validateListName(newListName)
        if (error) {
            setValidationError(error)
            return
        }

        safeLocalStorageOperation(() => {
            onCreateList(newListName.trim())
            handleNameChange('')
            setShowCreateForm(false)
            setValidationError('')
            onClose()
        })
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

        safeLocalStorageOperation(() => {
            onRenameList(editingListId, editingName.trim())
            setEditingListId(null)
            handleEditNameChange('')
            setValidationError('')
        })
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

        setConfirmDelete({
            isOpen: true,
            listId: list.id,
            listName: list.name
        })
    }

    const handleConfirmDelete = () => {
        safeLocalStorageOperation(() => {
            onDeleteList(confirmDelete.listId)
            setValidationError('')
            setConfirmDelete({ isOpen: false, listId: null, listName: '' })
        })
    }

    const handleCancelDelete = () => {
        setConfirmDelete({ isOpen: false, listId: null, listName: '' })
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
        <div 
            className="list-selector-overlay" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="list-selector-title">
            <div className="list-selector-panel" onClick={(e) => e.stopPropagation()}>
                <div className="list-selector-header">
                    <h3 id="list-selector-title" className="list-selector-title">
                        <List size={18}/>
                        Meine Listen
                    </h3>
                    <button onClick={onClose} className="close-btn" aria-label="Listen-Auswahl schließen">
                        <X size={18}/>
                    </button>
                </div>

                <div className="share-all-section">
                    <button
                        onClick={() => setShowShareAllModal(true)}
                        className="share-all-btn"
                        aria-label="Alle Listen teilen">
                        <Share2 size={16}/>
                        Alle Listen teilen
                    </button>
                </div>

                <div className="lists-container">
                    {lists.map(list => (
                        <div
                            key={list.id}
                            className={`list-item-selector ${list.id === currentListId ? 'active' : ''}`}>
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
                                                onShareList?.(list.id)
                                            }}
                                            className="action-btn share-btn"
                                            aria-label="Teilen">
                                            <Share2 size={14}/>
                                        </button>
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
                    <div 
                        className="validation-error"
                        role="alert"
                        aria-live="polite">
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

                <ConfirmationModal
                    isOpen={confirmDelete.isOpen}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    message={`Liste "${confirmDelete.listName}" wirklich löschen?`}
                />

                <ShareModal
                    isOpen={showShareAllModal}
                    onClose={() => setShowShareAllModal(false)}
                    lists={lists}
                    currentListId={currentListId}
                    shareType="all"
                />
            </div>
        </div>
    )
}

export default function ListSelectorWithErrorBoundary(props) {
    return (
        <ListSelectorErrorBoundary>
            <ListSelector {...props} />
        </ListSelectorErrorBoundary>
    ) 
}