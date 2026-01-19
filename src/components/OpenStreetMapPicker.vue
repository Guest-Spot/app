<template>
  <div class="openstreetmap-picker full-width flex column q-gap-md">
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

    <div class="map-wrapper border-radius-lg">
      <div ref="mapContainer" class="map-container"></div>
      <q-btn
        v-if="!showSkeleton && !loading && mapInitialized"
        round
        unelevated
        color="white"
        text-color="dark"
        icon="my_location"
        class="my-location-btn"
        :loading="gettingLocation"
        @click="getCurrentLocation"
      />
      <q-skeleton v-if="showSkeleton" width="100%" height="100%" class="map-skeleton bg-block border-radius-lg" />
      <div v-else-if="loading" class="map-loading flex items-center justify-center">
        <q-spinner size="md" />
      </div>
      <q-linear-progress
        v-if="isGeocoding || reverseGeocoding"
        indeterminate
        color="primary"
        class="geocoding-loader"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { forwardGeocode, type ForwardGeocodingResult } from 'src/utils/geocoding';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

// Create custom marker with primary color
const createCustomMarkerIcon = (): L.DivIcon => {
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--q-primary').trim() || '#ff3d00';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16C0 28.5 16 41 16 41C16 41 32 28.5 32 16C32 7.163 24.837 0 16 0Z" fill="${primaryColor}"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [32, 41],
    iconAnchor: [16, 41],
    popupAnchor: [0, -41],
  });
};

