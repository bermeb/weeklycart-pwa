import React, { useState } from 'react'
import { Share2, QrCode, Copy, X } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import {
    shareViaWebShare,
    copyShareUrl,
    generateQRCode,
    isWebShareSupported
} from '../utils/sharing'

const ShareModal = ({ isOpen, onClose, lists, currentListId, shareType = 'current' }) => {
    const [showQRCode, setShowQRCode] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [isGeneratingQR, setIsGeneratingQR] = useState(false)
    const [shareStatus, setShareStatus] = useState('')

    if (!isOpen) return null

    const currentList = lists.find(list => list.id === currentListId)

    const getShareData = () => {
        if (shareType === 'current' && currentList) {
            return {
                version: '1.0',
                exportDate: new Date().toISOString(),
                list: {
                    name: currentList.name,
                    items: currentList.items.map(item => ({
                        name: item.name,
                        amount: item.amount
                    }))
                }
            }
        } else if (shareType === 'all') {
            return {
                version: '1.0',
                exportDate: new Date().toISOString(),
                lists: lists.map(list => ({
                    name: list.name,
                    items: list.items.map(item => ({
                        name: item.name,
                        amount: item.amount
                    }))
                }))
            }
        }
        return null
    }

    const handleShare = async () => {
        const shareData = getShareData()
        if (!shareData) return

        try {
            const isSingleList = shareType === 'current'
            if (isWebShareSupported()) {
                await shareViaWebShare(shareData, isSingleList)
                setShareStatus('Erfolgreich geteilt')
            } else {
                await copyShareUrl(shareData)
                setShareStatus('Link in die Zwischenablage kopiert')
            }
            setTimeout(() => {
                setShareStatus('')
                onClose()
            }, 2000)
        } catch (error) {
            setShareStatus(`Fehler beim Teilen: ${error.message}`)
            setTimeout(() => setShareStatus(''), 3000)
        }
    }

    const handleShowQRCode = async () => {
        const shareData = getShareData()
        if (!shareData) return

        setIsGeneratingQR(true)
        
        try {
            const qrUrl = await generateQRCode(shareData)
            setQrCodeUrl(qrUrl)
            setShowQRCode(true)
        } catch (error) {
            setShareStatus(`QR-Code Fehler: ${error.message}`)
            setTimeout(() => setShareStatus(''), 5000)
        } finally {
            setIsGeneratingQR(false)
        }
    }

    const getModalTitle = () => {
        if (shareType === 'current') {
            return `${currentList?.name || 'Liste'} teilen`
        }
        return 'Alle Listen teilen'
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{getModalTitle()}</h3>
                    <button onClick={onClose} className="modal-close-btn">
                        <X size={20} />
                    </button>
                </div>

                {!showQRCode ? (
                    <div className="share-options">
                        <button onClick={handleShare} className="share-option-btn primary">
                            <Share2 size={16} />
                            <span>{isWebShareSupported() ? 'Teilen' : 'Link kopieren'}</span>
                        </button>
                        
                        <button 
                            onClick={handleShowQRCode} 
                            className="share-option-btn secondary"
                            disabled={isGeneratingQR}
                        >
                            <QrCode size={16} />
                            <span>{isGeneratingQR ? 'Erstelle...' : 'QR-Code anzeigen'}</span>
                        </button>
                    </div>
                ) : (
                    <div className="qr-code-section">
                        <div className="qr-code-container">
                            <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                        </div>
                        <p>Scannen Sie diesen QR-Code, um die Liste zu importieren</p>
                        <button 
                            onClick={() => setShowQRCode(false)} 
                            className="share-option-btn secondary"
                        >
                            <Copy size={16} />
                            Zurück zu den Optionen
                        </button>
                    </div>
                )}

                {shareStatus && (
                    <div className={`share-status ${shareStatus.includes('Fehler') ? 'error' : 'success'}`}>
                        {shareStatus}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ShareModalWithErrorBoundary(props) {
    return (
        <ErrorBoundary 
            componentName="ShareModal" 
            fallbackMessage="Das Teilen-Fenster konnte nicht geladen werden.">
            <ShareModal {...props} />
        </ErrorBoundary>
    )
}