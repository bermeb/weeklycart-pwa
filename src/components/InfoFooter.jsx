import {Calendar} from "lucide-react";

const InfoFooter = ({ autoReset, resetDay, weekDays }) => {
    return (
        <div className="info-footer">
            <Calendar size={16}/>
            <span>
                {autoReset
                ? `Liste wird automatisch jeden ${weekDays[resetDay]} zurückgesetzt`
                : 'Automatisches Zurücksetzen ist deaktiviert'
                }
            </span>
        </div>
    )
}

export default InfoFooter