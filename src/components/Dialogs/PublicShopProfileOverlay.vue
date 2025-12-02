<template>
  <Teleport to="body">
    <div
      v-show="isOpen"
      ref="overlayRef"
      class="profile-overlay bg-block"
      data-no-pull-refresh
      :style="overlayStyle"
      v-touch-pan.right.prevent.mouse="handleSwipePan"
    >
      <PublicShopProfileContent
        v-if="documentId"
        :document-id="documentId"
        :on-back="closeOverlay"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useProfileOverlay } from 'src/composables/useProfileOverlay';
import PublicShopProfileContent from 'src/components/PublicShopProfile/PublicShopProfileContent.vue';

interface Props {
  documentId: string | null;
  isOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'close'): void }>();

const { closeProfile } = useProfileOverlay();

// Swipe handling
const SWIPE_CLOSE_THRESHOLD = 120;
const MAX_OPACITY_DISTANCE = 340;
const OPACITY_START_DISTANCE = 150;
const MIN_SCALE = 0.7;

const overlayRef = ref<HTMLElement | null>(null);
const isSwiping = ref(false);
const swipeOffset = ref({ x: 0, y: 0 });

interface TouchPanPayload {
  evt?: Event;
  offset?: { x?: number; y?: number };
  isFirst?: boolean;
  isFinal?: boolean;
}

const overlayStyle = computed(() => {
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
  if (!props.isOpen) {
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
      closeOverlay();
    }
    return true;
  }

  swipeOffset.value = {
    x: Math.max(0, payload.offset?.x ?? 0),
    y: payload.offset?.y ?? swipeOffset.value.y,
  };
  return true;
};

const closeOverlay = () => {
  resetSwipeState();
  closeProfile();
  emit('close');
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetSwipeState();
    }
  },
);

onBeforeUnmount(() => {
  resetSwipeState();
});
</script>

<style scoped lang="scss">
.profile-overlay {
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  touch-action: pan-y;
  will-change: transform;
  z-index: 9999;
  background: var(--q-dark-page);
}
</style>

