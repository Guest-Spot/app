<template>
  <div class="public-portfolio-tab flex column q-gap-md">
    <div class="section-header q-mb-md bg-block border-radius-md">
      <h3 class="text-subtitle1 text-bold q-my-none">Artist Portfolio ({{ portfolioItems.length }})</h3>
    </div>

    <LoadingState
      v-if="loading && !portfolioItems.length"
      :is-loading="loading"
      title="Loading portfolio items..."
      description="Please wait while we fetch the latest portfolio items"
      spinner-name="dots"
    />

    <!-- Portfolio Items -->
    <div class="portfolio-grid" v-else-if="portfolioItems.length">
      <PortfolioCard
        v-for="item in portfolioItems"
        :key="item.uuid"
        :work="item"
      />
    </div>

    <!-- Empty State -->
    <NoResult
      v-else
      icon="photo_library"
      title="No Portfolio Items Yet"
      description="This artist hasn't added any portfolio items yet"
    />
  </div>
</template>

<script setup lang="ts">
import type { IPortfolio } from 'src/interfaces/portfolio';
import { PortfolioCard, NoResult, LoadingState } from 'src/components';

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

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
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

.work-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
