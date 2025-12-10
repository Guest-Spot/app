<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import type { ComponentPublicInstance } from 'vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

interface Props {
  items: unknown[];
  keyField?: string;
  minItemSize?: number;
  pageMode?: boolean;
  buffer?: number;
  loadOffset?: number;
  loading?: boolean;
  hasMore?: boolean;
  itemTag?: string;
  gap?: number;
  sizeDependencies?: (item: unknown) => unknown;
  scrollTarget?: HTMLElement | string | null;
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
  scrollTarget: null,
});

const emit = defineEmits<{
  'load-more': [];
}>();

const scrollerRef = ref<ComponentPublicInstance | null>(null);
const sentinelRef = ref<HTMLElement | null>(null);
const observer = ref<IntersectionObserver | null>(null);
const isAwaitingLoad = ref(false);

const resetAwaitingFlag = (loading: boolean) => {
  if (!loading) {
    isAwaitingLoad.value = false;
  }
};

watch(
  () => props.loading,
  (loading) => resetAwaitingFlag(loading),
);

const maybeLoadMore = () => {
  if (props.loading || isAwaitingLoad.value || !props.hasMore) return;

  isAwaitingLoad.value = true;
  emit('load-more');
};

const disconnectObserver = () => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
};

const getRootElement = () => {
  if (props.pageMode) return null;

  if (props.scrollTarget) {
    if (typeof props.scrollTarget === 'string') {
      return document.querySelector(props.scrollTarget) as HTMLElement;
    }
    return props.scrollTarget;
  }

  return (scrollerRef.value?.$el as Element | undefined) ?? null;
};

const createObserver = () => {
  disconnectObserver();

  const rootElement = getRootElement();

  observer.value = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        maybeLoadMore();
      }
    },
    {
      root: rootElement,
      rootMargin: `0px 0px ${props.loadOffset}px 0px`,
      threshold: 0,
    },
  );

  if (sentinelRef.value) {
    observer.value.observe(sentinelRef.value);
  }
};

const checkSentinelVisibility = () => {
  if (!sentinelRef.value || !props.hasMore || props.loading) return;

  const rect = sentinelRef.value.getBoundingClientRect();
  const rootElement = getRootElement();
  const viewportHeight = rootElement
    ? (rootElement as HTMLElement).clientHeight
    : window.innerHeight || document.documentElement.clientHeight;
  const rootTop = rootElement ? rootElement.getBoundingClientRect().top : 0;

  if (rect.top - rootTop <= viewportHeight + props.loadOffset) {
    maybeLoadMore();
  }
};

onMounted(() => {
  createObserver();
  requestAnimationFrame(() => checkSentinelVisibility());
});

onUnmounted(() => {
  disconnectObserver();
});

watch(
  () => [props.pageMode, props.loadOffset, props.scrollTarget, scrollerRef.value],
  () => {
    void nextTick(() => {
      createObserver();
    });
  },
);

watch(
  () => props.items.length,
  () => {
    void nextTick(() => checkSentinelVisibility());
  },
);

watch(
  () => props.hasMore,
  () => {
    void nextTick(() => checkSentinelVisibility());
  },
);

const resolveSizeDependencies = (item: unknown) => {
  if (!props.sizeDependencies) return [];

  const deps = props.sizeDependencies(item);
  if (Array.isArray(deps)) return deps;

  return [deps];
};

const SCROLL_RETRY_LIMIT = 5;

const getScrollContext = () => {
  const rootElement = getRootElement();
  const scrollTop =
    rootElement?.scrollTop ??
    window.scrollY ??
    window.pageYOffset ??
    document.documentElement.scrollTop ??
    0;
  const viewportHeight =
    rootElement?.clientHeight ??
    window.innerHeight ??
    document.documentElement.clientHeight;
  const containerTop = rootElement?.getBoundingClientRect().top ?? 0;

  return { rootElement, scrollTop, viewportHeight, containerTop };
};

const findItemElement = (index: number) => {
  const scrollerEl = scrollerRef.value?.$el as HTMLElement | undefined;
  return (
    (scrollerEl?.querySelector(
      `[data-index="${index}"]`,
    ) as HTMLElement | null) ?? null
  );
};

const smoothScrollTo = (top: number, rootElement: HTMLElement | null) => {
  const options: ScrollToOptions = { top, behavior: 'smooth' };
  if (rootElement) {
    rootElement.scrollTo(options);
  } else {
    window.scrollTo(options);
  }
};

const centerItemInView = (index: number, attempt = 0) => {
  const itemElement = findItemElement(index);

  if (!itemElement) {
    if (attempt >= SCROLL_RETRY_LIMIT) return;

    requestAnimationFrame(() => centerItemInView(index, attempt + 1));
    return;
  }

  const { rootElement: rootElementElement, scrollTop, viewportHeight, containerTop } =
    getScrollContext();
  const rootElement = rootElementElement as HTMLElement | null;

  const targetRect = itemElement.getBoundingClientRect();
  const targetCenter =
    targetRect.top - containerTop + scrollTop + targetRect.height / 2;
  const destination = Math.max(targetCenter - viewportHeight / 2, 0);

  smoothScrollTo(destination, rootElement);
};

const scrollToIndex = (index: number) => {
  const scroller = scrollerRef.value as
    | (ComponentPublicInstance & { scrollToItem?: (index: number) => void })
    | null;
  scroller?.scrollToItem?.(index);

  void nextTick(() => {
    requestAnimationFrame(() => centerItemInView(index));
  });
};

defineExpose({
  scrollToIndex,
});
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
      <div class="virtual-list__sentinel" ref="sentinelRef" aria-hidden="true" />

      <div v-if="loading && items.length" class="virtual-list__loader">
        <slot name="loader">
          <q-spinner-dots color="primary" size="md" />
        </slot>
      </div>

      <div v-if="!loading && !items.length" class="virtual-list__empty">
        <slot name="empty">
          <!-- No items found -->
        </slot>
      </div>

      <div v-if="!hasMore && items.length" class="virtual-list__end">
        <slot name="end">
          <!-- No more items -->
        </slot>
      </div>
    </template>
  </DynamicScroller>
</template>

<style scoped>
.virtual-list {
  position: relative;
  width: 100%;
}

.virtual-list__item {
  width: 100%;
}

.virtual-list__sentinel {
  height: 1px;
  width: 100%;
}

.virtual-list__loader,
.virtual-list__end,
.virtual-list__empty {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 0;
  color: var(--q-color-grey-6);
  font-size: 14px;
}
</style>
