import type { Component, VNode } from 'vue'

// Main component props interface
export interface VirtualPaginationWrapperProps {
  // Данные
  items: Array<any>
  itemHeight?: number | ((index: number) => number)
  
  // Настройки виртуализации
  visibleItemsCount?: number
  overscan?: number
  
  // Состояния
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  
  // Кастомизация
  itemComponent?: Component
  itemProps?: Record<string, any>
  
  // Стили
  containerClass?: string
  itemClass?: string
  
  // Настройки скролла
  scrollTarget?: string | Element
  scrollBehavior?: 'smooth' | 'auto'
}

// Component emits interface
export interface VirtualPaginationWrapperEmits {
  'scroll-end': []
  'visible-range-change': [{ startIndex: number, endIndex: number }]
  'render-error': [{ error: Error, index: number }]
  'item-click': [{ item: any, index: number }]
}

// Virtual list item model
export interface VirtualListItem {
  id: string | number
  [key: string]: any
}

// Component state model
export interface VirtualPaginationState {
  isLoading: boolean
  error: string | null
  isEmpty: boolean
  visibleRange: {
    startIndex: number
    endIndex: number
  }
  totalItems: number
}

// Configuration model
export interface VirtualPaginationConfig {
  defaultItemHeight: number
  defaultOverscan: number
  defaultVisibleItemsCount: number
  scrollDebounceMs: number
  errorRetryAttempts: number
}

// Error display options
export interface ErrorDisplayOptions {
  showErrorBoundary: boolean
  errorComponent?: Component
  retryButton?: boolean
  errorMessage?: string
}