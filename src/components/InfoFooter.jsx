import {Calendar, RefreshCw} from "lucide-react"
import ErrorBoundary from './ErrorBoundary'

const InfoFooter = ({autoReset, resetDay, weekDays, listsCount, onResetCurrentList}) => {
    return (
        <div className="info-footer-container">
            <div className="info-footer">
                <Calendar size={16} className="info-footer-calender-icon"/>
                <span className="info-footer-resetday-text">
                    {autoReset
                        ? `Alle ${listsCount} Listen werden automatisch jeden ${weekDays[resetDay]} zurückgesetzt`
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