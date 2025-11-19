<template>
  <!-- Grid view -->
  <VirtualList
    :items="items"
    :loading="loading"
    :hasMore="hasMore"
    :itemHeight="200"
    :columns="2"
    :gap="12"
    :overscan="3"
    :loadThreshold="400"
    @load-more="handleLoadMore"
  >
    <template #default="{ item, index }">
      <slot :item="item" :index="index" :selectItem="selectItem" />
    </template>
  </VirtualList>

  <!-- Single view -->
  <div
    v-show="selectedItem"
    ref="singleViewRef"
    class="feed-single bg-block"
    data-no-pull-refresh
    :style="singleStyle"
    v-touch-pan.right.prevent.mouse="handleSwipePan"
  >
    <VirtualList
      :items="items"
      :loading="loading"
      :hasMore="hasMore"
      :itemHeight="400"
      dynamic-height
      :columns="1"
      :gap="16"
      :overscan="2"
      selector=".feed-single"
      @load-more="handleLoadMore"
    >
      <template #default="{ item }">
        <FeedItemCard
          :item="asPortfolio(item)"
          view-mode="single"
          @click="selectItem(item)"
        />
      </template>
    </VirtualList>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  onBeforeUnmount,
  toRefs,
} from 'vue';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import type { IPortfolio } from 'src/interfaces/portfolio';
import VirtualList from 'src/components/VirtualList.vue';

const props = withDefaults(
  defineProps<{
    items: IPortfolio[];
    loading?: boolean;
    hasMore?: boolean;
    stop?: boolean;
    offset?: number;
  }>(),
  {
    loading: false,
    hasMore: true,
    stop: false,
    offset: 250,
  },
);

const emit = defineEmits<{ (event: 'load-more'): void }>();

const { items } = toRefs(props);

const selectedItem = ref<IPortfolio | null>(null);
const singleViewRef = ref<HTMLElement | null>(null);

const SWIPE_CLOSE_THRESHOLD = 120;
const MAX_OPACITY_DISTANCE = 340;
const OPACITY_START_DISTANCE = 150;
const isSwiping = ref(false);
const swipeOffset = ref({ x: 0, y: 0 });

interface TouchPanPayload {
  evt?: Event;
  offset?: { x?: number; y?: number };
  isFirst?: boolean;
  isFinal?: boolean;
}

const MIN_SCALE = 0.7;

const singleStyle = computed(() => {
  const offsetX = swipeOffset.value.x;
  const offsetY = swipeOffset.value.y;
  const progression =
    offsetX <= OPACITY_START_DISTANCE
      ? 0
      : Math.min(
          1,
          (offsetX - OPACITY_START_DISTANCE) /
            (MAX_OPACITY_DISTANCE - OPACITY_START_DISTANCE),
        );
  const opacity = 1 - progression * 0.95;
  const scale = 1 - progression * (1 - MIN_SCALE);

  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    transition: isSwiping.value ? 'none' : 'transform 0.2s ease',
    opacity: Math.max(0.05, opacity),
  };
});

const resetSwipeState = () => {
  isSwiping.value = false;
  swipeOffset.value = { x: 0, y: 0 };
};

const handleSwipePan = (payload: TouchPanPayload) => {
  if (!selectedItem.value) {
    resetSwipeState();
    return false;
  }

  const targetElement =
    payload.evt?.target instanceof Element ? payload.evt.target : null;

  if (payload.isFirst) {
    if (targetElement?.closest('.image-carousel')) {
      resetSwipeState();
      return false;
    }

    isSwiping.value = true;
    swipeOffset.value = { x: 0, y: 0 };
  }

  if (payload.isFinal) {
    const finalOffset = Math.max(
      0,
      payload.offset?.x ?? swipeOffset.value.x,
    );
    const shouldClose = finalOffset > SWIPE_CLOSE_THRESHOLD;
    resetSwipeState();
    if (shouldClose) {
      selectedItem.value = null;
    }
    return true;
  }

  swipeOffset.value = {
    x: Math.max(0, payload.offset?.x ?? 0),
    y: payload.offset?.y ?? swipeOffset.value.y,
  };
  return true;
};

const asPortfolio = (item: unknown): IPortfolio => item as IPortfolio;

const selectItem = (item: unknown) => {
  const portfolio = asPortfolio(item);
  if (selectedItem.value?.documentId !== portfolio.documentId) {
    selectedItem.value = portfolio;

    // Scroll to item position in virtualized list
    setTimeout(() => {
      if (!singleViewRef.value) return;

      const itemIndex = items.value.findIndex(
        (i) => i.documentId === portfolio.documentId,
      );

      if (itemIndex !== -1) {
        // Calculate approximate scroll position
        // itemHeight (700) + gap (16)
        const itemHeight = 700 + 16;
        const scrollPosition = itemIndex * itemHeight;

        singleViewRef.value.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  }
};

const handleLoadMore = () => {
  emit('load-more');
};

const forceCloseSingleView = () => {
  resetSwipeState();
  selectedItem.value = null;
};

watch(selectedItem, (newValue) => {
  if (!newValue) {
    resetSwipeState();
  }
});

onBeforeUnmount(() => {
  resetSwipeState();
});

defineExpose({
  forceCloseSingleView,
});
</script>

<style scoped lang="scss">
.feed-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
  align-items: start;
  grid-auto-rows: auto;
}

.feed-single {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top);
  padding-top: 16px;
  padding-bottom: 130px;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
  touch-action: pan-y;
  border-radius: 16px;
  will-change: transform;
  z-index: 2;

  // Styles for virtual list items in single view
  :deep(.feed-item-card) {
    &.active {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
