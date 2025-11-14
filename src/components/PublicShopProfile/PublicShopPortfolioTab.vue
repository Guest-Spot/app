<template>
  <div class="public-shop-portfolio-tab">
    <!-- Portfolio Section -->
    <div class="portfolio-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <h3 class="text-subtitle1 text-bold q-my-none">
          Shop Portfolio ({{ portfolioItems.length }})
        </h3>
      </div>

      <LoadingState
        v-if="loading && !portfolioItems.length"
        :is-loading="loading"
        title="Loading portfolio items..."
        description="Please wait while we fetch the latest portfolio items"
        spinner-name="dots"
      />

      <!-- Portfolio Grid -->
      <PortfolioGrid
        v-else-if="portfolioItems.length"
        :items="portfolioItems"
        :has-more="false"
        :loading="false"
        class="feed-grid"
      >
        <template #default="{ item, selectItem }">
          <FeedItemCard :item="item" view-mode="tile" @click="selectItem" />
        </template>
      </PortfolioGrid>

      <!-- Empty State -->
      <NoResult
        v-else
        icon="photo_library"
        title="No Portfolio Items Yet"
        description="This shop hasn't added any portfolio items yet"
        no-btn
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IPortfolio } from 'src/interfaces/portfolio';
import { NoResult, FeedItemCard, LoadingState, PortfolioGrid } from 'src/components';

interface Props {
  portfolioItems: IPortfolio[];
  loading: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 4px 4px 16px;
}

</style>
