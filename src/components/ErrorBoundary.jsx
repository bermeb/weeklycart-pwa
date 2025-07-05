import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo })

        const errorDetails = {
            component: this.props.componentName || 'Unknown Component',
            error: error.message,
            stack: error.stack,
            errorInfo: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        }
        
        console.error('ErrorBoundary caught an error:', errorDetails)

        if (this.props.onError) {
            this.props.onError(error, errorInfo, errorDetails)
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback" role="alert" aria-live="polite">
                    <h3>Etwas ist schiefgelaufen</h3>
                    <p>{this.props.fallbackMessage || 'Komponente konnte nicht geladen werden!'}</p>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                        aria-label="Komponente neu laden">
                        Erneut versuchen
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <details style={{ marginTop: '10px', fontSize: '0.8em' }}>
                            <summary>Error Details (Dev Mode)</summary>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.7em' }}>
                                {this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary