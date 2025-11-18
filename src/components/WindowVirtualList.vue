<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useVirtualizer } from '@tanstack/vue-virtual'

interface Props {
  items: unknown[]
  loading?: boolean
  hasMore?: boolean
  itemHeight?: number
  overscan?: number
  loadThreshold?: number
  columns?: number
  gap?: number
  selector?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasMore: true,
  itemHeight: 50,
  overscan: 10,
  loadThreshold: 200,
  columns: 1,
  gap: 0,
  selector: '#q-app',
})

const emit = defineEmits<{
  'load-more': []
}>()

/**
 * Reference to scroll container
 */
const scrollElement = ref<HTMLElement | null>(null)

/**
 * Flag to prevent multiple simultaneous load-more calls
 */
const isLoadingMore = ref(false)

/**
 * Group items into rows for grid layout
 */
const rows = computed(() => {
  const result = []
  for (let i = 0; i < props.items.length; i += props.columns) {
    result.push(props.items.slice(i, i + props.columns))
  }
  return result
})

/**
 * Virtualize list relative to a specific container
 */
const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: rows.value.length,
    estimateSize: () => props.itemHeight + props.gap,
    overscan: props.overscan,
    getScrollElement: () => scrollElement.value,
  })),
)

/**
 * Trigger load more
 */
const triggerLoadMore = () => {
  if (props.loading || !props.hasMore || isLoadingMore.value) return

  isLoadingMore.value = true
  emit('load-more')

  // Reset flag after a short delay
  setTimeout(() => {
    isLoadingMore.value = false
  }, 500)
}

/**
 * Handle scroll to detect when to load more
 */
const handleScroll = () => {
  if (!scrollElement.value || props.loading || !props.hasMore) return

  const scrollTop = scrollElement.value.scrollTop
  const scrollHeight = scrollElement.value.scrollHeight
  const clientHeight = scrollElement.value.clientHeight

  // Trigger load more when user is near bottom
  if (scrollTop + clientHeight >= scrollHeight - props.loadThreshold) {
    triggerLoadMore()
  }
}

/**
 * Watch virtual items to trigger load more
 */
watch(
  () => rowVirtualizer.value.getVirtualItems(),
  (virtualItems) => {
    if (!virtualItems.length || props.loading || !props.hasMore) return

    const lastRow = virtualItems[virtualItems.length - 1]
    const buffer = props.overscan * 2

    // Load more when last rendered row is close to end
    if (lastRow && lastRow.index >= rows.value.length - buffer) {
      triggerLoadMore()
    }
  },
  { deep: true }
)

/**
 * Get reference to #q-app on mount and setup scroll listener
 */
onMounted(() => {
  scrollElement.value = document.querySelector(props.selector)

  if (scrollElement.value) {
    scrollElement.value.addEventListener('scroll', handleScroll, { passive: true })
  }
})

/**
 * Cleanup scroll listener
 */
onUnmounted(() => {
  if (scrollElement.value) {
    scrollElement.value.removeEventListener('scroll', handleScroll)
  }
})

defineExpose({
  triggerLoadMore,
})
</script>

<template>
  <div>
    <div
      v-if="items.length > 0"
      :style="{
        height: rowVirtualizer.getTotalSize() + 'px',
        width: '100%',
        position: 'relative'
      }"
    >
      <div
        v-for="virtualRow in rowVirtualizer.getVirtualItems()"
        :key="`virtual-row-${virtualRow.key}`"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${itemHeight}px`,
          transform: `translateY(${virtualRow.start}px)`
        }"
        class="virtual-row"
      >
        <div
          class="virtual-row-content"
          :style="{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: `${gap}px`,
            height: '100%'
          }"
        >
          <div
            v-for="(item, colIndex) in rows[virtualRow.index]"
            :key="`item-${virtualRow.index}-${colIndex}`"
            class="grid-item"
          >
            <slot
              :item="item"
              :index="virtualRow.index * columns + colIndex"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading-indicator">
      <q-spinner color="primary" size="40px" />
    </div>

    <!-- End of list message -->
    <div v-else-if="!hasMore && items.length > 0" class="end-message">
      <slot name="end">
        <!-- No more items -->
      </slot>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && items.length === 0" class="empty-state">
      <slot name="empty">
        <!-- No items found -->
      </slot>
    </div>
  </div>
</template>

<style scoped>
.virtual-row {
  display: block;
  width: 100%;
}

.virtual-row-content {
  width: 100%;
  height: 100%;
  align-items: start;
}

.grid-item {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.grid-item :deep(> *) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.loading-indicator,
.end-message,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.end-message,
.empty-state {
  color: var(--q-color-grey-6);
  font-size: 14px;
}
</style>
