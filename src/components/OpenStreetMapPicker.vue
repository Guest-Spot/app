<template>
  <div class="openstreetmap-picker full-width flex column q-gap-sm">
    <div class="search-container" ref="searchContainerRef">
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Search for a place..."
        debounce="500"
        rounded
        @update:model-value="handleSearch"
        @focus="showSearchResults = searchResults.length > 0 || (searchQuery.length >= 2 && searching)"
        @blur="hideSearchResultsDelayed"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        <template v-if="searching" v-slot:append>
          <q-spinner size="sm" />
        </template>
        <template v-else-if="searchQuery" v-slot:append>
          <q-icon
            name="close"
            class="cursor-pointer"
            @click.stop="clearSearch"
          />
        </template>
      </q-input>

      <div
        v-if="showSearchResults && (searchResults.length > 0 || (searchQuery && !searching))"
        class="search-results-dropdown"
      >
        <q-list v-if="searchResults.length > 0" class="search-results-list">
          <q-item
            v-for="(result, index) in searchResults"
            :key="index"
            clickable
            @mousedown.prevent
            @click="selectSearchResult(result)"
          >
            <q-item-section avatar>
              <q-icon name="place" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ result.displayName }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-list v-else-if="searchQuery && !searching" class="search-results-list">
          <q-item>
            <q-item-section>
              <q-item-label class="text-grey-6">No results found</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <div ref="mapContainer" class="map-container border-radius-lg"></div>
    <div v-if="loading" class="map-loading flex items-center justify-center">
      <q-spinner size="md" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { forwardGeocode, type ForwardGeocodingResult } from 'src/utils/geocoding';

// Fix for default marker icon in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  modelValue?: { lat: number; lng: number } | null;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
}

interface Emits {
  (e: 'update:modelValue', value: { lat: number; lng: number } | null): void;
  (e: 'location-changed', location: { lat: number; lng: number }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLDivElement | null>(null);
const searchContainerRef = ref<HTMLDivElement | null>(null);
const loading = ref(true);
let map: L.Map | null = null;
let marker: L.Marker<L.LatLngExpression> | null = null;

// Search functionality
const searchQuery = ref('');
const searchResults = ref<ForwardGeocodingResult[]>([]);
const searching = ref(false);
const showSearchResults = ref(false);
let hideSearchResultsTimeout: ReturnType<typeof setTimeout> | null = null;

const buildAddressQuery = (): string | null => {
  const parts: string[] = [];
  if (props.address) parts.push(props.address);
  if (props.city) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);

  return parts.length > 0 ? parts.join(', ') : null;
};

const geocodeAddressOnInit = async () => {
  // If we already have coordinates, don't geocode
  if (props.modelValue) {
    return;
  }

  // Build address query from available fields
  const addressQuery = buildAddressQuery();
  if (!addressQuery) {
    return;
  }

  try {
    // Add delay to respect Nominatim rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const results = await forwardGeocode(addressQuery, 1);

    if (results.length > 0 && map && marker) {
      const result = results[0];
      if (result) {
        const position: [number, number] = [result.lat, result.lng];

        marker.setLatLng(position);
        map.setView(position, 15);

        const location = {
          lat: result.lat,
          lng: result.lng,
        };
        emit('update:modelValue', location);
        emit('location-changed', location);
      }
    }
  } catch (error) {
    console.error('Error during initial geocoding:', error);
  }
};

const initializeMap = () => {
  if (!mapContainer.value) {
    return;
  }

  try {
    // Default center (can be changed based on user's current location or saved location)
    const defaultCenter: [number, number] = props.modelValue
      ? [props.modelValue.lat, props.modelValue.lng]
      : [40.7128, -74.006]; // New York default

    // Initialize map
    map = L.map(mapContainer.value, {
      center: defaultCenter,
      zoom: props.modelValue ? 15 : 10,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19,
    }).addTo(map);

    // Create marker
    marker = L.marker(defaultCenter, {
      draggable: true,
    }).addTo(map);

    // Update position when marker is dragged
    marker.on('dragend', () => {
      if (marker) {
        const latlng = marker.getLatLng();
        const location = {
          lat: latlng.lat,
          lng: latlng.lng,
        };
        emit('update:modelValue', location);
        emit('location-changed', location);
      }
    });

    // Update position when map is clicked
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (marker) {
        const location = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        };
        marker.setLatLng(e.latlng);
        emit('update:modelValue', location);
        emit('location-changed', location);
      }
    });

    // Wait for map to be fully loaded
    map.whenReady(() => {
      loading.value = false;
      // If we have address data but no coordinates, try to geocode
      void geocodeAddressOnInit();
    });
  } catch (error) {
    console.error('Error loading OpenStreetMap:', error);
    loading.value = false;
  }
};

// Search handlers
const handleSearch = async (query: string | number | null) => {
  const queryString = typeof query === 'string' ? query : String(query || '');
  if (!queryString || queryString.trim().length < 2) {
    searchResults.value = [];
    showSearchResults.value = false;
    return;
  }

  searching.value = true;
  try {
    // Add delay to respect Nominatim rate limits (1 request per second)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const results = await forwardGeocode(queryString, 5);
    searchResults.value = results;
    showSearchResults.value = results.length > 0;
  } catch (error) {
    console.error('Error during search:', error);
    searchResults.value = [];
    showSearchResults.value = false;
  } finally {
    searching.value = false;
  }
};

const selectSearchResult = (result: ForwardGeocodingResult) => {
  const position: [number, number] = [result.lat, result.lng];

  if (map && marker) {
    marker.setLatLng(position);
    map.setView(position, 15);

    const location = {
      lat: result.lat,
      lng: result.lng,
    };
    emit('update:modelValue', location);
    emit('location-changed', location);
  }

  searchQuery.value = result.displayName;
  searchResults.value = [];
  showSearchResults.value = false;
};

const clearSearch = () => {
  searchQuery.value = '';
  searchResults.value = [];
  showSearchResults.value = false;
};

const hideSearchResultsDelayed = () => {
  // Small delay to allow clicking on results
  if (hideSearchResultsTimeout) {
    clearTimeout(hideSearchResultsTimeout);
  }
  hideSearchResultsTimeout = setTimeout(() => {
    showSearchResults.value = false;
  }, 200);
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && map && marker) {
      const position: [number, number] = [newValue.lat, newValue.lng];
      marker.setLatLng(position);
      map.setView(position, 15);
    }
  },
  { deep: true },
);

// Watch for address changes and geocode if no coordinates are set
watch(
  () => [props.country, props.state, props.city, props.address],
  async () => {
    // Only geocode if we don't have coordinates and map is initialized
    if (!props.modelValue && map && marker) {
      await geocodeAddressOnInit();
    }
  },
  { deep: true },
);

onMounted(() => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    void initializeMap();
  }, 100);
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
  if (marker) {
    marker = null;
  }
  if (hideSearchResultsTimeout) {
    clearTimeout(hideSearchResultsTimeout);
  }
});
</script>

<style scoped lang="scss">
.openstreetmap-picker {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 300px;
  min-height: 300px;
  z-index: 1;
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
}

// Leaflet styles override
:deep(.leaflet-container) {
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:deep(.leaflet-control-attribution) {
  display: none;
}
</style>

