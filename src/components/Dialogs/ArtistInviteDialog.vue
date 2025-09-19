<template>
  <!-- Dialogs -->
  <SearchDialog v-model="showSearchDialog" v-model:query="searchQuery" no-route-replace />
  <FilterDialog
    v-model="showFilterDialog"
    v-model:filterValue="activeFilters"
    no-route-replace
    unelevated
  />
  <SortDialog v-model="showSortDialog" v-model:sortValue="sortSettings" no-route-replace />

  <q-dialog v-model="isVisible" position="bottom" maximized no-route-dismiss>
    <q-card class="artist-invite-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
        <q-btn
          icon="close"
          round
          dense
          size="sm"
          class="bg-block"
          text-color="primary"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <!-- Search Header with Filters -->
        <div class="search-container">
          <SearchHeader
            v-model="searchQuery"
            :title="title"
            :has-filters="hasActiveFilters"
            :has-sort="hasActiveSort"
            @toggle-search="showSearchDialog = true"
            @toggle-filters="showFilterDialog = true"
            @toggle-sort="showSortDialog = true"
          />
        </div>

        <!-- Artists List -->
        <div class="artists-container">
          <div v-if="isLoadingQuery && !localArtists.length" class="loading-container">
            <q-spinner-dots size="40px" color="primary" />
            <div class="text-grey-6 q-mt-md">Loading artists...</div>
          </div>

          <div v-else-if="localArtists.length === 0" class="no-results">
            <q-icon name="person_search" size="48px" color="grey-6" />
            <div class="text-grey-6 q-mt-md">No artists found</div>
          </div>

          <div v-else class="artists-list q-pb-lg">
            <InfiniteScrollWrapper
              class="flex column q-gap-md"
              :offset="150"
              :loading="isLoadingQuery"
              :stop="!hasMoreArtists"
              @load-more="loadMoreArtists"
            >
              <ArtistCard
                v-for="artist in localArtists"
                :key="artist.documentId"
                :artist="artist"
                @click="selectArtist"
              >
                <template #footer>
                  <q-btn
                    rounded
                    flat
                    dense
                    color="primary"
                    class="bg-block full-width"
                    :loading="invitingArtist"
                    :disable="invitingArtist"
                    @click.stop="sendInvitation(artist)"
                  >
                    <div class="flex items-center q-gap-sm">
                      <q-icon name="person_add" size="18px" />
                      <span>Invite to shop</span>
                    </div>
                  </q-btn>
                </template>
              </ArtistCard>
              <template #loading>
                <div class="row justify-center q-my-md">
                  <q-spinner-dots color="primary" size="40px" />
                </div>
              </template>
            </InfiniteScrollWrapper>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useLazyQuery } from '@vue/apollo-composable';
import { ArtistCard, SearchHeader } from 'src/components/SearchPage';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';
import type { IArtist, IGraphQLArtistsResult } from 'src/interfaces/artist';
import InfiniteScrollWrapper from '../InfiniteScrollWrapper.vue';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { FilterDialog, SortDialog, SearchDialog } from 'src/components/Dialogs';
import type { IFilters } from 'src/interfaces/filters';
import { useCitiesStore } from 'src/stores/cities';
import { CITIES_QUERY } from 'src/apollo/types/city';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';
import useHelpers from 'src/modules/useHelpers';
import useNotify from 'src/modules/useNotify';
import useShopArtists from 'src/composables/useShopArtists';
import { useProfileStore } from 'src/stores/profile';

// Sort settings interface
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

interface Props {
  modelValue: boolean;
  shopId?: string | number;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'artistInvited', artist: IArtist): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { inviteArtist, invitingArtist, onInviteSuccess, onInviteError } = useShopArtists();
const citiesStore = useCitiesStore();
const { convertFiltersToGraphQLFilters } = useHelpers();
const { showSuccess, showError } = useNotify();
const profileStore = useProfileStore();

const isVisible = ref(props.modelValue);
const searchQuery = ref('');

// Dialog states for search, filters, and sort
const showSearchDialog = ref(false);
const showFilterDialog = ref(false);
const showSortDialog = ref(false);

// Filters and sort state
const activeFilters = ref<IFilters>({
  city: null,
});

const sortSettings = ref<SortSettings>({
  sortBy: null,
  sortDirection: 'asc',
});

// Local state for dialog artists to avoid interfering with global store
const localArtists = ref<IArtist[]>([]);
const currentPage = ref(1);
const totalArtists = ref(0);
const hasMoreArtists = ref(true);

// Direct GraphQL query for artists
const {
  load: loadArtistsQuery,
  loading: isLoadingQuery,
  onResult: onArtistsResult,
  onError: onArtistsError,
} = useLazyQuery<IGraphQLArtistsResult>(ARTISTS_QUERY);

// Cities query for filters
const {
  load: loadCities,
  onResult: onResultCities,
  onError: onErrorCities,
} = useLazyQuery<IGraphQLCitiesResult>(CITIES_QUERY);

