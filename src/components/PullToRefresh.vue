<template>
  <div
    class="pull-to-refresh"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull to refresh indicator -->
    <div
      v-if="isPulling"
      class="pull-indicator bg-block z-max"
      :style="{
        opacity: pullOpacity,
        transform: `translateY(${pullVerticalOffset}px) rotate(${pullRotation}deg)`,
      }"
    >
      <q-icon name="refresh" size="32px" color="primary" />
    </div>

    <slot />

    <!-- Loading overlay with spinner -->
    <div v-if="isReloading" class="reload-overlay">
      <div class="flex column items-center q-gap-sm">
        <q-spinner size="sm" color="primary" />
        <p class="reload-text">{{ reloadText }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';

interface TouchPosition {
  x: number;
  y: number;
}

// Animation and behavior constants
const ANIMATION_CONFIG = {
  // Opacity animation
  OPACITY_MAX_DISTANCE: 500,
  OPACITY_THRESHOLD: 50, // Opacity starts appearing earlier

  // Rotation animation
  ROTATION_MAX_DEGREES: 100, // 360 / 100 for slower rotation
  ROTATION_MAX_DISTANCE: 150,

  // Movement animation
  MOVE_MULTIPLIER: 0.5, // How much icon moves relative to swipe distance (increased for better visibility)
  MAX_MOVE_DISTANCE: 100, // Maximum pixels icon can move down (increased)

  // Timing
  RELOAD_DELAY: 500, // Delay before actual reload
} as const;

const props = defineProps({
  reloadText: {
    type: String,
    default: 'Reloading...',
  },
  swipeThreshold: {
    type: Number,
    default: 320, // Minimum vertical distance in pixels for swipe (ещё больше для меньшей чувствительности)
  },
  maxStartPosition: {
    type: Number,
    default: Number.POSITIVE_INFINITY, // Maximum Y position where swipe can start (defaults to full screen)
  },
  minVerticalRatio: {
    type: Number,
    default: 2, // Minimum ratio of vertical to horizontal movement
  },
});

const isReloading = ref(false);
const isPulling = ref(false);
const pullDistance = ref(0);
const touchStart = reactive<TouchPosition>({ x: 0, y: 0 });
const touchCurrent = reactive<TouchPosition>({ x: 0, y: 0 });
const touchStartTime = ref(0);
const isSwiping = ref(false);

const pageHasScroll = () => {
  const root = document.querySelector('#q-app');

  if (!root) {
    return false;
  }

  const scrollOffset = Math.max(window.scrollY ?? 0, window.pageYOffset ?? 0, root.scrollTop ?? 0);

  return scrollOffset > 0;
};

// Computed properties for pull indicator animation
const pullOpacity = computed(() => {
  const opacity = Math.min(
    (pullDistance.value - ANIMATION_CONFIG.OPACITY_THRESHOLD) /
      (ANIMATION_CONFIG.OPACITY_MAX_DISTANCE - ANIMATION_CONFIG.OPACITY_THRESHOLD),
    1,
  );
  return Math.max(0, opacity);
});

const pullRotation = computed(() => {
  return (
    (pullDistance.value / ANIMATION_CONFIG.ROTATION_MAX_DISTANCE) *
    ANIMATION_CONFIG.ROTATION_MAX_DEGREES
  );
});

const pullVerticalOffset = computed(() => {
  return Math.min(
    pullDistance.value * ANIMATION_CONFIG.MOVE_MULTIPLIER,
    ANIMATION_CONFIG.MAX_MOVE_DISTANCE,
  );
});

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1 || isReloading.value) return;

  // Check if the touch started on an element that should prevent pull-to-refresh
  const target = event.target as Element;
  if (target.closest && target.closest('[data-no-pull-refresh]')) {
    return;
  }

  if (pageHasScroll()) {
    isSwiping.value = false;
    isPulling.value = false;
    pullDistance.value = 0;
    return;
  }

  const touch = event.touches[0];
  touchStart.x = touch.clientX;
  touchStart.y = touch.clientY;
  touchCurrent.x = touch.clientX;
  touchCurrent.y = touch.clientY;
  touchStartTime.value = Date.now();
  isSwiping.value = true;

  // Reset pull state
  isPulling.value = false;
  pullDistance.value = 0;
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isSwiping.value || event.touches.length !== 1 || isReloading.value) return;
  if (pageHasScroll()) {
    isSwiping.value = false;
    isPulling.value = false;
    pullDistance.value = 0;
    return;
  }

  const touch = event.touches[0];
  touchCurrent.x = touch.clientX;
  touchCurrent.y = touch.clientY;

  const deltaX = touchCurrent.x - touchStart.x;
  const deltaY = touchCurrent.y - touchStart.y;

  // Check if swipe started near the top of the screen
  const startedFromTop = touchStart.y <= props.maxStartPosition;

  // Check if it's a downward swipe
  const isDownwardSwipe = deltaY > 0;
  const verticalDistance = Math.abs(deltaY);
  const horizontalDistance = Math.abs(deltaX);

  // Check if it's vertical enough
  const isVerticalEnough =
    horizontalDistance === 0 || verticalDistance / horizontalDistance >= props.minVerticalRatio;

  // Show pull indicator if conditions are met
  if (startedFromTop && isDownwardSwipe && isVerticalEnough) {
    isPulling.value = true;
    pullDistance.value = verticalDistance;
  } else {
    isPulling.value = false;
    pullDistance.value = 0;
  }
};

