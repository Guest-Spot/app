<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Location</h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <LocationPickerCard
          v-model:selectedLocation="selectedLocation"
          :form-data="formData"
          :data-loading="isLocationLoading"
          :reverse-geocoding="isUpdatingFromMap"
          :location-info="locationInfo"
          @location-changed="handleLocationChanged"
          @remove-address="handleRemoveAddress"
        />
      </div>
    </div>

    <!-- Save Button -->
    <SaveButton :has-changes="!!hasChanges" :loading="loading" @save="handleSave" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useProfile from 'src/composables/useProfile';
import { useLocationPicker } from 'src/composables/useLocationPicker';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vue components with <script setup> are auto-exported
import SaveButton from 'src/components/SaveButton.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vue components with <script setup> are auto-exported
import LocationPickerCard from 'src/components/location/LocationPickerCard.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user, isLoading } = useUser();

const loading = ref(false);
const formData = ref({
  country: '',
  state: '',
  city: '',
  address: '',
});

const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const { handleLocationChanged, isLocationLoading, isUpdatingFromMap, locationInfo, removeAddress } = useLocationPicker(
  {
    formData,
    dataLoading: computed(() => isLoading.value && !user.value),
  },
);

// Load user data
watch(
  user,
  (profile) => {
    if (profile) {
      formData.value = {
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        address: profile.address || '',
      };
      if (profile.profile?.lat != null && profile.profile?.lng != null) {
        selectedLocation.value = {
          lat: profile.profile.lat,
          lng: profile.profile.lng,
        };
      } else {
        selectedLocation.value = null;
      }
      // If user has address, try to geocode it to get coordinates
      // For now, we'll just initialize with empty location
      // In the future, you could add forward geocoding here
    }
  },
  { immediate: true },
);

const { mutate: updateUser } = useMutation(UPDATE_USER_MUTATION);
const { updateProfile } = useProfile();

const hasChanges = computed(() => {
  const currentLat = selectedLocation.value?.lat ?? null;
  const currentLng = selectedLocation.value?.lng ?? null;
  const savedLat = user.value?.profile?.lat ?? null;
  const savedLng = user.value?.profile?.lng ?? null;

  return (
    formData.value.country !== (user.value?.country || '') ||
    formData.value.state !== (user.value?.state || '') ||
    formData.value.city !== (user.value?.city || '') ||
    formData.value.address !== (user.value?.address || '') ||
    currentLat !== savedLat ||
    currentLng !== savedLng
  );
});

const handleRemoveAddress = () => {
  removeAddress();
  selectedLocation.value = null;
};

const handleSave = async () => {
  if (!user.value?.id) {
    showError('User not found');
    return;
  }

  loading.value = true;

  const data: Record<string, unknown> = {};
  if (formData.value.country !== (user.value.country || '')) {
    data.country = formData.value.country || null;
  }
  if (formData.value.state !== (user.value.state || '')) {
    data.state = formData.value.state || null;
  }
  if (formData.value.city !== (user.value.city || '')) {
    data.city = formData.value.city || null;
  }
  if (formData.value.address !== (user.value.address || '')) {
    data.address = formData.value.address || null;
  }
  const locationChanged =
    (selectedLocation.value?.lat ?? null) !== (user.value.profile?.lat ?? null) ||
    (selectedLocation.value?.lng ?? null) !== (user.value.profile?.lng ?? null);
  const profileDocumentId = user.value.profile?.documentId ?? null;

  const mutations: Promise<unknown>[] = [];
  if (Object.keys(data).length > 0) {
    mutations.push(
      updateUser({
        id: user.value.id,
        data,
      }),
    );
  }

  // If address is removed, also remove coordinates from profile
  const shouldRemoveCoordinates = !formData.value.address && (user.value.profile?.lat != null || user.value.profile?.lng != null);
  
  if ((locationChanged || shouldRemoveCoordinates) && profileDocumentId && user.value.profile?.documentId) {
    mutations.push(
      updateProfile(profileDocumentId, {
        lat: selectedLocation.value?.lat ?? null,
        lng: selectedLocation.value?.lng ?? null,
      }),
    );
  }

  if (mutations.length === 0) {
    loading.value = false;
    router.back();
    return;
  }

  try {
    const results = await Promise.all(mutations);
    const hasErrors = results.some((result) => {
      if (typeof result !== 'object' || result === null) {
        return false;
      }
      const errors = (result as { errors?: unknown[] }).errors;
      return Array.isArray(errors) && errors.length > 0;
    });

    await fetchMe();

    if (hasErrors) {
      showError('Error updating location');
      return;
    }

    showSuccess('Location successfully updated');
    router.back();
  } catch (error) {
    console.error('Error updating location:', error);
    showError('Error updating location');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

</style>
