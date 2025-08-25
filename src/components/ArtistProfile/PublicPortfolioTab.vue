<template>
  <div class="public-portfolio-tab flex column q-gap-md">
    <!-- Portfolio Header -->
    <div class="portfolio-header">
      <h3 class="text-subtitle1 text-bold q-my-none">Portfolio ({{ portfolioItems.length }})</h3>
    </div>

    <!-- Portfolio Items -->
    <div class="portfolio-grid" v-if="portfolioItems.length > 0">
      <div
        v-for="(work, index) in portfolioItems"
        :key="index"
        class="portfolio-item"
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
          <p class="work-description">{{ work.description }}</p>
          <div class="work-tags">
            <q-chip
              v-for="tag in work.tags"
              :key="tag"
              :label="tag"
              color="dark"
              text-color="white"
              size="sm"
              class="work-tag"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <q-icon name="photo_library" size="80px" color="grey-5" />
      <h3 class="empty-title">No portfolio items yet</h3>
      <p class="empty-description">This artist hasn't added any portfolio items yet</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PortfolioWork {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

interface Props {
  portfolioItems: PortfolioWork[];
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.public-portfolio-tab {
  width: 100%;
}

.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 4px 4px 16px;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.portfolio-item {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-light);
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
  color: var(--brand-dark);
  line-height: 1.2;
}

.work-description {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
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
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 20px 0 12px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
}
</style>
