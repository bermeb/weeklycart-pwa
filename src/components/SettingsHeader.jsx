import React from 'react'

const SettingsHeader = ({ icon: Icon, title }) => {
    return (
        <div className="settings-header">
            <h3 className="settings-title">
                {Icon && <Icon size={18}/>}
                {title}
            </h3>
        </div>
    )
}

export default SettingsHeader