const handleTouchEnd = () => {
  if (!isSwiping.value) return;
  if (pageHasScroll()) {
    isSwiping.value = false;
    isPulling.value = false;
    pullDistance.value = 0;
    touchCurrent.x = touchStart.x;
    touchCurrent.y = touchStart.y;
    return;
  }

  isSwiping.value = false;

  const deltaX = touchCurrent.x - touchStart.x;
  const deltaY = touchCurrent.y - touchStart.y;

  // Check if swipe started near the top of the screen
  const startedFromTop = touchStart.y <= props.maxStartPosition;

  // Check if it's a downward swipe with sufficient vertical distance
  const isDownwardSwipe = deltaY > 0;
  const verticalDistance = Math.abs(deltaY);
  const horizontalDistance = Math.abs(deltaX);

  // More strict vertical ratio check
  const isVerticalEnough =
    horizontalDistance === 0 || verticalDistance / horizontalDistance >= props.minVerticalRatio;

  // Check minimum vertical distance
  const hasMinimalVerticalDistance = verticalDistance >= props.swipeThreshold;

  // Combine all conditions for a valid pull-to-refresh gesture
  const isValidPullToRefresh =
    startedFromTop && isDownwardSwipe && isVerticalEnough && hasMinimalVerticalDistance;

  if (isValidPullToRefresh) {
    triggerReload();
  } else {
    // Reset pull state
    isPulling.value = false;
    pullDistance.value = 0;
  }

  // Sync current touch position with start to avoid stale deltas on next tap
  touchCurrent.x = touchStart.x;
  touchCurrent.y = touchStart.y;
};

const triggerReload = () => {
  isPulling.value = false;
  pullDistance.value = 0;
  isReloading.value = true;

  // Add a small delay to show the spinner before reload
  setTimeout(() => {
    // Perform hard reload
    window.location.reload();
  }, ANIMATION_CONFIG.RELOAD_DELAY);
};
</script>

<style scoped lang="scss">
.pull-to-refresh {
  position: relative;
  width: 100%;
  touch-action: pan-y; // Allow vertical scrolling but optimize for swipe detection
}

.pull-indicator {
  position: fixed;
  top: -40px; // Start above the screen
  left: calc(50% - 16px);
  transform-origin: center;
  z-index: 0;
  transition: opacity 0.1s ease-out;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
}

.reload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
