import React, { useState, useRef } from 'react'
import {Calendar, RefreshCw, Settings, Upload, FileText, FileDown, Share2, QrCode} from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import { 
    exportListsToJSON, 
    exportListsToText, 
    exportSingleListToJSON, 
    exportSingleListToText,
    importListsFromJSON,
    processImportedData 
} from '../utils/dataExport'
import {
    shareViaWebShare,
    copyShareUrl,
    generateQRCode,
    isWebShareSupported
} from '../utils/sharing'

const SettingsPanel = ({
                           autoReset,
                           resetDay,
                           weekDays,
                           onAutoResetChange,
                           onResetDayChange,
                           onManualReset,
                           listsCount,
                           lists,
                           currentList,
                           onImportLists
                       }) => {
    const [importStatus, setImportStatus] = useState('')
    const [showImportOptions, setShowImportOptions] = useState(false)
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
    const [showQRCode, setShowQRCode] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [pendingImportData, setPendingImportData] = useState(null)
    const [isGeneratingQR, setIsGeneratingQR] = useState(false)
    const fileInputRef = useRef(null)

    const handleExportAllJSON = () => {
        exportListsToJSON(lists)
        setImportStatus('Alle Listen als JSON exportiert')
        setTimeout(() => setImportStatus(''), 3000)
    }

    const handleExportAllText = () => {
        exportListsToText(lists)
        setImportStatus('Alle Listen als Text exportiert')
        setTimeout(() => setImportStatus(''), 3000)
    }

    const handleExportCurrentJSON = () => {
        if (currentList) {
            exportSingleListToJSON(currentList)
            setImportStatus('Aktuelle Liste als JSON exportiert')
            setTimeout(() => setImportStatus(''), 3000)
        }
    }

    const handleExportCurrentText = () => {
        if (currentList) {
            exportSingleListToText(currentList)
            setImportStatus('Aktuelle Liste als Text exportiert')
            setTimeout(() => setImportStatus(''), 3000)
        }
    }

    // Mobile sharing handlers
    const handleShareAllLists = async () => {
        const shareData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            lists: lists.map(list => ({
                name: list.name,
                items: list.items.map(item => ({
                    name: item.name,
                    amount: item.amount
                }))
            }))
        }

        try {
            if (isWebShareSupported()) {
                await shareViaWebShare(shareData, false)
                setImportStatus('Listen geteilt')
            } else {
                await copyShareUrl(shareData)
                setImportStatus('Share-Link kopiert')
            }
            setTimeout(() => setImportStatus(''), 3000)
        } catch {
            setImportStatus('Fehler beim Teilen')
            setTimeout(() => setImportStatus(''), 3000)
        }
    }

    const handleShareCurrentList = async () => {
        if (!currentList) return
        
        const shareData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            list: {
                name: currentList.name,
                items: currentList.items.map(item => ({
                    name: item.name,
                    amount: item.amount
                }))
            }
        }

        try {
            if (isWebShareSupported()) {
                await shareViaWebShare(shareData, true)
                setImportStatus('Liste geteilt')
            } else {
                await copyShareUrl(shareData)
                setImportStatus('Share-Link kopiert')
            }
            setTimeout(() => setImportStatus(''), 3000)
        } catch {
            setImportStatus('Fehler beim Teilen')
            setTimeout(() => setImportStatus(''), 3000)
        }
    }

    const handleShowQRCode = async (isSingleList = false) => {
        const shareData = isSingleList ? {
            version: '1.0',
            exportDate: new Date().toISOString(),
            list: {
                name: currentList.name,
                items: currentList.items.map(item => ({
                    name: item.name,
                    amount: item.amount
                }))
            }
        } : {
            version: '1.0',
            exportDate: new Date().toISOString(),
            lists: lists.map(list => ({
                name: list.name,
                items: list.items.map(item => ({
                    name: item.name,
                    amount: item.amount
                }))
            }))
        }

        setIsGeneratingQR(true)
        
        try {
            const qrUrl = await generateQRCode(shareData)
            setQrCodeUrl(qrUrl)
            setShowQRCode(true)
        } catch (error) {
            setImportStatus(`QR-Code Fehler: ${error.message}`)
            setTimeout(() => setImportStatus(''), 5000)
        } finally {
            setIsGeneratingQR(false)
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileImport = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        try {
            setImportStatus('Importiere...')
            const importedData = await importListsFromJSON(file)
            setShowImportOptions(true)
            setImportStatus('')
            
            setPendingImportData(importedData)
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`)
            setTimeout(() => setImportStatus(''), 5000)
        }
        
        event.target.value = ''
    }

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

    const handleConfirmImport = (strategy) => {
        if (strategy === 'replace') {
            setShowReplaceConfirm(true)
            return
        }
        
        try {
            const processedLists = processImportedData(pendingImportData, lists, strategy)
            onImportLists(processedLists)
            setImportStatus(`Listen erfolgreich ${strategy === 'replace' ? 'ersetzt' : 'hinzugefügt'}`)
            setShowImportOptions(false)
            setPendingImportData(null)
            setTimeout(() => setImportStatus(''), 3000)
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`)
            setTimeout(() => setImportStatus(''), 5000)
        }
    }

    const handleConfirmReplace = () => {
        try {
            const processedLists = processImportedData(pendingImportData, lists, 'replace')
            onImportLists(processedLists)
            setImportStatus('Listen erfolgreich ersetzt')
            setShowImportOptions(false)
            setShowReplaceConfirm(false)
            setPendingImportData(null)
            setTimeout(() => setImportStatus(''), 3000)
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`)
            setTimeout(() => setImportStatus(''), 5000)
        }
    }

    const handleCancelReplace = () => {
        setShowReplaceConfirm(false)
    }

    const handleCancelImport = () => {
        setShowImportOptions(false)
        setPendingImportData(null)
        setImportStatus('')
    }
    return (
        <div className="settings-panel">
            <div className="settings-header">
                <h3 className="settings-title">
                    <Settings size={18}/>
                    Einstellungen
                </h3>
            </div>

            <div className="settings-row">
                <label className="settings-label">
                    <Calendar size={16}/>
                    Automatisches Zurücksetzten
                </label>
                <button
                    onClick={() => onAutoResetChange(!autoReset)}
                    className={`toggle ${autoReset ? 'active' : ''}`}
                    aria-label={`Automatisches Zurücksetzen ${autoReset ? 'deaktivieren' : 'aktivieren'}`}>
                    <div className="toggle-slider"/>
                </button>
            </div>

            <div className="settings-row">
                <label className="settings-label">
                    <Calendar size={16}/>
                    Reset-Tag wählen:
                </label>
                <select
                    value={resetDay}
                    onChange={(e) => onResetDayChange(parseInt(e.target.value))}
                    className="day-select"
                    disabled={!autoReset}
                    aria-label="Tag für automatisches Zurücksetzen wählen">
                    {weekDays.map((day, index) => (
                        <option key={index} value={index}>{day}</option>
                    ))}
                </select>
            </div>

            <button onClick={onManualReset} className="reset-btn" aria-label="Alle Listen jetzt zurücksetzten">
                <RefreshCw size={16}/>
                Alle Listen zurücksetzten ({listsCount})
            </button>

            <div className="settings-divider"></div>

            <div className="settings-header">
                <h3 className="settings-title">
                    <Share2 size={18}/>
                    Listen teilen & importieren
                </h3>
            </div>

            <div className="export-buttons">
                <div className="export-section">
                    <h4 className="export-section-title">Alle Listen teilen</h4>
                    <div className="export-button-group">
                        <button onClick={handleShareAllLists} className="export-btn share-btn">
                            <Share2 size={16}/>
                            {isWebShareSupported() ? 'Teilen' : 'Link kopieren'}
                        </button>
                        <button 
                            onClick={() => handleShowQRCode(false)} 
                            className="export-btn"
                            disabled={isGeneratingQR}>
                            <QrCode size={16}/>
                            {isGeneratingQR ? 'Erstelle...' : 'QR-Code'}
                        </button>
                    </div>
                </div>

                {currentList && (
                    <div className="export-section">
                        <h4 className="export-section-title">Aktuelle Liste teilen</h4>
                        <div className="export-button-group">
                            <button onClick={handleShareCurrentList} className="export-btn share-btn">
                                <Share2 size={16}/>
                                {isWebShareSupported() ? 'Teilen' : 'Link kopieren'}
                            </button>
                            <button 
                                onClick={() => handleShowQRCode(true)} 
                                className="export-btn"
                                disabled={isGeneratingQR}>
                                <QrCode size={16}/>
                                {isGeneratingQR ? 'Erstelle...' : 'QR-Code'}
                            </button>
                        </div>
                    </div>
                )}

                <div className="export-section">
                    <h4 className="export-section-title">Backup-Export (Datei)</h4>
                    <div className="export-button-group">
                        <button onClick={handleExportAllJSON} className="export-btn backup-btn">
                            <FileDown size={16}/>
                            Alle Listen (JSON)
                        </button>
                        <button onClick={handleExportAllText} className="export-btn backup-btn">
                            <FileText size={16}/>
                            Alle Listen (Text)
                        </button>
                        {currentList && (
                            <>
                                <button onClick={handleExportCurrentJSON} className="export-btn backup-btn">
                                    <FileDown size={16}/>
                                    Aktuelle Liste (JSON)
                                </button>
                                <button onClick={handleExportCurrentText} className="export-btn backup-btn">
                                    <FileText size={16}/>
                                    Aktuelle Liste (Text)
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="import-section">
                <button onClick={handleImportClick} className="import-btn">
                    <Upload size={16}/>
                    Listen importieren
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileImport}
                    accept=".json"
                    style={{ display: 'none' }}
                />
            </div>

            {importStatus && (
                <div className={`import-status ${importStatus.includes('Fehler') ? 'error' : 'success'}`}>
                    {importStatus}
                </div>
            )}

            {showImportOptions && (
                <div className="import-options">
                    <h4>Import-Optionen</h4>
                    <p>Wie sollen die importierten Listen behandelt werden?</p>
                    <div className="import-buttons">
                        <button 
                            onClick={() => handleConfirmImport('append')} 
                            className="import-option-btn append">
                            Hinzufügen
                        </button>
                        {(getImportType() === 'multiple' || hasNameConflict()) && (
                            <button 
                                onClick={() => handleConfirmImport('replace')} 
                                className="import-option-btn replace">
                                {getImportType() === 'multiple' ? 'Alle Listen ersetzen' : 'Ersetzen'}
                            </button>
                        )}
                        <button 
                            onClick={handleCancelImport} 
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
                            onClick={handleConfirmReplace} 
                            className="import-option-btn replace">
                            Ja, ersetzen
                        </button>
                        <button 
                            onClick={handleCancelReplace} 
                            className="import-option-btn cancel">
                            Abbrechen
                        </button>
                    </div>
                </div>
            )}

            {showQRCode && (
                <div className="qr-modal">
                    <div className="qr-modal-content">
                        <h4>QR-Code zum Teilen</h4>
                        <p>Scannen Sie diesen QR-Code, um die Liste zu importieren:</p>
                        <div className="qr-code-container">
                            <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                        </div>
                        <div className="qr-modal-buttons">
                            <button 
                                onClick={() => setShowQRCode(false)} 
                                className="import-option-btn cancel">
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function SettingsPanelWithErrorBoundary(props) {
    return (
        <ErrorBoundary 
            componentName="SettingsPanel" 
            fallbackMessage="Die Einstellungen konnten nicht geladen werden.">
            <SettingsPanel {...props} />
        </ErrorBoundary>
    )
}