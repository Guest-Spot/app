<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Navigation Tabs -->
      <div class="q-mb-md">
        <SearchTabs
          v-model="activeTab"
        />
      </div>

      <SearchHeader
        v-model="searchQuery"
        :title="activeTab === TAB_SHOPS ? `Shops (${shops.length})` : `Artists (${artists.length})`"
        :has-filters="hasActiveFilters"
        :has-sort="hasActiveSort"
        @toggle-filters="showFilterDialog = true"
        @toggle-sort="showSortDialog = true"
      />

      <!-- Dialogs -->
      <FilterDialog
        v-model="showFilterDialog"
        v-model:filterValue="activeFilters"
      />

      <SortDialog
        v-model="showSortDialog"
        v-model:sortValue="sortSettings"
      />

      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <!-- Shops Tab Content -->
        <div v-if="activeTab === TAB_SHOPS" class="tab-content">
          <LoadingState
            v-if="isLoadingShops && !shops.length"
            :is-loading="isLoadingShops"
            title="Loading shops..."
            description="Please wait while we fetch the latest shops"
            spinner-name="dots"
          />
          <div v-else-if="shops.length" class="flex column q-gap-md">
            <ShopCard
              v-for="shop in shops"
              :key="shop.uuid"
              :shop="shop"
              @click="selectShop"
            />
          </div>
          <NoResult
            v-else
            icon="search_off"
            title="No shops found"
            description="Try adjusting your search or filters"
          />
        </div>

        <!-- Artists Tab Content -->
        <div v-else-if="activeTab === TAB_ARTISTS" class="tab-content">
          <LoadingState
            v-if="isLoadingArtists && !artists.length"
            :is-loading="isLoadingArtists"
            title="Loading artists..."
            description="Please wait while we fetch the latest artists"
            spinner-name="dots"
          />
          <div v-else-if="artists.length" class="flex column q-gap-md">
            <ArtistCard
              v-for="artist in artists"
              :key="artist.uuid"
              :artist="artist"
              @click="selectArtist"
            />
          </div>
          <NoResult
            v-else
            icon="search_off"
            title="No artists found"
            description="Try adjusting your search or filters"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { SearchTabs, ShopCard, ArtistCard, TAB_SHOPS, TAB_ARTISTS } from '../components/SearchPage';
import type { IShop } from 'src/interfaces/shop';
import type { IArtist } from 'src/interfaces/artist';
import NoResult from 'src/components/NoResult.vue';
import LoadingState from 'src/components/LoadingState.vue';
import useShops from 'src/modules/useShops';
import useArtists from 'src/modules/useArtists';
import SearchHeader from 'src/components/SearchPage/SearchHeader.vue';
import { FilterDialog, SortDialog } from 'src/components/Dialogs';
import useCities from 'src/modules/useCities';
import type { IFilters } from 'src/interfaces/filters';

// Router
const router = useRouter();

// Tab management
const activeTab = ref(TAB_SHOPS);
const showFilterDialog = ref(false);
const showSortDialog = ref(false);
const searchQuery = ref('');

const activeFilters = ref<IFilters>({
  city: null,
});

// Sort settings
interface SortSettings {
  sortBy: string | null;
  sortDirection: 'asc' | 'desc';
}

const sortSettings = ref<SortSettings>({
  sortBy: null,
  sortDirection: 'desc'
});

const { shops, fetchShops, isLoading: isLoadingShops } = useShops();
const { artists, fetchArtists, isLoading: isLoadingArtists } = useArtists();
const { fetchCities } = useCities();

// Computed properties for filtered results
const hasActiveFilters = computed(() => Object.values(activeFilters.value).some(filter => filter !== null));

const hasActiveSort = computed(() => sortSettings.value.sortBy !== null);

const selectShop = (shop: IShop) => {
  void router.push(`/shop/${shop.uuid}`);
};

const selectArtist = (artist: IArtist) => {
  void router.push(`/artist/${artist.uuid}`);
};

watch([activeFilters, searchQuery, sortSettings], ([newFilters, newSearchQuery, newSortSettings]) => {
  const resultFilters = { ...newFilters, name: newSearchQuery };
  if (activeTab.value === TAB_SHOPS) {
    void fetchShops(resultFilters, {
      sort: {
        column: newSortSettings.sortBy || 'name',
        direction: newSortSettings.sortDirection
      }
    });
  } else {
    void fetchArtists(resultFilters, {
      sort: {
        column: newSortSettings.sortBy || 'name',
        direction: newSortSettings.sortDirection
      }
    });
  }
});



onBeforeMount(() => {
  void fetchShops();
  void fetchArtists();
  void fetchCities();
});
</script>
