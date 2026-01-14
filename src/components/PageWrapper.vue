<template>
  <div class="page-wrapper" :class="{ 'overlay-active': isOverlayActive }">
    <!-- Base page - always visible, cached with keep-alive -->
    <keep-alive>
      <router-view name="page" />
    </keep-alive>

    <!-- Overlay page with iOS-style animation -->
    <router-view v-slot="{ Component, route: overlayRoute }">
      <transition
        enter-active-class="animated slideInRight"
        leave-active-class="animated slideOutRight"
      >
        <div
          v-if="Component && overlayRoute.meta.hasBack"
          :key="overlayRoute.path"
          class="page-overlay"
        >
          <component :is="Component" />
        </div>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'PageWrapper',
});

const route = useRoute();

// Track if overlay is active to help pages pause their activity
const isOverlayActive = computed(() => {
  return route.meta.hasBack === true;
});

// Prevent scrolling on base page when overlay is active
let savedScrollPosition = 0;
let savedBodyOverflow = '';

watch(
  isOverlayActive,
  (active) => {
    const qApp = document.querySelector('#q-app') as HTMLElement;
    if (!qApp) return;

    if (active) {
      // Save current scroll position and prevent scrolling
      savedScrollPosition = qApp.scrollTop || window.scrollY;
      savedBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Prevent touch scrolling on mobile
      qApp.style.overflow = 'hidden';
      qApp.style.position = 'fixed';
      qApp.style.width = '100%';
      qApp.style.top = `-${savedScrollPosition}px`;
    } else {
      // Restore scrolling
      document.body.style.overflow = savedBodyOverflow;
      qApp.style.overflow = '';
      qApp.style.position = '';
      qApp.style.width = '';
      qApp.style.top = '';
      // Restore scroll position
      requestAnimationFrame(() => {
        qApp.scrollTo({ top: savedScrollPosition, behavior: 'auto' });
      });
    }
  },
  { immediate: true }
);

// Cleanup on unmount
onBeforeUnmount(() => {
  const qApp = document.querySelector('#q-app') as HTMLElement;
  if (qApp) {
    document.body.style.overflow = savedBodyOverflow;
    qApp.style.overflow = '';
    qApp.style.position = '';
    qApp.style.width = '';
    qApp.style.top = '';
  }
});
</script>

<style lang="scss">
.page-wrapper {
  position: relative;
  min-height: 100%;

  // Optimize base page when overlay is active
  &.overlay-active {
    // Reduce repaints on base page
    contain: layout style paint;
  }
}

.page-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  background: #fff;
  overflow-y: auto;
  // GPU acceleration hint for smooth animations
  will-change: transform;
  // Force hardware acceleration
  transform: translateZ(0);
  // Optimize rendering
  contain: layout style paint;
}

.body--dark .page-overlay {
  background: $dark-page;
}
</style>