const title = computed(() => {
  if (totalArtists.value === 0) {
    return 'Artists';
  }
  if (totalArtists.value <= PAGINATION_PAGE_SIZE) {
    return `Artists (${localArtists.value.length})`;
  }
  return `Artists (${localArtists.value.length}/${totalArtists.value})`;
});

const hasActiveFilters = computed(() =>
  Object.values(activeFilters.value).some((filter) => !!filter),
);
const hasActiveSort = computed(() => !!sortSettings.value.sortBy);

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      loadArtistsList();
      void loadCities();
    }
  },
);

// // Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Watch for changes in filters, search, or sort to refetch data
watch(
  [activeFilters, searchQuery, sortSettings],
  () => {
    if (isVisible.value) {
      refetchArtistsData();
    }
  },
  { deep: true },
);

// Methods
const sendInvitation = (artist: IArtist) => {
  const shop = profileStore.shopProfile;
  if (!shop) {
    showError('Shop profile not found');
    console.error('Shop profile not found');
    return;
  }
  void inviteArtist(shop, artist);
};

const resetPagination = () => {
  currentPage.value = 1;
  localArtists.value = [];
  hasMoreArtists.value = true;
};

const closeDialog = () => {
  isVisible.value = false;
  // Reset search when closing dialog
  searchQuery.value = '';
  // Reset filters and sort
  activeFilters.value = { city: null };
  sortSettings.value = { sortBy: null, sortDirection: 'asc' };
  // Reset dialogs
  showSearchDialog.value = false;
  showFilterDialog.value = false;
  showSortDialog.value = false;
};

const loadArtistsList = (resetData = false) => {
  if (resetData) {
    resetPagination();
  }

  // Only load if we don't have artists data yet or we're resetting
  if ((localArtists.value.length === 0 || resetData) && !isLoadingQuery.value) {
    void loadArtistsQuery(null, {
      filters: convertFiltersToGraphQLFilters({
        ...activeFilters.value,
        name: searchQuery.value || null,
      }),
      sort: sortSettings.value.sortBy
        ? [`${sortSettings.value.sortBy}:${sortSettings.value.sortDirection}`]
        : ['name:asc'],
      pagination: {
        page: currentPage.value,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  }
};

const loadMoreArtists = () => {
  if (!isLoadingQuery.value && hasMoreArtists.value) {
    currentPage.value += 1;
    void loadArtistsQuery(null, {
      filters: convertFiltersToGraphQLFilters({
        ...activeFilters.value,
        name: searchQuery.value || null,
      }),
      sort: sortSettings.value.sortBy
        ? [`${sortSettings.value.sortBy}:${sortSettings.value.sortDirection}`]
        : ['name:asc'],
      pagination: {
        page: currentPage.value,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  }
};

const refetchArtistsData = () => {
  resetPagination();
  loadArtistsList(true);
};

const selectArtist = (artist: IArtist) => {
  // Optional: handle artist selection if needed
  console.log('Artist selected:', artist);
};

// Handle query results
onArtistsResult(({ data, loading }) => {
  if (!loading && data?.artists) {
    const newArtists = data.artists;

    if (currentPage.value === 1) {
      // First page - replace all artists
      localArtists.value = newArtists;
    } else {
      // Subsequent pages - append new artists
      localArtists.value = [...localArtists.value, ...newArtists];
    }

    // Update pagination info
    totalArtists.value = data.artists_connection?.pageInfo?.total || 0;
    hasMoreArtists.value = newArtists.length === PAGINATION_PAGE_SIZE;
  }
});

onArtistsError((error) => {
  console.error('Error fetching artists for dialog:', error);
  showError('Failed to load artists. Please try again.');
});

// Handle cities results
onResultCities(({ data, loading }) => {
  if (!loading) citiesStore.setCities(data?.cities || []);
});

onErrorCities((error) => {
  console.error('Error fetching cities:', error);
});

// Handle invitation success
onInviteSuccess(({ data }) => {
  const invitedArtist = localArtists.value.find(
    (a) => a.documentId === data?.createInvite?.recipient,
  );
  if (invitedArtist) {
    showSuccess(`Invitation sent to ${invitedArtist.name}!`);
  }
});

// Handle invitation error
onInviteError((error) => {
  console.error('Error sending invitation:', error);
  showError('Failed to send invitation. Please try again.');
});

// Load artists and cities when component mounts and dialog is visible
onMounted(() => {
  if (props.modelValue) {
    loadArtistsList();
    void loadCities();
  }
});
</script>

<style scoped lang="scss">
.artist-invite-dialog {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px 20px 0;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .search-container {
      flex-shrink: 0;
    }

    .artists-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        text-align: center;
      }

      .artists-list {
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;

        // Custom scrollbar styling
        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-track {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      }
    }
  }
}

.body--dark {
  .artist-invite-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dialog-content {
      .artists-container {
        .artists-list {
          &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
          }

          &::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        }
      }
    }
  }
}
</style>
