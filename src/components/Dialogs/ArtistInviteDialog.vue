<template>
  <q-dialog v-model="isVisible" position="bottom" maximized>
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
        <!-- Search Field -->
        <div class="search-container q-mb-lg">
          <q-input
            v-model="searchQuery"
            outlined
            dense
            rounded
            placeholder="Search artists..."
            class="search-input"
            clearable
            @input="onSearchInput"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
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
                    label="Invite to shop"
                    icon="person_add"
                    color="primary"
                    class="bg-block full-width"
                    @click.stop="inviteArtist(artist)"
                  />
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
import { useQuasar } from 'quasar';
import { useLazyQuery } from '@vue/apollo-composable';
import { ArtistCard } from 'src/components/SearchPage';
import { ARTISTS_QUERY } from 'src/apollo/types/artist';
import type { IArtist, IGraphQLArtistsResult } from 'src/interfaces/artist';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';

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
const $q = useQuasar();

const isVisible = ref(props.modelValue);
const searchQuery = ref('');

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

const title = computed(() => 'Invite Artist to Shop');

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      loadArtistsList();
    }
  },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

// Methods
const closeDialog = () => {
  isVisible.value = false;
  // Reset search when closing dialog
  searchQuery.value = '';
  // Reset pagination
  currentPage.value = 1;
  localArtists.value = [];
  hasMoreArtists.value = true;
};

const loadArtistsList = () => {
  // Only load if we don't have artists data yet
  if (localArtists.value.length === 0 && !isLoadingQuery.value) {
    currentPage.value = 1;
    void loadArtistsQuery(null, {
      sort: ['name:asc'],
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
      sort: ['name:asc'],
      pagination: {
        page: currentPage.value,
        pageSize: PAGINATION_PAGE_SIZE,
      },
    });
  }
};

const onSearchInput = () => {
  // Search is handled by computed property filteredArtists
  // Could add debouncing here if needed for API calls
};

const selectArtist = (artist: IArtist) => {
  // Optional: handle artist selection if needed
  console.log('Artist selected:', artist);
};

const inviteArtist = (artist: IArtist) => {
  $q.notify({
    type: 'positive',
    color: 'dark',
    message: `Invitation sent to ${artist.name}!`,
    position: 'top',
    timeout: 3000,
    actions: [
      {
        icon: 'close',
        color: 'white',
      },
    ],
  });

  emit('artistInvited', artist);
  closeDialog();
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
  $q.notify({
    type: 'negative',
    message: 'Failed to load artists. Please try again.',
    position: 'top',
    timeout: 3000,
  });
});

// Load artists when component mounts and dialog is visible
onMounted(() => {
  if (props.modelValue) {
    loadArtistsList();
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

      .search-input {
        width: 100%;
      }
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
