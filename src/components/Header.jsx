import React from 'react'
import {Settings, Check, Sparkles, List, ChevronDown, Share2} from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

const Header = ({ progress, checkedCount, totalCount, currentListName, onSettingsClick, onListSelectorClick, onShareClick, hasLists }) => {
    return (
        <div className="header">
            <div className="header-content">
                <div className="header-top">
                    <div>
                        <h1 className="title">WeeklyCart</h1>
                        <p className="subtitle">Wöchentlich wiederholende Einkaufsliste</p>
                        <button onClick={onListSelectorClick} className="list-selector-btn">
                            <List size={14} />
                            <span className="current-list-name">{currentListName}</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="header-buttons">
                        <button 
                            onClick={onShareClick} 
                            className="share-btn" 
                            disabled={!hasLists}
                            aria-label="Liste teilen">
                            <Share2 size={20} />
                        </button>
                        <button onClick={onSettingsClick} className="settings-btn" aria-label="Einstellungen">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-text">
                        <span>Fortschritt</span>
                        <span className="progress-count">
                            {totalCount === 0 ? 'Keine Artikel' : `${checkedCount} von ${totalCount}`}
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{
                                width: `${Math.max(0, Math.min(100, progress || 0))}%`,
                                transition: 'width 0.5s ease'
                            }}
                        />
                    </div>
                    {progress === 100 && totalCount > 0 && (
                        <div className="complete-badge">
                            <Check size={16} />
                            <span>Alles eingekauft!</span>
                            <Sparkles size={16} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function HeaderWithErrorBoundary(props) {
    return (
        <ErrorBoundary 
            componentName="Header" 
            fallbackMessage="Die Kopfzeile konnte nicht geladen werden.">
            <Header {...props} />
        </ErrorBoundary>
    )
}