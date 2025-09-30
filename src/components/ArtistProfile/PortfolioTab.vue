<template>
  <div class="portfolio-tab flex column q-gap-md">
    <!-- Portfolio Header -->
    <div class="portfolio-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">My Portfolio ({{ portfolioItems.length }})</h3>
      <q-btn color="primary" icon="add" size="sm" @click="addNewWork" round unelevated />
    </div>

    <!-- Portfolio Items -->
    <div v-if="portfoliosLoading" class="loading-state">
      <q-spinner size="40px" color="primary" />
      <p>Loading portfolios...</p>
    </div>
    <div v-else class="portfolio-grid">
      <PortfolioCard v-for="(work, index) in portfolioItems"
        editable
        :key="`work-${index}`"
        :work="work"
        @edit="editWork(work.documentId)"
        @delete="deleteWork(work.documentId)"
      />
    </div>

    <!-- Empty State -->
    <NoResult
      v-if="!portfoliosLoading && portfolioItems.length === 0"
      icon="photo_library"
      title="No portfolio items yet"
      description="Start building your portfolio by adding your best work"
      btn-label="Add Your First Work"
      btn-icon="add"
      @click-btn="addNewWork"
    />

    <!-- Portfolio Dialog -->
    <PortfolioDialog
      v-model="showDialog"
      :work="workFoEdit"
      :is-editing="isEditing"
      @confirm="handleWorkConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { IPortfolio } from 'src/interfaces/portfolio';
import type { IPortfolioForm } from 'src/interfaces/portfolio';
import { NoResult, PortfolioCard } from 'src/components';
import { useQuasar } from 'quasar';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import PortfolioDialog from 'src/components/Dialogs/PortfolioDialog.vue';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import { PORTFOLIOS_QUERY, CREATE_PORTFOLIO_MUTATION, UPDATE_PORTFOLIO_MUTATION, DELETE_PORTFOLIO_MUTATION } from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import { useProfileStore } from 'src/stores/profile';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';

// Store and composables
const profileStore = useProfileStore();
const { showSuccess, showError } = useNotify();
const { fetchMe } = useUser();
const $q = useQuasar();

// Apollo queries and mutations
const {
  load: loadPortfolios,
  onResult: onResultPortfolios,
  onError: onErrorPortfolios,
  loading: portfoliosLoading,
} = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

const { mutate: createPortfolio, onDone: onDoneCreatePortfolio } = useMutation(CREATE_PORTFOLIO_MUTATION);
const { mutate: updatePortfolio, onDone: onDoneUpdatePortfolio } = useMutation(UPDATE_PORTFOLIO_MUTATION);
const { mutate: deletePortfolio, onDone: onDoneDeletePortfolio } = useMutation(DELETE_PORTFOLIO_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

// Dialog state
const showDialog = ref(false);
const isEditing = ref(false);
const workFoEdit = ref<IPortfolio>({
  documentId: '',
  ownerDocumentId: '',
  title: '',
  description: '',
  pictures: [],
  tags: [],
});

const addNewWork = () => {
  isEditing.value = false;
  workFoEdit.value = {
    documentId: '',
    ownerDocumentId: '',
    title: '',
    description: '',
    pictures: [],
    tags: [],
  };
  showDialog.value = true;
};

const editWork = (portfolioId: string) => {
  const work = portfolioItems.value.find(item => item.documentId === portfolioId);
  if (!work) {
    showError('Portfolio item not found');
    return;
  }

  isEditing.value = true;
  workFoEdit.value = {
    documentId: work.documentId,
    ownerDocumentId: work.ownerDocumentId,
    title: work.title,
    description: work.description || '',
    pictures: work.pictures || [],
    tags: work.tags || [],
  };
  showDialog.value = true;
};

const deleteWork = (portfolioId: string) => {
  const work = portfolioItems.value.find(item => item.documentId === portfolioId);
  if (!work) {
    showError('Portfolio item not found');
    return;
  }

  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${work.title}"? This action cannot be undone.`,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
    },
    cancel: {
      label: 'Cancel',
      color: 'grey',
    },
  }).onOk(() => {
    void deletePortfolio({ documentId: portfolioId });
  });
};

