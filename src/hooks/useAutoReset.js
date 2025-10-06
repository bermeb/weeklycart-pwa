import {useEffect} from "react"
import {shouldTriggerReset} from "../utils/resetLogic.js"


export function useAutoReset(autoReset, resetDays, resetTime, lastResetDate, onReset) {
    useEffect(() => {
        if (!autoReset || !resetDays || resetDays.length === 0) return

        const checkAutoReset = () => {
            if (shouldTriggerReset(resetDays, resetTime, lastResetDate)) {
                if (import.meta.env.DEV) {
                    console.log('Auto-reset triggered on', new Date().toISOString())
                }
                onReset()
            }
        }

        checkAutoReset()

        const interval = setInterval(checkAutoReset, 60000)

        return () => clearInterval(interval)
    }, [autoReset, resetDays, resetTime, lastResetDate, onReset])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && autoReset && resetDays && resetDays.length > 0) {
                if (shouldTriggerReset(resetDays, resetTime, lastResetDate)) {
                    if (import.meta.env.DEV) {
                        console.log('Auto-reset triggered on visibility change')
                    }
                    onReset()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [autoReset, resetDays, resetTime, lastResetDate, onReset])
}