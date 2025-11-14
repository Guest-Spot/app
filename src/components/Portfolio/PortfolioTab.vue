<template>
  <div class="portfolio-tab flex column q-gap-sm">
    <!-- Portfolio Header -->
    <div class="portfolio-header bg-block border-radius-lg">
      <h3 class="text-subtitle1 text-bold q-my-none">
        {{ profileType === 'shop' ? 'Shop Portfolio' : 'My Portfolio' }} ({{
          portfolioItems.length
        }})
      </h3>
      <q-btn color="primary" icon="add" size="sm" @click="addNewWork" round unelevated />
    </div>

    <!-- Portfolio Items -->
    <div v-if="portfoliosLoading" class="loading-state">
      <q-spinner size="40px" color="primary" />
      <p>Loading portfolios...</p>
    </div>
    <PortfolioGrid
      v-else-if="portfolioItems.length"
      :items="portfolioItems"
      :has-more="false"
      :loading="false"
      class="feed-grid"
    >
      <template #default="{ item, selectItem }">
        <FeedItemCard
          :item="item"
          view-mode="tile"
          editable
          @edit="editWork(item.documentId)"
          @delete="deleteWork(item.documentId)"
          @click="selectItem"
        />
      </template>
    </PortfolioGrid>

    <!-- Empty State -->
    <NoResult
      v-if="!portfoliosLoading && portfolioItems.length === 0"
      icon="photo_library"
      :title="profileType === 'shop' ? 'No portfolio items yet' : 'No portfolio items yet'"
      :description="
        profileType === 'shop'
          ? 'Start building your shop portfolio by adding your best work'
          : 'Start building your portfolio by adding your best work'
      "
      :btn-label="profileType === 'shop' ? 'Add Your First Work' : 'Add Your First Work'"
      btn-icon="add"
      @click-btn="addNewWork"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { NoResult, FeedItemCard, PortfolioGrid } from 'src/components';
import { useQuasar } from 'quasar';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import {
  PORTFOLIOS_QUERY,
  DELETE_PORTFOLIO_MUTATION,
} from 'src/apollo/types/portfolio';
import type { IGraphQLPortfoliosResult } from 'src/interfaces/portfolio';
import useNotify from 'src/modules/useNotify';
import { deleteFile } from 'src/api';
import useUser from 'src/modules/useUser';

// Props
interface Props {
  profileType: 'artist' | 'shop';
}

withDefaults(defineProps<Props>(), {
  profileType: 'artist',
});

// Store and composables
const { showSuccess, showError } = useNotify();
const { user } = useUser();
const $q = useQuasar();
const router = useRouter();

// Apollo queries and mutations
const {
  load: loadPortfolios,
  onResult: onResultPortfolios,
  onError: onErrorPortfolios,
  loading: portfoliosLoading,
  refetch: refetchPortfolios,
} = useLazyQuery<IGraphQLPortfoliosResult>(PORTFOLIOS_QUERY);

const { mutate: deletePortfolio, onDone: onDoneDeletePortfolio } =
  useMutation(DELETE_PORTFOLIO_MUTATION);

// Portfolio data
const portfolioItems = ref<IPortfolio[]>([]);

const addNewWork = () => {
  void router.push({
    path: '/portfolio',
    query: { mode: 'add' },
  });
};

const editWork = (portfolioId: string) => {
  const work = portfolioItems.value.find((item) => item.documentId === portfolioId);
  if (!work) {
    showError('Portfolio item not found');
    return;
  }

  void router.push({
    path: '/portfolio',
    query: {
      mode: 'edit',
      workId: portfolioId,
    },
  });
};

const deleteWork = (portfolioId: string) => {
  const work = portfolioItems.value.find((item) => item.documentId === portfolioId);
  if (!work) {
    showError('Portfolio item not found');
    return;
  }

  const deleteItem = async () => {
    for (const picture of work.pictures) {
      await deleteFile(picture.id);
    }
    void deletePortfolio({ documentId: portfolioId });
  };

  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete portfolio item: <strong class="text-primary">${work.title}</strong>?`,
    persistent: true,
    html: true,
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'No, Keep It',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Yes, Delete',
    },
  }).onOk(() => {
    try {
      void deleteItem();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      showError('Error deleting portfolio');
    }
  });
};

// Load portfolios from API
const loadPortfoliosData = () => {
  const profile = user.value;
  if (profile?.documentId) {
    void loadPortfolios(null, {
      filters: {
        owner: {
          documentId: {
            eq: profile.documentId,
          },
        },
      },
    }, { fetchPolicy: 'network-only' });
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
onDoneDeletePortfolio((result) => {
  if (result.errors?.length) {
    console.error('Error deleting portfolio:', result.errors);
    showError('Error deleting portfolio');
    return;
  }

  if (result.data?.deletePortfolio) {
    showSuccess('Portfolio deleted successfully');
    void refetchPortfolios();
  }
});

// Watch for profile changes
watch(
  user,
  (profile) => {
    if (profile?.documentId) {
      loadPortfoliosData();
    }
  },
  { immediate: true },
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

.loading-state {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
</style>
