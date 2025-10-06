import React from 'react'
import {Calendar, RefreshCw, Clock} from 'lucide-react'

import {DEFAULT_RESET_DAYS} from '../constants/defaults.js'

const AutoResetSettings = ({
    autoReset,
    resetDays = DEFAULT_RESET_DAYS,
    resetTime,
    weekDays,
    onAutoResetChange,
    onResetDaysChange,
    onResetTimeChange,
    onManualReset,
    listsCount
}) => {
    const toggleDay = (dayIndex) => {
        // Ensure resetDays is an array with at least one element
        const currentDays = Array.isArray(resetDays) && resetDays.length > 0 ? resetDays : DEFAULT_RESET_DAYS

        if (currentDays.includes(dayIndex)) {
            // Remove day if already selected (but keep at least one)
            if (currentDays.length > 1) {
                onResetDaysChange(currentDays.filter(d => d !== dayIndex))
            }
        } else {
            // Add day if not selected
            onResetDaysChange([...currentDays, dayIndex].sort())
        }
    }

    return (
        <>
            <div className="settings-row">
                <label className="settings-label">
                    <Calendar size={16}/>
                    Automatisches Zurücksetzen
                </label>
                <button
                    onClick={() => onAutoResetChange(!autoReset)}
                    className={`toggle ${autoReset ? 'active' : ''}`}
                    aria-label={`Automatisches Zurücksetzen ${autoReset ? 'deaktivieren' : 'aktivieren'}`}>
                    <div className="toggle-slider"/>
                </button>
            </div>

            <div className="settings-row settings-row-column">
                <label className="settings-label">
                    <Calendar size={16}/>
                    Reset-Tage wählen:
                </label>
                <div className="day-checkboxes">
                    {weekDays.map((day, index) => {
                        const currentDays = Array.isArray(resetDays) && resetDays.length > 0 ? resetDays : DEFAULT_RESET_DAYS
                        return (
                            <label key={index} className="day-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={currentDays.includes(index)}
                                    onChange={() => toggleDay(index)}
                                    disabled={!autoReset}
                                    className="day-checkbox"
                                />
                                <span className={`day-name ${!autoReset ? 'disabled' : ''}`}>{day.slice(0, 2)}</span>
                            </label>
                        )
                    })}
                </div>
            </div>

            <div className="settings-row">
                <label className="settings-label">
                    <Clock size={16}/>
                    Reset-Zeit:
                </label>
                <input
                    type="time"
                    value={resetTime}
                    onChange={(e) => onResetTimeChange(e.target.value)}
                    className="time-input"
                    disabled={!autoReset}
                    aria-label="Zeit für automatisches Zurücksetzen wählen"
                />
            </div>

            <button onClick={onManualReset} className="reset-btn" aria-label="Alle Listen jetzt zurücksetzen">
                <RefreshCw size={16}/>
                Alle Listen zurücksetzen ({listsCount})
            </button>
        </>
    )
}

export default AutoResetSettings