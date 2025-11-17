<template>
  <InfiniteScrollWrapper
    class="feed-grid"
    :offset="offset"
    :loading="loading"
    :stop="computedStop"
    @load-more="handleLoadMore"
  >
    <template v-for="(item, index) in items" :key="getItemKey(item, index)">
      <slot :item="item" :index="index" :selectItem="selectItem" />
    </template>
  </InfiniteScrollWrapper>

  <div
    v-show="selectedItem"
    class="feed-single bg-block"
    :style="singleStyle"
    v-touch-pan.right.prevent.mouse="handleSwipePan"
  >
    <div class="single-view-container">
      <FeedItemCard
        v-for="(item, index) in items"
        :key="`feed-single-${index}`"
        :item="item"
        view-mode="single"
        :class="{ active: item.documentId === selectedItem?.documentId }"
        @click="selectItem"
      />
    </div>
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
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';
import type { IPortfolio } from 'src/interfaces/portfolio';

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

const computedStop = computed(() => props.stop || !props.hasMore);
const { items } = toRefs(props);

const selectedItem = ref<IPortfolio | null>(null);

const SWIPE_CLOSE_THRESHOLD = 120;
const MAX_OPACITY_DISTANCE = 340;
const OPACITY_START_DISTANCE = 150;
const isSwiping = ref(false);
const swipeOffset = ref({ x: 0, y: 0 });

interface TouchPanPayload {
  evt: Event;
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

const selectItem = (item: IPortfolio) => {
  if (selectedItem.value?.documentId !== item.documentId) {
    selectedItem.value = item;
    setTimeout(() => {
      const element = document.querySelector('.single-view-container .active');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

const handleLoadMore = () => {
  if (selectedItem.value) return;
  emit('load-more');
};

const getItemKey = (item: IPortfolio, index: number) =>
  item.documentId || `portfolio-item-${index}`;

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
  padding-bottom: 130px;
  padding-left: 16px;
  padding-right: 16px;
  box-sizing: border-box;
  touch-action: pan-y;
  will-change: transform;
  border-radius: 50px;
  z-index: 2;
}

.single-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-padding-block: 40vh;
  scroll-behavior: smooth;

  .feed-item-card.single-view {
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  .feed-item-card {
    &.active {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
