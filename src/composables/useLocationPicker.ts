import { computed, ref, type Ref } from 'vue';
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
          address: result.address || formData.value.address,
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
    if (formData.value.address) {
      items.push({ label: 'Address', value: formData.value.address });
    }
    return items;
  });

  return {
    handleLocationChanged,
    isLocationLoading,
    isUpdatingFromMap,
    locationInfo,
  };
};
