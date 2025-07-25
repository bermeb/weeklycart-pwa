import { useState } from "react"

export function useLocalStorage(key, initialValue) {
    // State to store our value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            // Get from local storage
            const item = window.localStorage.getItem(key)
            // Parse stored json or return initialValue if item is null
            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error)
            return initialValue
        }
    })

    // Return a wrapped version of useState's setter function that persists the new value to localStorage
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have the same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value
            setStoredValue(valueToStore)
            window.localStorage.setItem(key, JSON.stringify(valueToStore))
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error)
        }
    }

    return [storedValue, setValue]
}