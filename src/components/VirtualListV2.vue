<script setup lang="ts">
import { ref, watch } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import type { ComponentPublicInstance } from 'vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

interface Props {
  items: unknown[]
  keyField?: string
  minItemSize?: number
  pageMode?: boolean
  buffer?: number
  loadOffset?: number
  loading?: boolean
  hasMore?: boolean
  itemTag?: string
  gap?: number
  sizeDependencies?: (item: unknown) => unknown
}

const props = withDefaults(defineProps<Props>(), {
  keyField: 'documentId',
  minItemSize: 120,
  pageMode: true,
  buffer: 200,
  loadOffset: 300,
  loading: false,
  hasMore: true,
  itemTag: 'div',
  gap: 0,
})

const emit = defineEmits<{ 'load-more': [] }>()

const scrollerRef = ref<ComponentPublicInstance | null>(null)
const isAwaitingLoad = ref(false)

watch(
  () => props.loading,
  (loading) => {
    if (!loading) isAwaitingLoad.value = false
  },
)

const maybeLoadMore = () => {
  if (props.loading || isAwaitingLoad.value || !props.hasMore) return
  isAwaitingLoad.value = true
  emit('load-more')
}

/**
 * update(startIndex, endIndex, visibleStartIndex, visibleEndIndex)
 * endIndex включает buffer-зону, visibleEndIndex — only the visible items.
 */
const onUpdate = (
  _startIndex: number,
  endIndex: number,
  _visibleStartIndex: number,
  visibleEndIndex: number,
) => {
  if (!props.hasMore || props.loading || isAwaitingLoad.value) return

  // Threshold in pixels (approximately) through minItemSize:
  const aheadItems = Math.max(3, Math.ceil(props.loadOffset / props.minItemSize))

  // I would rely on endIndex (with buffer), this gives early loading
  const thresholdIndex = props.items.length - 1 - aheadItems

  if (endIndex >= thresholdIndex || visibleEndIndex >= thresholdIndex) {
    maybeLoadMore()
  }
}

const resolveSizeDependencies = (item: unknown) => {
  if (!props.sizeDependencies) return []
  const deps = props.sizeDependencies(item)
  return Array.isArray(deps) ? deps : [deps]
}

const scrollToIndex = (index: number) => {
  const scroller = scrollerRef.value as
    | (ComponentPublicInstance & { scrollToItem?: (index: number) => void })
    | null
  scroller?.scrollToItem?.(index)
}

defineExpose({ scrollToIndex })
</script>

<template>
  <DynamicScroller
    ref="scrollerRef"
    class="virtual-list"
    :items="items"
    :key-field="keyField"
    :min-item-size="minItemSize"
    :page-mode="pageMode"
    :buffer="buffer"
    :emit-update="true"
    @update="onUpdate"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem
        :item="item"
        :active="active"
        :data-index="index"
        :size-dependencies="resolveSizeDependencies(item)"
        :tag="itemTag"
        class="virtual-list__item"
        :style="{ paddingBottom: `${gap}px` }"
      >
        <slot :item="item" :index="index" />
      </DynamicScrollerItem>
    </template>

    <template #after>
      <div v-if="loading && items.length" class="virtual-list__loader flex items-center justify-center">
        <slot name="loader">
          <q-spinner-dots color="primary" size="md" />
        </slot>
      </div>

      <div v-if="!loading && !items.length" class="virtual-list__empty">
        <slot name="empty" />
      </div>

      <div v-if="!hasMore && items.length" class="virtual-list__end">
        <slot name="end" />
      </div>
    </template>
  </DynamicScroller>
</template>
