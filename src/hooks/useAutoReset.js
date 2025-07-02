import {useEffect} from "react";


export function useAutoReset(autoReset, resetDay, lastResetDate, onReset) {
    useEffect(() => {
        if (!autoReset) return

        const checkAutoReset = () => {
            const today = new Date()
            const currentDay = today.getDay()
            const lastReset = new Date(lastResetDate)

            // Calculate days since last reset
            const daysDiff = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24))

            if (currentDay === resetDay && daysDiff >= 6) {
                console.log('Auto-reset triggered on', today.toDateString())
                onReset()
            }
        }

        checkAutoReset()

        const interval = setInterval(checkAutoReset, 60000)

        return () => clearInterval(interval)
    }, [autoReset, resetDay, lastResetDate, onReset])

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && autoReset) {
                const today = new Date()
                const currentDay = today.getDay()
                const lastReset = new Date(lastResetDate)
                const daysDiff = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24))

                if (currentDay === resetDay && daysDiff >= 6) {
                    console.log('Auto-reset triggered on visibility change')
                    onReset()
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [autoReset, resetDay, lastResetDate, onReset])
}