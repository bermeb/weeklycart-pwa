import React, { useState, useEffect, useRef } from 'react'
import { Share2, QrCode, Copy, X } from 'lucide-react'
import ErrorBoundary from './ErrorBoundary'
import {
    shareViaWebShare,
    copyShareUrl,
    generateQRCode,
    isWebShareSupported,
    createCompressedShareData,
    generateShareUrl
} from '../utils/sharing'

const ShareModal = ({ isOpen, onClose, lists, currentListId, shareType = 'current' }) => {
    const [showQRCode, setShowQRCode] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [isGeneratingQR, setIsGeneratingQR] = useState(false)
    const [shareStatus, setShareStatus] = useState('')
    const modalRef = useRef(null)
    const firstFocusableRef = useRef(null)

    // Focus management and keyboard navigation
    useEffect(() => {
        if (isOpen) {
            // Focus the first focusable element
            setTimeout(() => {
                if (firstFocusableRef.current) {
                    firstFocusableRef.current.focus()
                }
            }, 100)
        }
    }, [isOpen])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isOpen) return

            if (event.key === 'Escape') {
                onClose()
            }

            if (event.key === 'Tab') {
                // Get all focusable elements
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
                
                if (focusableElements && focusableElements.length > 0) {
                    const firstElement = focusableElements[0]
                    const lastElement = focusableElements[focusableElements.length - 1]

                    if (event.shiftKey) {
                        // Shift + Tab
                        if (document.activeElement === firstElement) {
                            lastElement.focus()
                            event.preventDefault()
                        }
                    } else {
                        // Tab
                        if (document.activeElement === lastElement) {
                            firstElement.focus()
                            event.preventDefault()
                        }
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

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
            
            // Check if data is too large and try compressed version
            let dataToShare = shareData
            const shareUrl = generateShareUrl(shareData)
            
            if (shareUrl.length > 2000) { // Using conservative limit
                setShareStatus('Daten zu groß - verwende komprimierte Version...')
                dataToShare = createCompressedShareData(shareData)
            }
            
            if (isWebShareSupported()) {
                await shareViaWebShare(dataToShare, isSingleList)
                setShareStatus('Erfolgreich geteilt')
            } else {
                await copyShareUrl(dataToShare)
                setShareStatus('Link in die Zwischenablage kopiert')
            }
            setTimeout(() => {
                setShareStatus('')
                onClose()
            }, 2000)
        } catch (error) {
            console.log('Share error:', error)
            // Handle specific error cases
            if (error.message === 'Share too large') {
                setShareStatus('Listen zu groß zum Teilen - bitte einzelne Liste verwenden')
            } else if (error.message === 'Permission denied') {
                setShareStatus('Berechtigung verweigert - Link wird kopiert...')
                // Fallback to copy URL
                try {
                    await copyShareUrl(shareData)
                    setShareStatus('Link in die Zwischenablage kopiert')
                } catch {
                    setShareStatus('Fehler beim Kopieren des Links')
                }
            } else {
                setShareStatus(`Fehler beim Teilen: ${error.message}`)
            }
            setTimeout(() => setShareStatus(''), 5000)
        }
    }

    const handleShowQRCode = async () => {
        const shareData = getShareData()
        if (!shareData) return

        setIsGeneratingQR(true)
        
        try {
            // Try with original data first
            let dataToShare = shareData
            let qrUrl = null
            let firstError = null
            
            try {
                qrUrl = await generateQRCode(dataToShare)
            } catch (error) {
                firstError = error
            }
            
            // If first attempt failed with 'Share too large', try compressed data
            if (firstError && firstError.message === 'Share too large') {
                setShareStatus('Erstelle komprimierten QR-Code...')
                dataToShare = createCompressedShareData(shareData)
                qrUrl = await generateQRCode(dataToShare)
            } else if (firstError) {
                // Handle other errors
                console.log('QR Code error:', firstError)
                setShareStatus('Fehler beim Erstellen des QR-Codes')
                return
            }
            
            setQrCodeUrl(qrUrl)
            setShowQRCode(true)
            setShareStatus('')
        } catch (error) {
            console.log('QR Code error:', error)
            if (error.message === 'Share too large') {
                setShareStatus('Listen zu groß für QR-Code - bitte einzelne Liste verwenden')
            } else if (error.message === 'QR code service unavailable') {
                setShareStatus('QR-Code Service nicht verfügbar - bitte Link-Option verwenden')
            } else {
                setShareStatus(`QR-Code Fehler: ${error.message}`)
            }
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
        <div 
            className="modal-overlay" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            aria-describedby="share-modal-description">
            <div 
                className="modal-content" 
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}>
                <div className="modal-header">
                    <h3 id="share-modal-title">{getModalTitle()}</h3>
                    <button 
                        onClick={onClose} 
                        className="modal-close-btn"
                        aria-label="Modal schließen"
                        ref={firstFocusableRef}>
                        <X size={20} />
                    </button>
                </div>

                {!showQRCode ? (
                    <div className="share-options" id="share-modal-description">
                        <p>Wählen Sie eine Option zum Teilen:</p>
                        <button 
                            onClick={handleShare} 
                            className="share-option-btn primary"
                            aria-describedby="share-btn-description">
                            <Share2 size={16} />
                            <span>{isWebShareSupported() ? 'Teilen' : 'Link kopieren'}</span>
                        </button>
                        <div id="share-btn-description" className="sr-only">
                            {isWebShareSupported() ? 'Teilt die Liste über das System-Menü' : 'Kopiert den Share-Link in die Zwischenablage'}
                        </div>
                        
                        <button 
                            onClick={handleShowQRCode} 
                            className="share-option-btn secondary"
                            disabled={isGeneratingQR}
                            aria-describedby="qr-btn-description">
                            <QrCode size={16} />
                            <span>{isGeneratingQR ? 'Erstelle...' : 'QR-Code anzeigen'}</span>
                        </button>
                        <div id="qr-btn-description" className="sr-only">
                            Erstellt einen QR-Code zum Scannen mit dem Smartphone
                        </div>
                    </div>
                ) : (
                    <div className="qr-code-section">
                        <div className="qr-code-container">
                            <img 
                                src={qrCodeUrl} 
                                alt={`QR Code für ${getModalTitle()}`} 
                                className="qr-code-image"
                                role="img"
                                aria-describedby="qr-instructions"
                                onError={() => {
                                    setShareStatus('QR-Code konnte nicht geladen werden')
                                    setTimeout(() => setShareStatus(''), 3000)
                                }}/>
                        </div>
                        <p id="qr-instructions">Scannen Sie diesen QR-Code, um die Liste zu importieren</p>
                        <div className="qr-actions">
                            <button 
                                onClick={() => setShowQRCode(false)} 
                                className="share-option-btn secondary"
                                aria-label="Zurück zu den Teilen-Optionen">
                                <Copy size={16} />
                                Zurück zu den Optionen
                            </button>
                        </div>
                    </div>
                )}

                {shareStatus && (
                    <div 
                        className={`share-status ${shareStatus.includes('Fehler') ? 'error' : 'success'}`}
                        role={shareStatus.includes('Fehler') ? 'alert' : 'status'}
                        aria-live="polite">
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