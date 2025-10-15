<template>
  <div class="step-content step-artists">
    <div class="search-container">
      <SearchHeader
        v-model="innerSearchQuery"
        :title="artistListTitle"
        :has-filters="hasActiveFilters"
        :has-sort="hasActiveSort"
        @toggle-search="emit('openSearch')"
        @toggle-filters="emit('openFilter')"
        @toggle-sort="emit('openSort')"
      />
    </div>

    <div class="artists-container">
      <div v-if="isLoading && !artists.length" class="loading-container">
        <q-spinner-dots size="40px" color="primary" />
        <div class="text-grey-6 q-mt-md">Loading artists...</div>
      </div>

      <div v-else-if="!isLoading && !artists.length" class="no-results">
        <q-icon name="person_search" size="48px" color="grey-6" />
        <div class="text-grey-6 q-mt-md">No artists found</div>
      </div>

      <div v-else class="artists-list q-pb-lg">
        <InfiniteScrollWrapper
          class="flex column q-gap-md"
          :offset="150"
          :loading="isLoading"
          :stop="!hasMoreArtists"
          @load-more="emit('loadMore')"
        >
          <div
            v-for="artist in artists"
            :key="artist.documentId"
            class="artist-option bg-block border-radius-md q-pa-md flex q-gap-md items-start"
            :class="{ selected: artist.documentId === selectedArtistId }"
            @click="emit('select', artist)"
          >
            <q-avatar size="72px" class="bg-block">
              <q-img
                v-if="artist.avatar?.url"
                :src="artist.avatar.url"
                ratio="1"
                class="avatar-img"
                spinner-size="24px"
              />
              <q-icon v-else name="person" size="42px" color="grey-6" />
            </q-avatar>

            <div class="artist-details flex column q-gap-xs">
              <div class="artist-name">{{ artist.name }}</div>
              <div v-if="artist.city || artist.address" class="artist-meta text-grey-6">
                <q-icon name="location_on" size="14px" />
                <span>{{ [artist.city, artist.address].filter(Boolean).join(' ') }}</span>
              </div>
              <div v-if="artist.experience" class="artist-meta text-grey-6">
                <q-icon name="work" size="14px" />
                <span>{{ `${artist.experience}+ years` }}</span>
              </div>
            </div>

            <q-icon
              v-if="artist.documentId === selectedArtistId"
              name="check_circle"
              size="24px"
              color="primary"
              class="selected-icon"
            />
          </div>

          <template #loading>
            <div class="row justify-center q-my-md">
              <q-spinner-dots color="primary" size="40px" />
            </div>
          </template>
        </InfiniteScrollWrapper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { IUser } from 'src/interfaces/user';
import { SearchHeader } from 'src/components/SearchPage';
import InfiniteScrollWrapper from 'src/components/InfiniteScrollWrapper.vue';

const props = defineProps({
  artists: {
    type: Array as PropType<IUser[]>,
    default: () => [],
  },
  selectedArtistId: {
    type: String,
    default: null,
  },
  searchQuery: {
    type: String,
    default: '',
  },
  artistListTitle: {
    type: String,
    required: true,
  },
  hasActiveFilters: {
    type: Boolean,
    default: false,
  },
  hasActiveSort: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasMoreArtists: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void;
  (e: 'openSearch'): void;
  (e: 'openFilter'): void;
  (e: 'openSort'): void;
  (e: 'loadMore'): void;
  (e: 'select', artist: IUser): void;
}>();

const innerSearchQuery = computed({
  get: () => props.searchQuery,
  set: (val: string) => emit('update:searchQuery', val),
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
}

.step-artists {
  flex: 1;
  min-height: 0;
}

.artists-container {
  flex: 1;
  overflow-y: auto;
  padding-top: 2px;

  .loading-container,
  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 240px;
    text-align: center;
    gap: 12px;
  }

  .artist-option {
    cursor: pointer;
    border: 1px solid transparent;
    transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;

    &.selected {
      border-color: var(--q-primary);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
    }

    &:hover {
      transform: translateY(-2px);
    }

    .artist-name {
      font-size: 18px;
      font-weight: 700;
      line-height: 1.2;
    }

    .artist-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .selected-icon {
      margin-left: auto;
    }
  }
}

:global(.body--dark) .artist-option {
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.body--dark) .artist-option:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

:global(.body--dark) .artist-option.selected {
  border-color: var(--q-primary);
  box-shadow: 0 10px 30px rgba(255, 255, 255, 0.15);
}
</style>
