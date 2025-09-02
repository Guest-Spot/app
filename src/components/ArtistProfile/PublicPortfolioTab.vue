<template>
  <div class="public-portfolio-tab flex column q-gap-md">
    <!-- Portfolio Items -->
    <div class="portfolio-grid" v-if="portfolioItems.length">
      <div
        v-for="(work, index) in portfolioItems"
        :key="index"
        class="portfolio-item bg-block border-radius-md"
      >
        <div class="work-image">
          <q-img
            :src="work.imageUrl"
            :ratio="1"
            class="work-img"
            spinner-color="dark"
            spinner-size="32px"
          />
        </div>
        <div class="work-details">
          <h4 class="work-title">{{ work.title }}</h4>
          <p class="work-description text-grey-6">{{ work.description }}</p>
          <div class="work-tags">
            <q-chip
              v-for="tag in work.tags"
              :key="tag"
              :label="tag"
              size="sm"
              class="work-tag bg-block"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state bg-block border-radius-lg">
      <q-icon name="photo_library" size="60px" color="grey-6" />
      <h3 class="empty-title">No portfolio items yet</h3>
      <p class="empty-description text-grey-6">This artist hasn't added any portfolio items yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IPortfolio } from 'src/interfaces/portfolio';

interface Props {
  portfolioItems: IPortfolio[];
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
