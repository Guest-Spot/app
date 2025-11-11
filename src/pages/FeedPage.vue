<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-center">
    <div class="container full-width">
      <!-- Header -->
      <div class="feed-header q-mb-md">
        <h5 class="feed-title q-my-none">{{ feedTitle }}</h5>
        <q-btn
          v-if="selectedItem"
          flat
          round
          icon="grid_view"
          color="primary"
          size="sm"
          @click="closeDetailView"
        >
          <q-tooltip>Back to grid view</q-tooltip>
        </q-btn>
      </div>

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
        v-else-if="portfolios.length > 0 && !selectedItem"
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

      <!-- Feed Content - Single View -->
      <div v-else-if="selectedItem" class="feed-single">
        <div class="single-view-container">
          <FeedItemCard
            v-for="(item, index) in portfolios"
            :key="`feed-single-${index}`"
            :item="item"
            view-mode="single"
            :class="{ active: item.documentId === selectedItem.documentId }"
            @click="selectItem"
          />
        </div>
      </div>

      <!-- No Results -->
      <NoResult
        v-else
        icon="photo_library"
        title="No portfolio items yet"
        description="Start exploring artists and shops to see their work here"
        no-btn
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import { NoResult, LoadingState } from 'src/components';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';
import usePortfolios from 'src/composables/usePortfolios';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';

const {
  portfolios,
  totalPortfolios,
  isLoadingPortfolios,
  hasMorePortfolios,
  fetchPortfolios,
} = usePortfolios();

const selectedItem = ref<IPortfolio | null>(null);

const feedTitle = computed(() => {
  if (selectedItem.value) {
    return 'Portfolio Item';
  }
  if (totalPortfolios.value === 0) {
    return 'Feed';
  }
  if (totalPortfolios.value <= PAGINATION_PAGE_SIZE) {
    return `Feed (${portfolios.value.length})`;
  }
  return `Feed (${portfolios.value.length}/${totalPortfolios.value})`;
});

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

const closeDetailView = () => {
  selectedItem.value = null;
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
    }
  },
);

onBeforeMount(() => {
  initializeFeed();
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
}

.feed-single {
  width: 100%;
}

.single-view-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  .feed-item-card {
    &.active {
      border: 2px solid var(--q-primary);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>

