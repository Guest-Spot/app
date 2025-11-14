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
      <PortfolioGrid
        v-else-if="portfolios.length > 0"
        ref="portfoliosGridRef"
        :items="portfolios"
        :offset="250"
        :loading="isLoadingPortfolios"
        :has-more="hasMorePortfolios"
        @load-more="loadMorePortfolios"
      >
        <template #default="{ item, selectItem }">
          <FeedItemCard :item="item" view-mode="tile" @click="selectItem" />
        </template>
      </PortfolioGrid>

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
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import type { EventBus } from 'quasar';
import { inject } from 'vue';
import FeedItemCard from 'src/components/FeedItemCard.vue';
import { NoResult, LoadingState, PortfolioGrid } from 'src/components';
import usePortfolios from 'src/composables/usePortfolios';

const bus = inject('bus') as EventBus;

const {
  portfolios,
  isLoadingPortfolios,
  hasMorePortfolios,
  fetchPortfolios,
} = usePortfolios();

const portfoliosGridRef = ref<InstanceType<typeof PortfolioGrid> | null>(null);

const loadMorePortfolios = () => {
  fetchPortfolios();
};

const initializeFeed = () => {
  if (!portfolios.value.length) {
    fetchPortfolios();
  }
};

const forceCloseSingleView = () => {
  portfoliosGridRef.value?.forceCloseSingleView();
};

onBeforeUnmount(() => {
  bus.off('opened-feed-page', forceCloseSingleView);
});

onBeforeMount(() => {
  bus.on('opened-feed-page', forceCloseSingleView);
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
</style>
