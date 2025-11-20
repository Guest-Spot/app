<template>
  <div class="public-portfolio-tab flex column q-gap-md">
    <ListHeader :title="`Artist Portfolio (${portfolioItems.length})`" />

    <LoadingState
      v-if="loading && !portfolioItems.length"
      :is-loading="loading"
      title="Loading portfolio items..."
      description="Please wait while we fetch the latest portfolio items"
      spinner-name="dots"
    />

    <!-- Portfolio Items -->
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
      description="This artist hasn't added any portfolio items yet"
      no-btn
    />
  </div>
</template>

<script setup lang="ts">
import type { IPortfolio } from 'src/interfaces/portfolio';
import ListHeader from 'src/components/ListHeader.vue';
import { FeedItemCard, NoResult, LoadingState, PortfolioGrid } from 'src/components';

interface Props {
  portfolioItems: IPortfolio[];
  loading: boolean;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.public-portfolio-tab {
  width: 100%;
}

.portfolio-item {
  overflow: hidden;
}

.work-image {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.work-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-details {
  padding: 20px;
}

.work-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.work-description {
  margin: 0 0 16px 0;
  line-height: 1.4;
  font-size: 14px;
}

.work-tag {
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  margin: 20px 0 12px 0;
  font-size: 20px;
  font-weight: 700;
}

.empty-description {
  margin: 0;
  font-size: 16px;
}
</style>
