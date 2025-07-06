import React, { useState, useRef } from 'react'
import {Settings, FileDown} from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import AutoResetSettings from './AutoResetSettings'
import ExportSection from './ExportSection'
import ImportSection from './ImportSection'
import SettingsHeader from './SettingsHeader'
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
    const [importStatus, setImportStatus] = useState('')
    const [showImportOptions, setShowImportOptions] = useState(false)
    const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
    const [pendingImportData, setPendingImportData] = useState(null)
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
            <SettingsHeader icon={Settings} title="Einstellungen" />
            
            <AutoResetSettings
                autoReset={autoReset}
                resetDay={resetDay}
                weekDays={weekDays}
                onAutoResetChange={onAutoResetChange}
                onResetDayChange={onResetDayChange}
                onManualReset={onManualReset}
                listsCount={listsCount}
            />

            <div className="settings-divider"></div>

            <SettingsHeader icon={FileDown} title="Backup & Import" />
            
            <ExportSection
                lists={lists}
                currentList={currentList}
                onExportAllJSON={handleExportAllJSON}
                onExportAllText={handleExportAllText}
                onExportCurrentJSON={handleExportCurrentJSON}
                onExportCurrentText={handleExportCurrentText}
            />
            
            <ImportSection
                fileInputRef={fileInputRef}
                onImportClick={handleImportClick}
                onFileImport={handleFileImport}
                importStatus={importStatus}
                showImportOptions={showImportOptions}
                showReplaceConfirm={showReplaceConfirm}
                pendingImportData={pendingImportData}
                lists={lists}
                onConfirmImport={handleConfirmImport}
                onConfirmReplace={handleConfirmReplace}
                onCancelReplace={handleCancelReplace}
                onCancelImport={handleCancelImport}
            />
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