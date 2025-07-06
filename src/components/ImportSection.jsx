import React from 'react'
import {Upload} from 'lucide-react'

const ImportSection = ({
    fileInputRef,
    onImportClick,
    onFileImport,
    importStatus,
    showImportOptions,
    showReplaceConfirm,
    pendingImportData,
    lists,
    onConfirmImport,
    onConfirmReplace,
    onCancelReplace,
    onCancelImport
}) => {
    const getImportType = () => {
        if (!pendingImportData) return 'unknown'
        return pendingImportData.lists ? 'multiple' : 'single'
    }

    const hasNameConflict = () => {
        if (!pendingImportData) return false
        
        const existingNames = new Set(lists.map(list => list.name))
        
        if (pendingImportData.lists) {
            return pendingImportData.lists.some(list => existingNames.has(list.name))
        } else if (pendingImportData.list) {
            return existingNames.has(pendingImportData.list.name)
        }
        
        return false
    }

    return (
        <>
            <div className="import-section">
                <button onClick={onImportClick} className="import-btn">
                    <Upload size={16}/>
                    Listen importieren
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileImport}
                    accept=".json"
                    style={{ display: 'none' }}
                />
            </div>

            {importStatus && (
                <div 
                    className={`import-status ${importStatus.includes('Fehler') ? 'error' : 'success'}`}
                    role={importStatus.includes('Fehler') ? 'alert' : 'status'}
                    aria-live="polite">
                    {importStatus}
                </div>
            )}

            {showImportOptions && (
                <div className="import-options">
                    <h4>Import-Optionen</h4>
                    <p>Wie sollen die importierten Listen behandelt werden?</p>
                    <div className="import-buttons">
                        <button 
                            onClick={() => onConfirmImport('append')} 
                            className="import-option-btn append">
                            Hinzufügen
                        </button>
                        {(getImportType() === 'multiple' || hasNameConflict()) && (
                            <button 
                                onClick={() => onConfirmImport('replace')} 
                                className="import-option-btn replace">
                                {getImportType() === 'multiple' ? 'Alle Listen ersetzen' : 'Ersetzen'}
                            </button>
                        )}
                        <button 
                            onClick={onCancelImport} 
                            className="import-option-btn cancel">
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}

            {showReplaceConfirm && (
                <div className="import-options">
                    <h4>Bestätigung erforderlich</h4>
                    <p>
                        {getImportType() === 'multiple' 
                            ? 'Möchten Sie wirklich alle bestehenden Listen ersetzen? Diese Aktion kann nicht rückgängig gemacht werden.'
                            : 'Möchten Sie wirklich die bestehende Liste ersetzen? Diese Aktion kann nicht rückgängig gemacht werden.'
                        }
                    </p>
                    <div className="import-buttons">
                        <button 
                            onClick={onConfirmReplace} 
                            className="import-option-btn replace">
                            Ja, ersetzen
                        </button>
                        <button 
                            onClick={onCancelReplace} 
                            className="import-option-btn cancel">
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ImportSection