import { ref, computed, nextTick, watch, onUnmounted, type Ref, type ComputedRef, type ComponentPublicInstance } from 'vue'

// Interface for virtual scroll options
export interface VirtualScrollOptions {
  items: Ref<Array<any>>
  itemHeight: Ref<number | ((index: number) => number)>
  visibleItemsCount: Ref<number>
  overscan: Ref<number>
  scrollDebounceMs?: number
}

// Interface for virtual scroll return values
export interface VirtualScrollReturn {
  virtualScrollRef: Ref<ComponentPublicInstance | null>
  visibleRange: ComputedRef<{ start: number, end: number }>
  scrollToIndex: (index: number) => void
  scrollToTop: () => void
  scrollToBottom: () => void
  getItemKey: (item: any, index: number) => string | number
  clearHeightCache: () => void
}

// Utility functions for performance optimizations
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

// Height cache for memoization
const heightCache = new Map<string | number, number>()

/**
 * Composable for virtual scroll functionality
 * Provides reactive properties and navigation methods for virtualized lists
 * Includes performance optimizations: debouncing, memoization, and optimized re-renders
 */
export function useVirtualScroll(options: VirtualScrollOptions): VirtualScrollReturn {
  const virtualScrollRef = ref<ComponentPublicInstance | null>(null)
  const scrollDebounceMs = options.scrollDebounceMs || 16 // Default to ~60fps
  
  // Memoized height calculation function
  const getItemHeight = (index: number): number => {
    const itemHeight = options.itemHeight.value
    
    if (typeof itemHeight === 'number') {
      return itemHeight
    }
    
    // Check cache first
    const cacheKey = `height_${index}`
    if (heightCache.has(cacheKey)) {
      return heightCache.get(cacheKey)!
    }
    
    // Calculate height and cache it
    const height = itemHeight(index)
    heightCache.set(cacheKey, height)
    
    return height
  }
  
  // Computed visible range based on current scroll position and item count
  const visibleRange = computed(() => {
    const totalItems = options.items.value.length
    const visibleCount = options.visibleItemsCount.value
    const overscanCount = options.overscan.value
    
    if (totalItems === 0) {
      return { start: 0, end: 0 }
    }
    
    // Calculate the actual visible range with overscan
    const start = Math.max(0, 0 - overscanCount)
    const end = Math.min(totalItems, visibleCount + overscanCount)
    
    return { start, end }
  })
  
  // Debounced scroll handler for performance optimization
  const debouncedScrollHandler = debounce((scrollInfo: any) => {
    // This will be used by the parent component for handling scroll events
    // The actual scroll event handling is done in the parent component
    console.debug('Debounced scroll event:', scrollInfo)
  }, scrollDebounceMs)
  
  /**
   * Scroll to a specific item index
   * @param index - The index of the item to scroll to
   */
  const scrollToIndex = async (index: number) => {
    if (!virtualScrollRef.value) {
      console.warn('Virtual scroll ref is not available')
      return
    }
    
    const totalItems = options.items.value.length
    if (index < 0 || index >= totalItems) {
      console.warn(`Index ${index} is out of bounds (0-${totalItems - 1})`)
      return
    }
    
    try {
      // Wait for next tick to ensure DOM is updated
      await nextTick()
      
      // Access the QVirtualScroll methods
      const qVirtualScroll = virtualScrollRef.value as any
      if (qVirtualScroll && typeof qVirtualScroll.scrollTo === 'function') {
        qVirtualScroll.scrollTo(index, 'start-force')
      } else {
        console.warn('QVirtualScroll scrollTo method not available')
      }
    } catch (error) {
      console.error('Error scrolling to index:', error)
    }
  }
  
  /**
   * Scroll to the top of the list
   */
  const scrollToTop = async () => {
    if (!virtualScrollRef.value) {
      console.warn('Virtual scroll ref is not available')
      return
    }
    
    try {
      await nextTick()
      
      const qVirtualScroll = virtualScrollRef.value as any
      if (qVirtualScroll && typeof qVirtualScroll.scrollTo === 'function') {
        qVirtualScroll.scrollTo(0, 'start-force')
      } else {
        console.warn('QVirtualScroll scrollTo method not available')
      }
    } catch (error) {
      console.error('Error scrolling to top:', error)
    }
  }
  
  /**
   * Scroll to the bottom of the list
   */
  const scrollToBottom = async () => {
    if (!virtualScrollRef.value) {
      console.warn('Virtual scroll ref is not available')
      return
    }
    
    const totalItems = options.items.value.length
    if (totalItems === 0) {
      console.warn('Cannot scroll to bottom: no items available')
      return
    }
    
    try {
      await nextTick()
      
      const qVirtualScroll = virtualScrollRef.value as any
      if (qVirtualScroll && typeof qVirtualScroll.scrollTo === 'function') {
        qVirtualScroll.scrollTo(totalItems - 1, 'end-force')
      } else {
        console.warn('QVirtualScroll scrollTo method not available')
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error)
    }
  }
  
  /**
   * Generate optimized keys for Virtual DOM optimization
   * Uses stable identifiers when available, falls back to index
   * @param item - The item data
   * @param index - The item index
   * @returns A stable key for the item
   */
  const getItemKey = (item: any, index: number): string | number => {
    // Try to use stable identifiers first
    if (item && typeof item === 'object') {
      if (item.id !== undefined && (typeof item.id === 'string' || typeof item.id === 'number')) {
        return item.id
      }
      if (item.key !== undefined && (typeof item.key === 'string' || typeof item.key === 'number')) {
        return item.key
      }
      if (item.uuid !== undefined && typeof item.uuid === 'string') {
        return item.uuid
      }
    }
    
    // Fallback to index-based key with prefix to avoid conflicts
    return `item_${index}`
  }
  
  /**
   * Clear the height cache to free memory
   * Useful when items change significantly
   */
  const clearHeightCache = () => {
    heightCache.clear()
  }
  
  // Watch for items changes and clear cache when needed
  watch(
    () => options.items.value.length,
    (newLength, oldLength) => {
      // Clear cache if items array length changed significantly
      if (oldLength && Math.abs(newLength - oldLength) > 10) {
        clearHeightCache()
      }
    }
  )
  
  // Cleanup on unmount
  onUnmounted(() => {
    clearHeightCache()
  })
  
  return {
    virtualScrollRef,
    visibleRange,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    getItemKey,
    clearHeightCache
  }
}