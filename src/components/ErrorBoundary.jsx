import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error(`${this.props.componentName || 'Component'} Error:`, error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-fallback">
                    <h3>Etwas ist schiefgelaufen</h3>
                    <p>{this.props.fallbackMessage || 'Komponente konnte nicht geladen werden!'}</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}>
                        Erneut versuchen
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary