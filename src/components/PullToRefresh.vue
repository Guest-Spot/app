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
      class="pull-indicator bg-block border-radius-md z-max q-pa-sm"
      :style="{
        opacity: pullOpacity,
        transform: `translateY(${pullVerticalOffset}px) rotate(${pullRotation}deg)`,
      }"
    >
      <RefreshIcon />
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
import { ref, reactive, computed } from 'vue'
import RefreshIcon from 'src/components/Icons/RefreshIcon.vue'

interface TouchPosition {
  x: number
  y: number
}

// Animation and behavior constants
const ANIMATION_CONFIG = {
  // Opacity animation
  OPACITY_MAX_DISTANCE: 500,
  OPACITY_THRESHOLD: 150, // Opacity starts appearing only after this distance

  // Rotation animation
  ROTATION_MAX_DEGREES: 100, // 360 / 100 for slower rotation
  ROTATION_MAX_DISTANCE: 150,

  // Movement animation
  MOVE_MULTIPLIER: 0.2, // How much icon moves relative to swipe distance
  MAX_MOVE_DISTANCE: 20, // Maximum pixels icon can move down

  // Timing
  RELOAD_DELAY: 500, // Delay before actual reload
} as const

const props = defineProps({
  reloadText: {
    type: String,
    default: 'Reloading...',
  },
  swipeThreshold: {
    type: Number,
    default: 160, // Minimum vertical distance in pixels for swipe (увеличено в 2 раза)
  },
  maxStartPosition: {
    type: Number,
    default: 50, // Maximum Y position where swipe can start (from top of screen)
  },
  minVerticalRatio: {
    type: Number,
    default: 2, // Minimum ratio of vertical to horizontal movement
  },
})

const isReloading = ref(false)
const isPulling = ref(false)
const pullDistance = ref(0)
const touchStart = reactive<TouchPosition>({ x: 0, y: 0 })
const touchCurrent = reactive<TouchPosition>({ x: 0, y: 0 })
const touchStartTime = ref(0)
const isSwiping = ref(false)

// Computed properties for pull indicator animation
const pullOpacity = computed(() => {
  const opacity = Math.min(
    (pullDistance.value - ANIMATION_CONFIG.OPACITY_THRESHOLD) /
      (ANIMATION_CONFIG.OPACITY_MAX_DISTANCE - ANIMATION_CONFIG.OPACITY_THRESHOLD),
    1
  )
  return Math.max(0, opacity)
})

const pullRotation = computed(() => {
  return (
    (pullDistance.value / ANIMATION_CONFIG.ROTATION_MAX_DISTANCE) *
    ANIMATION_CONFIG.ROTATION_MAX_DEGREES
  )
})

const pullVerticalOffset = computed(() => {
  return Math.min(
    pullDistance.value * ANIMATION_CONFIG.MOVE_MULTIPLIER,
    ANIMATION_CONFIG.MAX_MOVE_DISTANCE
  )
})

const handleTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1 || isReloading.value) return

  const touch = event.touches[0]
  touchStart.x = touch.clientX
  touchStart.y = touch.clientY
  touchStartTime.value = Date.now()
  isSwiping.value = true

  // Reset pull state
  isPulling.value = false
  pullDistance.value = 0
}

const handleTouchMove = (event: TouchEvent) => {
  if (!isSwiping.value || event.touches.length !== 1 || isReloading.value) return

  const touch = event.touches[0]
  touchCurrent.x = touch.clientX
  touchCurrent.y = touch.clientY

  const deltaX = touchCurrent.x - touchStart.x
  const deltaY = touchCurrent.y - touchStart.y

  // Check if swipe started near the top of the screen
  const startedFromTop = touchStart.y <= props.maxStartPosition

  // Check if it's a downward swipe
  const isDownwardSwipe = deltaY > 0
  const verticalDistance = Math.abs(deltaY)
  const horizontalDistance = Math.abs(deltaX)

  // Check if it's vertical enough
  const isVerticalEnough =
    horizontalDistance === 0 || verticalDistance / horizontalDistance >= props.minVerticalRatio

  // Show pull indicator if conditions are met
  if (startedFromTop && isDownwardSwipe && isVerticalEnough) {
    isPulling.value = true
    pullDistance.value = verticalDistance
  } else {
    isPulling.value = false
    pullDistance.value = 0
  }
}

const handleTouchEnd = () => {
  if (!isSwiping.value) return

  isSwiping.value = false

  const deltaX = touchCurrent.x - touchStart.x
  const deltaY = touchCurrent.y - touchStart.y

  // Check if swipe started near the top of the screen
  const startedFromTop = touchStart.y <= props.maxStartPosition

  // Check if it's a downward swipe with sufficient vertical distance
  const isDownwardSwipe = deltaY > 0
  const verticalDistance = Math.abs(deltaY)
  const horizontalDistance = Math.abs(deltaX)

  // More strict vertical ratio check
  const isVerticalEnough =
    horizontalDistance === 0 || verticalDistance / horizontalDistance >= props.minVerticalRatio

  // Check minimum vertical distance
  const hasMinimalVerticalDistance = verticalDistance >= props.swipeThreshold

  // Combine all conditions for a valid pull-to-refresh gesture
  const isValidPullToRefresh =
    startedFromTop && isDownwardSwipe && isVerticalEnough && hasMinimalVerticalDistance

  if (isValidPullToRefresh) {
    triggerReload()
  } else {
    // Reset pull state
    isPulling.value = false
    pullDistance.value = 0
  }
}

const triggerReload = () => {
  isPulling.value = false
  pullDistance.value = 0
  isReloading.value = true

  // Add a small delay to show the spinner before reload
  setTimeout(() => {
    // Perform hard reload
    window.location.reload()
  }, ANIMATION_CONFIG.RELOAD_DELAY)
}
</script>

<style scoped lang="scss">
.pull-to-refresh {
  position: relative;
  width: 100%;
  height: 100%;
  touch-action: pan-y; // Allow vertical scrolling but optimize for swipe detection
}

.pull-indicator {
  position: fixed;
  top: 20px;
  left: calc(50% - 12px);
  transform-origin: center;
  z-index: 0;
  color: var(--primary-blue);
  width: 32px;
  height: 32px;
  transition: opacity 0.1s ease-out;

  svg {
    width: 100%;
    height: 100%;
    color: var(--primary-blue);
  }
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
