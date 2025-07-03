import React from 'react'
import {Calendar, RefreshCw, Settings} from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

const SettingsPanel = ({
                           autoReset,
                           resetDay,
                           weekDays,
                           onAutoResetChange,
                           onResetDayChange,
                           onManualReset,
                           listsCount
                       }) => {
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