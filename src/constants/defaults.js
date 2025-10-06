/**
 * Default configuration values for WeeklyCart
 */

// JavaScript Date.getDay() returns: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
export const DEFAULT_RESET_DAYS = [6] // Saturday

export const DEFAULT_RESET_TIME = '00:00' // Midnight

export const WEEK_DAYS_DE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

export const DEFAULT_ITEMS = [
  { id: 1, name: 'Proteinmilch', amount: '1L', checked: false, oneTime: false },
  { id: 2, name: 'Eier', amount: '10 Stück', checked: false, oneTime: false },
  { id: 3, name: 'Putenbrustfilet', amount: '250g', checked: false, oneTime: false }
]
