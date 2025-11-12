<template>
  <q-page class="page feed-page q-pb-xl q-pt-lg flex column items-center">
    <div class="container full-width">
      <!-- Loading State -->
      <LoadingState
        v-if="isLoadingPortfolios && !portfolios.length"
        :is-loading="isLoadingPortfolios"
        title="Loading feed..."
        description="Please wait while we fetch the latest portfolio items"
        spinner-name="dots"
      />

      <!-- Feed Content - Tile View -->
      <InfiniteScrollWrapper
        v-else-if="portfolios.length > 0"
        class="feed-grid"
        :offset="250"
        :loading="isLoadingPortfolios"
        :stop="!hasMorePortfolios"
        @load-more="loadMorePortfolios"
      >
        <FeedItemCard
          v-for="(item, index) in portfolios"
          :key="`feed-item-${index}`"
          :item="item"
          view-mode="tile"
          @click="selectItem"
        />
      </InfiniteScrollWrapper>

      <!-- No Results -->
      <NoResult
        v-else
        icon="photo_library"
        title="No portfolio items yet"
        description="Start exploring artists and shops to see their work here"
        no-btn
      />

      <!-- Feed Content - Single View -->
      <div
        v-show="selectedItem"
        class="feed-single bg-block"
        :style="singleStyle"
        @pointerdown="handlePointerDown"
      >
        <div class="single-view-container">
          <FeedItemCard
            v-for="(item, index) in portfolios"
            :key="`feed-single-${index}`"
            :item="item"
            view-mode="single"
            :class="{ active: item.documentId === selectedItem?.documentId }"
            @click="selectItem"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, onBeforeUnmount, watch, computed } from 'vue';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import { NoResult, LoadingState } from 'src/components';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';
import usePortfolios from 'src/composables/usePortfolios';
import type { IPortfolio } from 'src/interfaces/portfolio';

const {
  portfolios,
  isLoadingPortfolios,
  hasMorePortfolios,
  fetchPortfolios,
} = usePortfolios();

const selectedItem = ref<IPortfolio | null>(null);

const SWIPE_CLOSE_THRESHOLD = 120;
const MAX_OPACITY_DISTANCE = 340;
const isPointerDown = ref(false);
const isSwiping = ref(false);
const swipeOffset = ref(0);
let startX = 0;
let startY = 0;

const singleStyle = computed(() => {
  const opacity =
    swipeOffset.value > 0
      ? Math.max(0.05, 1 - swipeOffset.value / MAX_OPACITY_DISTANCE)
      : 1;

  return {
    transform: `translateX(${swipeOffset.value}px)`,
    transition: isSwiping.value ? 'none' : 'transform 0.2s ease',
    opacity,
  };
});

const handlePointerMove = (event: PointerEvent) => {
  if (!isPointerDown.value) return;
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;

  if (!isSwiping.value) {
    if (Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.value = true;
    } else {
      return;
    }
  }

  if (deltaX <= 0) {
    swipeOffset.value = 0;
    return;
  }

  swipeOffset.value = deltaX;
  event.preventDefault();
};

const removePointerListeners = () => {
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', handlePointerEnd);
  window.removeEventListener('pointercancel', handlePointerEnd);
};

const resetSwipeState = () => {
  isPointerDown.value = false;
  isSwiping.value = false;
  swipeOffset.value = 0;
  removePointerListeners();
};

const handlePointerEnd = () => {
  if (!isPointerDown.value) return;
  const shouldClose = swipeOffset.value > SWIPE_CLOSE_THRESHOLD;
  resetSwipeState();
  if (shouldClose) {
    selectedItem.value = null;
  }
};

const handlePointerDown = (event: PointerEvent) => {
  if (!selectedItem.value) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  const targetElement = event.target instanceof Element ? event.target : null;
  if (targetElement?.closest('.image-carousel')) {
    return;
  }

  startX = event.clientX;
  startY = event.clientY;
  isPointerDown.value = true;
  isSwiping.value = false;
  swipeOffset.value = 0;
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerEnd);
  window.addEventListener('pointercancel', handlePointerEnd);
};

const selectItem = (item: IPortfolio) => {
  if (selectedItem.value?.documentId === item.documentId) {
    // Toggle off if clicking the same item
    selectedItem.value = null;
  } else {
    selectedItem.value = item;
    // Scroll to the selected item smoothly
    setTimeout(() => {
      const element = document.querySelector('.single-view-container .active');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
};

const loadMorePortfolios = () => {
  if (!selectedItem.value) {
    fetchPortfolios();
  }
};

const initializeFeed = () => {
  if (!portfolios.value.length) {
    fetchPortfolios();
  }
};

// Watch for route changes to close detail view
watch(
  () => selectedItem.value,
  (newValue) => {
    if (newValue) {
      // Disable infinite scroll when in single view
    } else {
      resetSwipeState();
    }
  },
);

onBeforeMount(() => {
  initializeFeed();
});

onBeforeUnmount(() => {
  resetSwipeState();
});
</script>

<style scoped lang="scss">
.feed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.feed-title {
  font-size: 20px;
  font-weight: 700;
}

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
  width: 100%;
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
