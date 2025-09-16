<template>
  <div ref="scrollContainer" class="infinite-scroll-wrapper">
    <slot />
    <div ref="observerTarget" class="observer-target" />
    <div v-if="loading" class="full-width flex items-center justify-center q-mt-md">
      <q-spinner-dots color="primary" size="lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue';

const props = defineProps({
  loading: { type: Boolean, default: false },
  stop: { type: Boolean, default: false },
  offset: { type: Number, default: 250 },
});

const emit = defineEmits(['load-more']);

const scrollContainer = ref<HTMLElement | null>(null);
const observerTarget = ref<HTMLElement | null>(null);
const hasLoaded = ref(false);
const observer = ref<IntersectionObserver | null>(null);
const debounceTimer = ref<NodeJS.Timeout | null>(null);
const resizeTimer = ref<NodeJS.Timeout | null>(null);

const handleIntersect = (entries: IntersectionObserverEntry[]) => {
  if (entries[0]?.isIntersecting && !props.loading && !hasLoaded.value && !props.stop) {
    if (debounceTimer.value) clearTimeout(debounceTimer.value);
    debounceTimer.value = setTimeout(() => {
      hasLoaded.value = true;
      emit('load-more');
    }, 200);
  }
};

const checkContainerHeight = () => {
  const container = scrollContainer.value;
  if (
    container &&
    container.scrollHeight <= window.innerHeight &&
    !props.loading &&
    !hasLoaded.value &&
    !props.stop
  ) {
    hasLoaded.value = true;
    emit('load-more');
  }
};

const handleResize = () => {
  if (resizeTimer.value) clearTimeout(resizeTimer.value);
  resizeTimer.value = setTimeout(() => checkContainerHeight(), 200);
};

const init = () => {
  observer.value = new IntersectionObserver(handleIntersect, {
    root: null,
    rootMargin: `${props.offset}px`,
    threshold: 0.1,
  });
  if (observerTarget.value) {
    observer.value.observe(observerTarget.value);
  }
  checkContainerHeight();
  window.addEventListener('resize', handleResize);
};

watch(
  () => [props.loading, props.stop],
  ([newLoading, newStop]) => {
    if (!newLoading && !newStop) {
      hasLoaded.value = false;
      checkContainerHeight();
    }
  },
);

onMounted(() => {
  init();
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
  if (debounceTimer.value) clearTimeout(debounceTimer.value);
  if (resizeTimer.value) clearTimeout(resizeTimer.value);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.infinite-scroll-wrapper {
  position: relative;
}

.observer-target {
  height: 1px;
  width: 100%;
  background-color: transparent;
  position: absolute;
  bottom: 0;
  left: 0;
}
</style>
