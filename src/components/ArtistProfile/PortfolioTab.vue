<template>
  <div class="portfolio-tab flex column q-gap-md">
    <!-- Portfolio Header -->
    <div class="portfolio-header">
      <h3 class="text-subtitle1 text-bold q-my-none">My Portfolio ({{ portfolioItems.length }})</h3>
      <q-btn
        color="dark"
        icon="add"
        size="sm"
        @click="addNewWork"
        round
        unelevated
      />
    </div>

    <!-- Portfolio Items -->
    <div class="portfolio-grid">
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
          >
            <div class="work-overlay">
              <q-btn
                round
                color="dark"
                icon="edit"
                size="sm"
                @click="editWork(index)"
              />
              <!-- <q-btn
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="deleteWork(index)"
              /> -->
            </div>
          </q-img>
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
    <div v-if="portfolioItems.length === 0" class="empty-state">
      <q-icon name="photo_library" size="80px" color="grey-5" />
      <h3 class="empty-title">No portfolio items yet</h3>
      <p class="empty-description">Start building your portfolio by adding your best work</p>
      <q-btn
        color="primary"
        icon="add"
        label="Add Your First Work"
        @click="addNewWork"
        rounded
        unelevated
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface PortfolioWork {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

// Mock portfolio data
const portfolioItems = ref<PortfolioWork[]>([
  {
    id: 1,
    title: 'Live Performance at Club XYZ',
    description: 'Amazing night performing my latest hits to a sold-out crowd.',
    imageUrl: 'https://picsum.photos/300/300?random=1',
    tags: ['Live', 'Performance', 'Club']
  },
  {
    id: 2,
    title: 'Studio Recording Session',
    description: 'Recording my new single with professional sound engineers.',
    imageUrl: 'https://picsum.photos/300/300?random=2',
    tags: ['Studio', 'Recording', 'Single']
  },
  {
    id: 3,
    title: 'Music Festival Appearance',
    description: 'Performing at the biggest music festival in the city.',
    imageUrl: 'https://picsum.photos/300/300?random=3',
    tags: ['Festival', 'Live', 'Music']
  }
]);

const addNewWork = () => {
  console.log('Add new work clicked');
  // TODO: Implement add new work functionality
};

const editWork = (index: number) => {
  console.log('Edit work clicked', index);
  // TODO: Implement edit work functionality
};

// const deleteWork = (index: number) => {
//   console.log('Delete work clicked', index);
//   // TODO: Implement delete work functionality
//   portfolioItems.value.splice(index, 1);
// };

// Expose data for parent component
defineExpose({
  portfolioItems
});
</script>

<style scoped lang="scss">
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

.section-title {
  margin: 0;
  color: var(--brand-dark);
  font-size: 24px;
  font-weight: 600;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.portfolio-item {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px var(--shadow-light);
  }
}

.work-image {
  position: relative;
}

.work-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.work-overlay {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  transition: opacity 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 4px;
}

.work-details {
  padding: 20px;
}

.work-title {
  margin: 0 0 10px 0;
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
}

.work-description {
  margin: 0 0 15px 0;
  color: var(--brand-dark);
  font-size: 14px;
  line-height: 1.5;
}

.work-tags {
  display: flex;
  flex-wrap: wrap;
}

.work-tag {
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 20px 0 10px 0;
  color: var(--brand-dark);
  font-size: 24px;
  font-weight: 600;
}

.empty-description {
  margin: 0 0 30px 0;
  color: var(--brand-dark);
  font-size: 16px;
  line-height: 1.5;
}
</style>
