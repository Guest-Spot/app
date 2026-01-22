<template>
  <div class="full-width flex column q-gap-md">
    <InfoCard icon="map" title="Select your location on the map" :data="[]">
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
      v-if="resolvedLocationInfo.length > 0 || hasAddress"
      icon="location_on"
      title="Location"
      :data="resolvedLocationInfo"
    >
      <template #footer>
        <div v-if="hasAddress" class="info-row flex row no-wrap address-row">
          <span class="info-label text-grey-6">Address:</span>
          <ExpandableText
            :text="formData.address"
            collapsible
            class="info-value text-grey-6"
            formatted
          />
          <div class="flex items-center q-gap-sm q-ml-auto mt-minus-5">
            <q-btn
              icon="close"
              size="sm"
              round
              unelevated
              class="bg-block"
              text-color="primary"
              aria-label="Remove address"
              @click="handleRemoveAddress"
            />
          </div>
        </div>
      </template>
    </InfoCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import OpenStreetMapPicker from 'src/components/OpenStreetMapPicker.vue';
import InfoCard from 'src/components/InfoCard.vue';
import ExpandableText from 'src/components/ExpandableText.vue';
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
  (event: 'remove-address'): void;
}>();

const localSelectedLocation = computed({
  get: () => props.selectedLocation,
  set: (value) => emit('update:selectedLocation', value),
});

const resolvedLocationInfo = computed(() => props.locationInfo ?? []);
const dataLoading = computed(() => props.dataLoading ?? false);
const reverseGeocoding = computed(() => props.reverseGeocoding ?? false);
const autoLocation = computed(() => props.autoLocation ?? false);

const hasAddress = computed(() => {
  return Boolean(props.formData.address && props.formData.address.trim());
});

const emitLocationChanged = (location: LocationLatLng) => {
  emit('location-changed', location);
};

const handleRemoveAddress = () => {
  emit('remove-address');
};
</script>

<style scoped lang="scss">
  .address-row {
    gap: 12px;

    .info-label {
      font-weight: 600;
      min-width: 90px;
      flex-shrink: 0;
      display: block;
    }
  }
</style>
