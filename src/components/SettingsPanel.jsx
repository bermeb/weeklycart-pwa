import React, { useState, useRef } from 'react'
import {Calendar, RefreshCw, Settings, Download, Upload, FileText, FileDown} from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import { 
    exportListsToJSON, 
    exportListsToText, 
    exportSingleListToJSON, 
    exportSingleListToText,
    importListsFromJSON,
    processImportedData 
} from '../utils/dataExport'

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
    const [importStatus, setImportStatus] = useState('');
    const [showImportOptions, setShowImportOptions] = useState(false);
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
    const fileInputRef = useRef(null);

    const handleExportAllJSON = () => {
        exportListsToJSON(lists);
        setImportStatus('Alle Listen als JSON exportiert');
        setTimeout(() => setImportStatus(''), 3000);
    };

    const handleExportAllText = () => {
        exportListsToText(lists);
        setImportStatus('Alle Listen als Text exportiert');
        setTimeout(() => setImportStatus(''), 3000);
    };

    const handleExportCurrentJSON = () => {
        if (currentList) {
            exportSingleListToJSON(currentList);
            setImportStatus('Aktuelle Liste als JSON exportiert');
            setTimeout(() => setImportStatus(''), 3000);
        }
    };

    const handleExportCurrentText = () => {
        if (currentList) {
            exportSingleListToText(currentList);
            setImportStatus('Aktuelle Liste als Text exportiert');
            setTimeout(() => setImportStatus(''), 3000);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setImportStatus('Importiere...');
            const importedData = await importListsFromJSON(file);
            setShowImportOptions(true);
            setImportStatus('');
            
            window.pendingImport = importedData;
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`);
            setTimeout(() => setImportStatus(''), 5000);
        }
        
        event.target.value = '';
    };

    const getImportType = () => {
        if (!window.pendingImport) return 'unknown';
        return window.pendingImport.lists ? 'multiple' : 'single';
    };

    const hasNameConflict = () => {
        if (!window.pendingImport) return false;
        
        const existingNames = new Set(lists.map(list => list.name));
        
        if (window.pendingImport.lists) {
            return window.pendingImport.lists.some(list => existingNames.has(list.name));
        } else if (window.pendingImport.list) {
            return existingNames.has(window.pendingImport.list.name);
        }
        
        return false;
    };

    const handleConfirmImport = (strategy) => {
        if (strategy === 'replace') {
            setShowReplaceConfirm(true);
            return;
        }
        
        try {
            const processedLists = processImportedData(window.pendingImport, lists, strategy);
            onImportLists(processedLists);
            setImportStatus(`Listen erfolgreich ${strategy === 'replace' ? 'ersetzt' : 'hinzugefügt'}`);
            setShowImportOptions(false);
            delete window.pendingImport;
            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`);
            setTimeout(() => setImportStatus(''), 5000);
        }
    };

    const handleConfirmReplace = () => {
        try {
            const processedLists = processImportedData(window.pendingImport, lists, 'replace');
            onImportLists(processedLists);
            setImportStatus('Listen erfolgreich ersetzt');
            setShowImportOptions(false);
            setShowReplaceConfirm(false);
            delete window.pendingImport;
            setTimeout(() => setImportStatus(''), 3000);
        } catch (error) {
            setImportStatus(`Fehler beim Import: ${error.message}`);
            setTimeout(() => setImportStatus(''), 5000);
        }
    };

    const handleCancelReplace = () => {
        setShowReplaceConfirm(false);
    };

    const handleCancelImport = () => {
        setShowImportOptions(false);
        delete window.pendingImport;
        setImportStatus('');
    };
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
                    <Download size={18}/>
                    Daten Export & Import
                </h3>
            </div>

            <div className="export-buttons">
                <div className="export-section">
                    <h4 className="export-section-title">Alle Listen exportieren</h4>
                    <div className="export-button-group">
                        <button onClick={handleExportAllJSON} className="export-btn">
                            <FileDown size={16}/>
                            JSON
                        </button>
                        <button onClick={handleExportAllText} className="export-btn">
                            <FileText size={16}/>
                            Text
                        </button>
                    </div>
                </div>

                {currentList && (
                    <div className="export-section">
                        <h4 className="export-section-title">Aktuelle Liste exportieren</h4>
                        <div className="export-button-group">
                            <button onClick={handleExportCurrentJSON} className="export-btn">
                                <FileDown size={16}/>
                                JSON
                            </button>
                            <button onClick={handleExportCurrentText} className="export-btn">
                                <FileText size={16}/>
                                Text
                            </button>
                        </div>
                    </div>
                )}
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