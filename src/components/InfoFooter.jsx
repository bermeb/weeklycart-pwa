import {Calendar, RefreshCw} from "lucide-react";

const InfoFooter = ({autoReset, resetDay, weekDays, listsCount, onResetCurrentList}) => {
    return (
        <div className="info-footer-container">
            <div className="info-footer">
                <Calendar size={16}/>
                <span>
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

export default InfoFooter