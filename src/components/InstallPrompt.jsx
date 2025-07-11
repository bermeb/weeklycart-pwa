import React, { useState, useEffect } from 'react'
import { Smartphone, Download, X } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        try {
            deferredPrompt.prompt()

            await deferredPrompt.userChoice
        } catch (error) {
            console.log('Install prompt error:', error)
        }

        setDeferredPrompt(null)
        setShowPrompt(false)
    }

    const handleDismiss = () => {
        setShowPrompt(false)
    }

    if (!showPrompt) return null

    return (
        <div className="install-prompt">
            <div className="install-content">
                <Smartphone size={20} />
                <span>WeeklyCart auf dem Startbildschirm installieren?</span>
            </div>
            <div className="install-actions">
                <button onClick={handleDismiss} className="dismiss-btn" aria-label="Installation später">
                    <X size={14} />
                    Später
                </button>
                <button onClick={handleInstall} className="install-btn" aria-label="App installieren">
                    <Download size={14} />
                    Installieren
                </button>
            </div>
        </div>
    )
}

export default function InstallPromptWithErrorBoundary(props) {
    return (
        <ErrorBoundary 
            componentName="InstallPrompt" 
            fallbackMessage="Die Installation konnte nicht geladen werden.">
            <InstallPrompt {...props} />
        </ErrorBoundary>
    )
}