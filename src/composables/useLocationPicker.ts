import { computed, ref, watch, type Ref } from 'vue';
import { reverseGeocode } from 'src/utils/geocoding';

export type LocationFormData = {
  country: string;
  state: string;
  city: string;
  address: string;
};

export type LocationLatLng = {
  lat: number;
  lng: number;
};

type LocationInfoItem = {
  label: string;
  value: string;
};

type UseLocationPickerOptions = {
  formData: Ref<LocationFormData>;
  dataLoading?: Ref<boolean>;
};

export const useLocationPicker = ({ formData, dataLoading }: UseLocationPickerOptions) => {
  const isUpdatingFromMap = ref(false);
  const isLocationLoading = computed(() => dataLoading?.value ?? false);
  const addressRemovedByUser = ref(false);

  const handleLocationChanged = async (location: LocationLatLng) => {
    isUpdatingFromMap.value = true;
    try {
      // Add a small delay to respect Nominatim rate limits (1 request per second)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await reverseGeocode(location.lat, location.lng);
      if (result) {
        formData.value = {
          country: result.country || formData.value.country,
          state: result.state || formData.value.state,
          city: result.city || formData.value.city,
          // Don't auto-fill address if user explicitly removed it
          address: addressRemovedByUser.value ? formData.value.address : (result.address || formData.value.address),
        };
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
    } finally {
      isUpdatingFromMap.value = false;
    }
  };

  const locationInfo = computed<LocationInfoItem[]>(() => {
    const items: LocationInfoItem[] = [];
    if (formData.value.country) {
      items.push({ label: 'Country', value: formData.value.country });
    }
    if (formData.value.state) {
      items.push({ label: 'State', value: formData.value.state });
    }
    if (formData.value.city) {
      items.push({ label: 'City', value: formData.value.city });
    }
    // Address is excluded from locationInfo - it will be shown separately with delete button
    return items;
  });

  const removeAddress = () => {
    formData.value.address = '';
    addressRemovedByUser.value = true;
  };

  // Reset flag when address is manually set (not from reverse geocoding)
  watch(
    () => formData.value.address,
    (newAddress) => {
      // If address is set and not empty, reset the flag (user might have manually entered it)
      if (newAddress && newAddress.trim() && !isUpdatingFromMap.value) {
        addressRemovedByUser.value = false;
      }
    },
  );

  return {
    handleLocationChanged,
    isLocationLoading,
    isUpdatingFromMap,
    locationInfo,
    removeAddress,
  };
};
