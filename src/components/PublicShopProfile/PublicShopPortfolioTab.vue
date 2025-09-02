<template>
  <div class="public-shop-portfolio-tab">
    <!-- Portfolio Section -->
    <div class="portfolio-section">
      <div class="section-header q-mb-md bg-block border-radius-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Portfolio ({{ portfolioItems.length }})</h3>
      </div>

      <!-- Portfolio Grid -->
      <div class="portfolio-grid" v-if="portfolioItems.length">
        <PortfolioCard
          v-for="item in portfolioItems"
          :key="item.uuid"
          :work="item"
        />
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state bg-block border-radius-lg">
        <q-icon name="photo_library" size="60px" color="grey-6" />
        <h3 class="empty-title">No Portfolio Items Yet</h3>
        <p class="empty-description text-grey-6">This shop hasn't added any portfolio items yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IPortfolio } from 'src/interfaces/portfolio';
import PortfolioCard from 'src/components/PortfolioCard.vue';

interface Props {
  portfolioItems: IPortfolio[];
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

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.empty-description {
  margin: 0;
  font-size: 16px;
}
</style>