interface Props {
  modelValue?: { lat: number; lng: number } | null;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  dataLoading?: boolean;
  reverseGeocoding?: boolean;
  autoLocation?: boolean;
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
const isDataLoading = computed(() => props.dataLoading ?? false);
const reverseGeocoding = computed(() => props.reverseGeocoding ?? false);
const initialLocationResolved = ref(false);
const initialGeocodeInProgress = ref(false);
const showSkeleton = computed(() => isDataLoading.value || !initialLocationResolved.value);
const autoLocationCalled = ref(false);
let map: L.Map | null = null;
let marker: L.Marker<L.LatLngExpression> | null = null;

// Search functionality
const searchQuery = ref('');
const searchResults = ref<ForwardGeocodingResult[]>([]);
const searching = ref(false);
const showSearchResults = ref(false);
let hideSearchResultsTimeout: ReturnType<typeof setTimeout> | null = null;

// Geocoding state
const isGeocoding = ref(false);

// Geolocation state
const gettingLocation = ref(false);
const mapInitialized = ref(false);

const hasTextAddress = computed(() => {
  return Boolean(
    (props.address && props.address.trim()) ||
      (props.city && props.city.trim()) ||
      (props.state && props.state.trim()) ||
      (props.country && props.country.trim()),
  );
});

const shouldEmitGeocodeUpdates = computed(() => {
  return Boolean(props.address && props.address.trim());
});

const hasCoordinates = computed(() => {
  return props.modelValue?.lat != null && props.modelValue?.lng != null;
});

const hasAnyLocation = computed(() => hasTextAddress.value || hasCoordinates.value);

const popupContent = computed(() => {
  const parts: string[] = [];
  if (props.city) {
    parts.push(props.city);
  }
  if (props.state) {
    parts.push(props.state);
  }
  if (props.country) {
    parts.push(props.country);
  }
  return parts.length > 0 ? parts.join(', ') : 'Location';
});

const updateMarkerPopup = () => {
  if (!marker) {
    return;
  }
  marker.bindPopup(popupContent.value);
  if (map && map.hasLayer(marker)) {
    marker.openPopup();
  }
};

const ensureMarkerVisible = () => {
  if (map && marker && !map.hasLayer(marker)) {
    marker.addTo(map);
  }
};

const hideMarker = () => {
  if (map && marker && map.hasLayer(marker)) {
    marker.remove();
  }
};

const buildAddressQuery = (): string | null => {
  const parts: string[] = [];
  if (props.address) parts.push(props.address);
  if (props.city) parts.push(props.city);
  if (props.state) parts.push(props.state);
  if (props.country) parts.push(props.country);

  return parts.length > 0 ? parts.join(', ') : null;
};

const geocodeAddressOnInit = async (emitUpdates: boolean = true) => {
  // If we already have coordinates, don't geocode
  if (props.modelValue) {
    return;
  }

  // Build address query from available fields
  const addressQuery = buildAddressQuery();
  if (!addressQuery) {
    return;
  }

  isGeocoding.value = true;
  try {
    // Add delay to respect Nominatim rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const results = await forwardGeocode(addressQuery, 1);

    if (results.length > 0 && map && marker) {
      const result = results[0];
      if (result) {
        const position: [number, number] = [result.lat, result.lng];

        marker.setLatLng(position);
        map.setView(position, emitUpdates ? 15 : 11);

        if (emitUpdates) {
          ensureMarkerVisible();
          updateMarkerPopup();
          const location = {
            lat: result.lat,
            lng: result.lng,
          };
          emit('update:modelValue', location);
          emit('location-changed', location);
        } else {
          hideMarker();
        }
      }
    }
  } catch (error) {
    console.error('Error during initial geocoding:', error);
  } finally {
    isGeocoding.value = false;
  }
};

const resolveInitialLocation = async () => {
  if (initialLocationResolved.value || isDataLoading.value) {
    return;
  }

  if (props.modelValue) {
    initialLocationResolved.value = true;
    return;
  }

  const addressQuery = buildAddressQuery();
  if (!addressQuery) {
    initialLocationResolved.value = true;
    return;
  }

  if (!map || !marker || initialGeocodeInProgress.value) {
    return;
  }

  initialGeocodeInProgress.value = true;
  try {
    await geocodeAddressOnInit(shouldEmitGeocodeUpdates.value);
  } finally {
    initialGeocodeInProgress.value = false;
    initialLocationResolved.value = true;
  }
};

const initializeMap = () => {
  if (!mapContainer.value || map || isDataLoading.value) {
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

    // Create marker with custom primary color icon
    marker = L.marker(defaultCenter, {
      draggable: true,
      icon: createCustomMarkerIcon(),
    });
    if (hasCoordinates.value) {
      marker.addTo(map);
    }

    // Bind popup to marker
    marker.bindPopup(popupContent.value);

    // Update position when marker is dragged
    marker.on('dragend', () => {
      if (marker) {
        const latlng = marker.getLatLng();
        const location = {
          lat: latlng.lat,
          lng: latlng.lng,
        };
        // Popup will be updated when reverse geocoding completes via watch on props
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
        ensureMarkerVisible();
        emit('update:modelValue', location);
        emit('location-changed', location);
      }
    });

    // Open popup when marker is clicked
    marker.on('click', () => {
      if (marker) {
        marker.openPopup();
      }
    });

    // Wait for map to be fully loaded
    map.whenReady(() => {
      loading.value = false;
      mapInitialized.value = true;
      void resolveInitialLocation();
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
    ensureMarkerVisible();
    updateMarkerPopup();

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

// Get current user location using Capacitor Geolocation
const getCurrentLocation = async () => {
  if (gettingLocation.value || !map || !marker) {
    return;
  }

  gettingLocation.value = true;

  try {
    // Check and request permissions
    let permissionStatus = await Geolocation.checkPermissions();

    if (permissionStatus.location === 'prompt' || permissionStatus.location === 'prompt-with-rationale') {
      permissionStatus = await Geolocation.requestPermissions();
    }

    if (permissionStatus.location !== 'granted') {
      console.error('Location permission denied');
      return;
    }

    // Get current position with high accuracy for real GPS location
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    const { latitude, longitude } = position.coords;
    const location = { lat: latitude, lng: longitude };
    const positionArray: [number, number] = [latitude, longitude];

    // Update marker and map
    marker.setLatLng(positionArray);
    map.setView(positionArray, 15);
    ensureMarkerVisible();
    updateMarkerPopup();

    // Emit events
    emit('update:modelValue', location);
    emit('location-changed', location);
  } catch (error) {
    console.error('Error getting current location:', error);

    // Fallback to browser geolocation API for web platform
    if (!Capacitor.isNativePlatform() && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          const positionArray: [number, number] = [latitude, longitude];

          if (map && marker) {
            marker.setLatLng(positionArray);
            map.setView(positionArray, 15);
            ensureMarkerVisible();
            updateMarkerPopup();
            emit('update:modelValue', location);
            emit('location-changed', location);
          }
        },
        (err) => {
          console.error('Browser geolocation error:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
  } finally {
    gettingLocation.value = false;
  }
};

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && map && marker) {
      const position: [number, number] = [newValue.lat, newValue.lng];
      marker.setLatLng(position);
      map.setView(position, 15);
      ensureMarkerVisible();
      updateMarkerPopup();
    }
    if (newValue) {
      initialLocationResolved.value = true;
      return;
    }
    hideMarker();
    if (map && marker && hasTextAddress.value) {
      void geocodeAddressOnInit(shouldEmitGeocodeUpdates.value);
      return;
    }
    void resolveInitialLocation();
  },
  { deep: true },
);

// Watch for address changes and geocode if no coordinates are set
watch(
  () => [props.country, props.state, props.city, props.address],
  async () => {
    // Update popup when location data changes
    if (map && marker) {
      updateMarkerPopup();
    }
    // Only geocode if we don't have coordinates and map is initialized
    if (!props.modelValue && map && marker) {
      if (!initialLocationResolved.value) {
        await resolveInitialLocation();
        return;
      }
      await geocodeAddressOnInit(shouldEmitGeocodeUpdates.value);
    }
  },
  { deep: true },
);

onMounted(() => {
  // Small delay to ensure DOM is ready
  if (!isDataLoading.value) {
    setTimeout(() => {
      void initializeMap();
    }, 100);
  }
  void resolveInitialLocation();
});

watch(
  () => isDataLoading.value,
  (dataLoading) => {
    if (!dataLoading) {
      setTimeout(() => {
        void initializeMap();
      }, 100);
      void resolveInitialLocation();
    }
  },
);

watch(
  () => [props.autoLocation, isDataLoading.value, mapInitialized.value, hasAnyLocation.value],
  () => {
    if (
      props.autoLocation &&
      !isDataLoading.value &&
      mapInitialized.value &&
      !hasAnyLocation.value &&
      !autoLocationCalled.value
    ) {
      autoLocationCalled.value = true;
      void getCurrentLocation();
    }
  },
  { immediate: true },
);

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
  mapInitialized.value = false;
});
</script>

<style scoped lang="scss">
.openstreetmap-picker {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.map-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
  min-height: 300px;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-skeleton,
.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
}

.map-skeleton {
  pointer-events: all;
}

.map-loading {
  background-color: rgba(255, 255, 255, 0.8);
}

// Leaflet styles override
:deep(.leaflet-container) {
  font-family: inherit;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

.custom-marker {
  background: transparent;
  border: none;
}

.geocoding-loader {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
}

.my-location-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
