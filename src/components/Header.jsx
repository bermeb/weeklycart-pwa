import React from 'react'
import { Settings, Check} from 'lucide-react'

const Header = ({ progress, checkedCount, totalCount, onSettingsClick }) => {
    return (
        <div className="header">
            <div className="header-content">
                <div className="header-top">
                    <div>
                        <h1 className="title">WeeklyCart</h1>
                        <p className="subtitle">Wöchentlich wiederholende Einkaufsliste</p>
                    </div>
                    <button onClick={onSettingsClick} className="settings-btn" aria-label="Einstellungen">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="progress-section">
                    <div className="progress-text">
                        <span>Fortschritt</span>
                        <span className="progess-count">{checkedCount} von {totalCount}</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progess-fill"
                            style={{ width: `${progress}%` }}/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header