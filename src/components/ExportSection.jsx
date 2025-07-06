import React from 'react'
import {FileDown, FileText} from 'lucide-react'

const ExportSection = ({
    lists,
    currentList,
    onExportAllJSON,
    onExportAllText,
    onExportCurrentJSON,
    onExportCurrentText
}) => {
    return (
        <div className="export-buttons">
            <div className="export-section">
                <h4 className="export-section-title">Backup-Export (Datei)</h4>
                <div className="export-button-group">
                    <button 
                        onClick={onExportAllJSON} 
                        className="export-btn backup-btn"
                        disabled={lists.length === 0}>
                        <FileDown size={16}/>
                        Alle Listen (JSON)
                    </button>
                    <button 
                        onClick={onExportAllText} 
                        className="export-btn backup-btn"
                        disabled={lists.length === 0}>
                        <FileText size={16}/>
                        Alle Listen (Text)
                    </button>
                    {currentList && (
                        <>
                            <button onClick={onExportCurrentJSON} className="export-btn backup-btn">
                                <FileDown size={16}/>
                                Aktuelle Liste (JSON)
                            </button>
                            <button onClick={onExportCurrentText} className="export-btn backup-btn">
                                <FileText size={16}/>
                                Aktuelle Liste (Text)
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ExportSection