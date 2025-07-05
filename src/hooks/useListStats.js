import { useMemo } from 'react'

/**
 * Custom hook to calculate list statistics with memoization
 * @param {Array} lists - Array of shopping lists
 * @param {number} currentListId - ID of the currently selected list
 * @returns {Object} Object containing list stats and current list items
 */
export const useListStats = (lists, currentListId) => {
  return useMemo(() => {
    if (lists.length === 0) {
      return {
        currentList: null,
        items: [],
        checkedCount: 0,
        totalCount: 0,
        progress: 0
      }
    }
    
    const currentList = lists.find(list => list.id === currentListId) || lists[0]
    const items = currentList?.items || []
    const checkedCount = items.filter(item => item.checked).length
    const totalCount = items.length
    const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0
    
    return {
      currentList,
      items,
      checkedCount,
      totalCount,
      progress
    }
  }, [lists, currentListId])
}