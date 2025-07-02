import React from 'react'
import { Calendar, RefreshCw, Settings } from 'lucide-react'

const SettingsPanel = ({
    autoReset,
    resetDay,
    weekDays,
    nextResetDate,
    onAutoResetChange,
    onResetDayChange,
    onManualReset
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
                    aria-label={`Automatisches Zurücksetzen ${autoReset ? 'deaktivieren' : 'akrtivieren'}`}>
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

            {autoReset && (
                <div className="next-reset-card">
                    <div className="next-reset-icon">
                        <Calendar size={24}/>
                    </div>
                    <div className="next-reset-content">
                        <span className="next-reset-label">Nächster Reset</span>
                        <span className="next-reset-date">{nextResetDate}</span>
                    </div>
                </div>
            )}

            <button onClick={onManualReset} className="reset-btn" aria-label="Liste jetzt zurücksetzten">
                <RefreshCw size={16}/>
                Jetzt Liste zurücksetzten
            </button>
        </div>
    )
}

export default SettingsPanel