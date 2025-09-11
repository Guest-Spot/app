<template>
  <div class="portfolio-tab flex column q-gap-md">
    <!-- Portfolio Header -->
    <div class="portfolio-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">My Portfolio ({{ portfolioItems.length }})</h3>
      <q-btn color="primary" icon="add" size="sm" @click="addNewWork" round unelevated />
    </div>

    <!-- Portfolio Items -->
    <div class="portfolio-grid">
      <PortfolioCard v-for="(work, index) in portfolioItems" :key="index" :work="work" />
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

    <!-- Portfolio Dialog -->
    <PortfolioDialog
      v-model="showDialog"
      :work="currentWork"
      :is-editing="isEditing"
      @confirm="handleWorkConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PortfolioDialog from 'src/components/Dialogs/PortfolioDialog.vue';
import type { IPortfolio } from 'src/interfaces/portfolio';
import type { IPortfolioForm } from 'src/interfaces/portfolio';
import PortfolioCard from 'src/components/PortfolioCard.vue';

// Mock portfolio data
const portfolioItems = ref<IPortfolio[]>([
  {
    documentId: '1',
    title: 'Live Performance at Club XYZ',
    description: 'Amazing night performing my latest hits to a sold-out crowd.',
    pictures: [{ url: 'examples/example1.jpg' }],
    tags: [{ name: 'Live' }, { name: 'Performance' }, { name: 'Club' }],
    ownerDocumentId: '1',
  },
  {
    documentId: '2',
    title: 'Studio Recording Session',
    description: 'Recording my new single with professional sound engineers.',
    pictures: [{ url: 'examples/example2.jpeg' }],
    tags: [{ name: 'Studio' }, { name: 'Recording' }, { name: 'Single' }],
    ownerDocumentId: '1',
  },
  {
    documentId: '3',
    title: 'Music Festival Appearance',
    description: 'Performing at the biggest music festival in the city.',
    pictures: [{ url: 'examples/example3.jpg' }],
    tags: [{ name: 'Festival' }, { name: 'Live' }, { name: 'Music' }],
    ownerDocumentId: '1',
  },
]);

// Dialog state
const showDialog = ref(false);
const isEditing = ref(false);
const currentWork = ref<IPortfolioForm>({
  title: '',
  description: '',
  imageUrl: '',
  imageFile: null,
  tags: [],
});

const addNewWork = () => {
  isEditing.value = false;
  currentWork.value = {
    title: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    tags: [],
  };
  showDialog.value = true;
};

const handleWorkConfirm = (work: IPortfolioForm) => {
  console.log('work', work);
};

// Expose data for parent component
defineExpose({
  portfolioItems,
});
</script>

<style scoped lang="scss">
.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 20px;
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
