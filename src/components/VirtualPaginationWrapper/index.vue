<template>
  <div class="virtual-pagination-wrapper" :class="containerClass">
    <!-- Loading State -->
    <LoadingState 
      v-if="loading && items.length === 0"
      :is-loading="loading"
      :title="$t('loading.title')"
      :description="$t('loading.description')"
      spinner-name="dots"
    />
    
    <!-- Error State -->
    <NoResult
      v-else-if="error"
      icon="error"
      :title="$t('error.title')"
      :description="error || $t('error.description')"
    />
    
    <!-- Empty State -->
    <NoResult
      v-else-if="isEmpty"
      icon="inbox"
      :title="$t('empty.title')"
      :description="emptyMessage || $t('empty.description')"
    />
    
    <!-- Virtual Scroll -->
    <QVirtualScroll
      v-else
      ref="virtualScrollRef"
      :items="items"
      :item-height="itemHeight"
      :visible-items-count="visibleItemsCount"
      :overscan="overscan"
      :scroll-target="scrollTarget"
      class="virtual-scroll-container"
      @virtual-scroll="onVirtualScroll"
    >
      <template #default="{ item, index }">
        <div 
          :key="getItemKey(item, index)"
          :class="['virtual-item', itemClass]"
          @click="handleItemClick(item, index)"
        >
          <component
            :is="itemComponent || 'div'"
            v-bind="{ ...itemProps, item, index }"
            @error="(error: Error) => handleRenderError(error, index)"
          />
        </div>
      </template>
    </QVirtualScroll>
    
    <!-- Loading More Indicator -->
    <div v-if="loading && items.length > 0" class="loading-more">
      <q-spinner size="24px" color="primary" />
      <span class="q-ml-sm">{{ $t('loading.more') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComponentPublicInstance } from 'vue'
import { QVirtualScroll, QSpinner } from 'quasar'
import { useI18n } from 'vue-i18n'
import LoadingState from '../LoadingState.vue'
import NoResult from '../NoResult.vue'
import type { 
  VirtualPaginationWrapperProps
} from './types'

// Props definition
const props = withDefaults(defineProps<VirtualPaginationWrapperProps>(), {
  itemHeight: 50,
  visibleItemsCount: 10,
  overscan: 3,
  loading: false,
  error: null,
  emptyMessage: '',
  itemProps: () => ({}),
  containerClass: '',
  itemClass: '',
  scrollBehavior: 'smooth'
})

// Emits definition
const emit = defineEmits<{
  'scroll-end': []
  'visible-range-change': [{ startIndex: number; endIndex: number }]
  'render-error': [{ error: Error; index: number }]
  'item-click': [{ item: unknown; index: number }]
}>()

// Composables
const { t } = useI18n()

// Suppress unused variable warning for now - will be used in later tasks
void t

// Template refs
const virtualScrollRef = ref<ComponentPublicInstance | null>(null)

// Computed properties
const isEmpty = computed(() => {
  return !props.loading && !props.error && props.items.length === 0
})

// Methods
const getItemKey = (item: unknown, index: number): string | number => {
  const typedItem = item as Record<string, unknown>
  const id = typedItem.id
  const key = typedItem.key
  
  if (typeof id === 'string' || typeof id === 'number') return id
  if (typeof key === 'string' || typeof key === 'number') return key
  
  return index
}

const handleItemClick = (item: unknown, index: number) => {
  emit('item-click', { item, index })
}

const handleRenderError = (error: Error, index: number) => {
  console.error(`Render error at index ${index}:`, error)
  emit('render-error', { error, index })
}

const onVirtualScroll = (details: { 
  index: number
  from: number
  to: number
  direction: 'increase' | 'decrease'
}) => {
  // Emit visible range change event
  emit('visible-range-change', { 
    startIndex: details.from, 
    endIndex: details.to 
  })
  
  // Check if we've scrolled to the end
  const isNearEnd = details.to >= props.items.length - props.overscan
  if (isNearEnd && details.direction === 'increase') {
    emit('scroll-end')
  }
}

// Expose methods for parent components
defineExpose({
  scrollToIndex: (index: number) => {
    // Will be implemented in later tasks
    console.log('Scroll to index:', index)
  },
  scrollToTop: () => {
    // Will be implemented in later tasks
    console.log('Scroll to top')
  },
  scrollToBottom: () => {
    // Will be implemented in later tasks
    console.log('Scroll to bottom')
  }
})
</script>

<style scoped>
.virtual-pagination-wrapper {
  width: 100%;
  height: 100%;
}

.virtual-scroll-container {
  width: 100%;
  height: 100%;
}

.virtual-item {
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.virtual-item:hover {
  background-color: var(--q-color-grey-1);
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--q-color-grey-6);
}

/* Dark theme support */
.body--dark .virtual-item:hover {
  background-color: var(--q-color-grey-9);
}
</style>