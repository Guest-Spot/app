<template>
  <div class="full-width flex column q-gap-md">
    <InfoCard icon="map" title="Select location on map" :data="[]">
      <template #header>
        <div class="full-width">
          <OpenStreetMapPicker
            v-model="localSelectedLocation"
            :country="formData.country"
            :state="formData.state"
            :city="formData.city"
            :address="formData.address"
            :data-loading="dataLoading"
            :reverse-geocoding="reverseGeocoding"
            :auto-location="autoLocation"
            @location-changed="emitLocationChanged"
          />
        </div>
      </template>
    </InfoCard>

    <InfoCard
      v-if="resolvedLocationInfo.length > 0"
      icon="location_on"
      title="Location"
      :data="resolvedLocationInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OpenStreetMapPicker from 'src/components/OpenStreetMapPicker.vue';
import InfoCard from 'src/components/InfoCard.vue';
import type { LocationFormData, LocationLatLng } from 'src/composables/useLocationPicker';

type LocationInfoItem = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    formData: LocationFormData;
    selectedLocation: LocationLatLng | null;
    dataLoading?: boolean;
    reverseGeocoding?: boolean;
    locationInfo?: LocationInfoItem[];
    autoLocation?: boolean;
  }>(),
  {
    dataLoading: false,
    reverseGeocoding: false,
    locationInfo: () => [],
    autoLocation: false,
  },
);

const emit = defineEmits<{
  (event: 'update:selectedLocation', value: LocationLatLng | null): void;
  (event: 'location-changed', value: LocationLatLng): void;
}>();

const localSelectedLocation = computed({
  get: () => props.selectedLocation,
  set: (value) => emit('update:selectedLocation', value),
});

const resolvedLocationInfo = computed(() => props.locationInfo ?? []);
const dataLoading = computed(() => props.dataLoading ?? false);
const reverseGeocoding = computed(() => props.reverseGeocoding ?? false);
const autoLocation = computed(() => props.autoLocation ?? false);

const emitLocationChanged = (location: LocationLatLng) => {
  emit('location-changed', location);
};
</script>