// Load portfolios from API
const loadPortfoliosData = () => {
  const artistProfile = profileStore.getArtistProfile;
  if (artistProfile?.documentId) {
    void loadPortfolios(PORTFOLIOS_QUERY, {
      ownerDocumentId: artistProfile.documentId,
    });
  }
};

// Handle portfolio creation/update
const handleWorkConfirm = async (work: IPortfolioForm) => {
  try {
    const artistProfile = profileStore.getArtistProfile;
    if (!artistProfile?.documentId) {
      showError('Artist profile not found');
      return;
    }

    // Delete images if any
    if (work.imagesForRemove?.length) {
      for (const id of work.imagesForRemove) {
        await deleteImage({ id });
      }
    }

    // Upload new images
    let uploadedFiles: UploadFileResponse[] = [];
    if (work.imagesForUpload?.length) {
      uploadedFiles = await uploadFiles(work.imagesForUpload);
    }

    // Prepare data for mutation
    const portfolioData = {
      ownerDocumentId: artistProfile.documentId,
      title: work.title,
      description: work.description,
      pictures: [
        ...uploadedFiles.map((file) => file.id),
        ...(work.pictures?.map((picture) => picture.id).filter((id) => !work.imagesForRemove?.includes(id)) || []),
      ],
      tags: work.tags.map((tag) => ({ name: tag.name })),
    };

    debugger;

    if (isEditing.value && workFoEdit.value.documentId) {
      // Update existing portfolio
      void updatePortfolio({
        documentId: workFoEdit.value.documentId,
        data: portfolioData,
      });
    } else {
      // Create new portfolio
      void createPortfolio({
        data: portfolioData,
      });
    }
  } catch (error) {
    console.error('Error saving portfolio:', error);
    showError('Error saving portfolio');
  }
};

// Apollo query handlers
onResultPortfolios((result) => {
  if (result.data?.portfolios) {
    portfolioItems.value = result.data.portfolios;
  }
});

onErrorPortfolios((error) => {
  console.error('Error loading portfolios:', error);
  showError('Error loading portfolios');
});

// Mutation handlers
onDoneCreatePortfolio((result) => {
  if (result.errors?.length) {
    console.error('Error creating portfolio:', result.errors);
    showError('Error creating portfolio');
    return;
  }

  if (result.data?.createPortfolio) {
    showSuccess('Portfolio created successfully');
    loadPortfoliosData(); // Reload portfolios
    void (async () => {
      const userData = await fetchMe();
      if (userData) {
        profileStore.setUserProfile(userData);
      }
    })();
  }
});

onDoneUpdatePortfolio((result) => {
  if (result.errors?.length) {
    console.error('Error updating portfolio:', result.errors);
    showError('Error updating portfolio');
    return;
  }

  if (result.data?.updatePortfolio) {
    showSuccess('Portfolio updated successfully');
    loadPortfoliosData(); // Reload portfolios
    void (async () => {
      const userData = await fetchMe();
      if (userData) {
        profileStore.setUserProfile(userData);
      }
    })();
  }
});

onDoneDeletePortfolio((result) => {
  if (result.errors?.length) {
    console.error('Error deleting portfolio:', result.errors);
    showError('Error deleting portfolio');
    return;
  }

  if (result.data?.deletePortfolio) {
    showSuccess('Portfolio deleted successfully');
    loadPortfoliosData(); // Reload portfolios
  }
});

// Watch for artist profile changes
watch(
  () => profileStore.getArtistProfile,
  (profile) => {
    if (profile?.documentId) {
      loadPortfoliosData();
    }
  },
  { immediate: true }
);

// Load portfolios on component mount
onMounted(() => {
  loadPortfoliosData();
});

// Expose data for parent component
defineExpose({
  portfolioItems,
  addNewWork,
  editWork,
  deleteWork,
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


.loading-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--brand-dark);
}
</style>
