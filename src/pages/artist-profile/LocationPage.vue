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
        <!-- OpenStreetMap Section -->
        <InfoCard icon="map" title="Select location on map" :data="[]" class="q-mb-md">
          <template #header>
            <div class="full-width">
              <OpenStreetMapPicker
                v-model="selectedLocation"
                :country="formData.country"
                :state="formData.state"
                :city="formData.city"
                :address="formData.address"
                @location-changed="handleLocationChanged"
              />
            </div>
          </template>
        </InfoCard>

        <InfoCard
          v-if="locationInfo.length > 0"
          icon="location_on"
          title="Location"
          :data="locationInfo"
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vue components with <script setup> are auto-exported
import SaveButton from 'src/components/SaveButton.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vue components with <script setup> are auto-exported
import OpenStreetMapPicker from 'src/components/OpenStreetMapPicker.vue';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vue components with <script setup> are auto-exported
import InfoCard from 'src/components/InfoCard.vue';
import { reverseGeocode } from 'src/utils/geocoding';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref({
  country: '',
  state: '',
  city: '',
  address: '',
});

const selectedLocation = ref<{ lat: number; lng: number } | null>(null);
const isUpdatingFromMap = ref(false);

const handleLocationChanged = async (location: { lat: number; lng: number }) => {
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
      // If user has address, try to geocode it to get coordinates
      // For now, we'll just initialize with empty location
      // In the future, you could add forward geocoding here
    }
  },
  { immediate: true },
);

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

const locationInfo = computed(() => {
  const items = [];
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

const hasChanges = computed(() => {
  return (
    formData.value.country !== (user.value?.country || '') ||
    formData.value.state !== (user.value?.state || '') ||
    formData.value.city !== (user.value?.city || '') ||
    formData.value.address !== (user.value?.address || '')
  );
});

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating location');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Location successfully updated');
      router.back();
    });
  }
});

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

  if (Object.keys(data).length === 0) {
    loading.value = false;
    router.back();
    return;
  }

  await updateUser({
    id: user.value.id,
    data,
  });
};
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

</style>

