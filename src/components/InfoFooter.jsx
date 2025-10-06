import {Calendar, RefreshCw} from "lucide-react"
import ErrorBoundary from './ErrorBoundary'

const InfoFooter = ({autoReset, resetDays = [6], resetTime, weekDays, listsCount, onResetCurrentList}) => {
    const getDaysText = () => {
        // Safeguard against empty or invalid resetDays
        const validDays = Array.isArray(resetDays) && resetDays.length > 0 ? resetDays : [6]

        if (validDays.length === 7) return 'täglich'
        if (validDays.length === 1) return `jeden ${weekDays[validDays[0]]}`

        const dayNames = validDays.map(d => weekDays[d].slice(0, 2)).join(', ')
        return `an ${dayNames}`
    }

    return (
        <div className="info-footer-container">
            <div className="info-footer">
                <Calendar size={16} className="info-footer-calender-icon"/>
                <span className="info-footer-resetday-text">
                    {autoReset
                        ? listsCount === 0
                            ? `Keine Listen - Automatisches Zurücksetzen ${getDaysText()} um ${resetTime} Uhr`
                            : `Alle ${listsCount} Listen werden automatisch ${getDaysText()} um ${resetTime} Uhr zurückgesetzt`
                        : listsCount === 0
                            ? 'Keine Listen - Automatisches Zurücksetzen deaktiviert'
                            : `${listsCount} Liste${listsCount !== 1 ? 'n' : ''} - Automatisches Zurücksetzen deaktiviert`
                    }
                </span>
            </div>

            {listsCount > 1 && (
                <div className="current-list-actions">
                    <button
                        onClick={onResetCurrentList}
                        className="reset-current-btn"
                        aria-label="Aktuelle Liste zurücksetzen">
                        <RefreshCw size={14} />
                        Aktuelle Liste zurücksetzten
                    </button>
                </div>
            )}
        </div>
    )
}

export default function InfoFooterWithErrorBoundary(props) {
    return (
        <ErrorBoundary 
            componentName="InfoFooter" 
            fallbackMessage="Die Fußzeile konnte nicht geladen werden.">
            <InfoFooter {...props} />
        </ErrorBoundary>
    )
}