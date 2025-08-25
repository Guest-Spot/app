<template>
  <div class="public-shop-portfolio-tab">
    <!-- Portfolio Section -->
    <div class="portfolio-section">
      <div class="section-header q-mb-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Portfolio ({{ portfolioItems.length }})</h3>
      </div>

      <!-- Portfolio Grid -->
      <div class="portfolio-grid" v-if="portfolioItems.length > 0">
        <div
          v-for="item in portfolioItems"
          :key="item.id"
          class="portfolio-item"
        >
          <div class="portfolio-image">
            <q-img
              :src="item.imageUrl"
              :ratio="1"
              class="portfolio-img"
              spinner-color="dark"
              spinner-size="32px"
            />
          </div>
          <div class="portfolio-info">
            <h4 class="portfolio-title">{{ item.title }}</h4>
            <p class="portfolio-description">{{ item.description }}</p>
            <div class="portfolio-tags">
              <q-chip
                v-for="tag in item.tags"
                :key="tag"
                :label="tag"
                size="sm"
                color="dark"
                text-color="white"
                class="portfolio-tag"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="photo_library" size="60px" color="grey-6" />
        <h3 class="empty-title">No Portfolio Items Yet</h3>
        <p class="empty-description">This shop hasn't added any portfolio items yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

interface Props {
  portfolioItems: PortfolioItem[];
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.section-header {
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.portfolio-image {
  position: relative;
}

.portfolio-img {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.portfolio-info {
  padding: 20px;
}

.portfolio-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-dark);
}

.portfolio-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.portfolio-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.portfolio-tag {
  font-size: 12px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0;
  color: #666;
  font-size: 16px;
}

// Responsive design
@media (max-width: 768px) {
  .portfolio-grid {
    grid-template-columns: 1fr;
  }
}
</style>
