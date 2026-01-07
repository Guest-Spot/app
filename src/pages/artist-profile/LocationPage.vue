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
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit.prevent="handleSave" class="flex column items-start q-gap-sm full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Country</label>
              <q-input
                v-model="formData.country"
                type="text"
                placeholder="Enter country"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="public" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">State</label>
              <q-input
                v-model="formData.state"
                type="text"
                placeholder="Enter state"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="map" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">City</label>
              <q-input
                v-model="formData.city"
                type="text"
                placeholder="Enter city"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="location_city" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Address</label>
              <q-input
                v-model="formData.address"
                type="text"
                placeholder="Enter address"
                outlined
                rounded
                size="lg"
                class="full-width"
                bg-color="transparent"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="home" color="grey-6" />
                </template>
              </q-input>
            </div>

          </q-form>
        </div>
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
import SaveButton from 'src/components/SaveButton.vue';

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
    }
  },
  { immediate: true },
);

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

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

.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}

</style>

