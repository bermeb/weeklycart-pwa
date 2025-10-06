/**
 * Reset logic utilities for WeeklyCart
 */

/**
 * Parses and validates reset time string
 * @param {string} resetTime - Time in HH:mm format
 * @returns {[number|null, number|null]} Array of [hour, minute] or [null, null] if invalid
 */
export const parseResetTime = (resetTime) => {
  const timeParts = (resetTime || '00:00').split(':')
  const resetHour = parseInt(timeParts[0], 10) || 0
  const resetMinute = parseInt(timeParts[1], 10) || 0

  if (isNaN(resetHour) || isNaN(resetMinute) ||
      resetHour < 0 || resetHour > 23 ||
      resetMinute < 0 || resetMinute > 59) {
    return [null, null]
  }

  return [resetHour, resetMinute]
}

/**
 * Determines if auto-reset should be triggered based on current time and settings
 * @param {number[]} resetDays - Array of day indices (0=Sunday, 6=Saturday)
 * @param {string} resetTime - Time in HH:mm format
 * @param {string} lastResetDate - ISO date string of last reset
 * @returns {boolean} True if reset should be triggered
 */
export const shouldTriggerReset = (resetDays, resetTime, lastResetDate) => {
  const now = new Date()
  const currentDay = now.getDay()
  const lastReset = new Date(lastResetDate)

  // Check if current day is in the reset days array
  if (!resetDays.includes(currentDay)) return false

  // Parse reset time with validation
  const [resetHour, resetMinute] = parseResetTime(resetTime)
  if (resetHour === null) return false

  // Check if current time has passed the reset time
  const resetTimeToday = new Date(now)
  resetTimeToday.setHours(resetHour, resetMinute, 0, 0)

  // Only reset if:
  // 1. Current time is past the reset time today
  // 2. Last reset was before the reset time today
  return now >= resetTimeToday && lastReset < resetTimeToday
}
