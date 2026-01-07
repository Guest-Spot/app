<template>
  <div class="openstreetmap-picker full-width">
    <div ref="mapContainer" class="map-container"></div>
    <div v-if="loading" class="map-loading flex items-center justify-center">
      <q-spinner size="md" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
}

interface Emits {
  (e: 'update:modelValue', value: { lat: number; lng: number } | null): void;
  (e: 'location-changed', location: { lat: number; lng: number }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mapContainer = ref<HTMLDivElement | null>(null);
const loading = ref(true);
let map: L.Map | null = null;
let marker: L.Marker<L.LatLngExpression> | null = null;

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
    });
  } catch (error) {
    console.error('Error loading OpenStreetMap:', error);
    loading.value = false;
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
    }
  },
  { deep: true },
);

onMounted(() => {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    initializeMap();
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

