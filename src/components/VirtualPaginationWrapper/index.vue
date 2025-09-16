<template>
  <div class="virtual-pagination-wrapper" :class="containerClass">
    <!-- Loading State -->
    <LoadingState 
      v-if="loading && items.length === 0"
      :is-loading="loading"
      :title="$t('loading.title')"
      :description="$t('loading.description')"
    />
    
    <!-- Error State -->
    <NoResult
      v-else-if="error"
      icon="error"
      :title="$t('error.title')"
      :description="error"
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
  VirtualPaginationWrapperProps, 
  VirtualPaginationWrapperEmits 
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
const emit = defineEmits<VirtualPaginationWrapperEmits>()

// Composables
const { t } = useI18n()

// Template refs
const virtualScrollRef = ref<ComponentPublicInstance | null>(null)

// Computed properties
const isEmpty = computed(() => {
  return !props.loading && !props.error && props.items.length === 0
})

// Methods
const getItemKey = (item: any, index: number): string | number => {
  return item.id || item.key || index
}

const handleItemClick = (item: any, index: number) => {
  emit('item-click', { item, index })
}

const onVirtualScroll = (details: any) => {
  // This will be implemented in later tasks
  console.log('Virtual scroll event:', details)
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