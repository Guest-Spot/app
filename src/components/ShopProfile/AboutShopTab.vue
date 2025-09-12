<template>
  <div class="about-shop-tab flex column q-gap-md">
    <!-- Banner Image Section -->
    <ImageUploaderV2
      :images="shopData.pictures || []"
      placeholder="Upload images"
      multiple
      placeholderIcon="photo_library"
      @on-change="imagesForUpload = $event"
      @on-remove="imagesForRemove = $event"
    />

    <!-- Basic Information -->
    <q-expansion-item
      icon="info"
      label="Basic Information"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Name</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop name"
            class="custom-input"
            v-model="shopData.name"
            clearable
          />
        </div>
        <div class="input-group">
          <label class="input-label">Description</label>
          <q-input
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Enter shop description"
            class="custom-input"
            v-model="shopData.description"
            maxlength="200"
            counter
            clearable
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts -->
    <q-expansion-item
      icon="location_on"
      label="Location"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">City</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop city"
            class="custom-input"
            v-model="shopData.city"
            clearable
          />
        </div>
        <div class="input-group">
          <label class="input-label">Address</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop address"
            clearable
            class="custom-input"
            v-model="shopData.address"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts -->
    <q-expansion-item
      icon="contact_page"
      label="Contacts"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Phone</label>
          <q-input
            outlined
            dense
            rounded
            mask="(###) ### - ####"
            placeholder="Enter phone number"
            class="custom-input"
            clearable
            v-model="shopData.phone"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <q-input
            outlined
            dense
            rounded
            type="email"
            clearable
            placeholder="Enter email address"
            class="custom-input"
            v-model="shopData.email"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Working Hours -->
    <q-expansion-item
      icon="schedule"
      label="Working Hours"
      header-class="expansion-header"
      class="bg-block border-radius-lg full-width"
    >
      <WorkingHoursEditor v-model="openingHours" />
    </q-expansion-item>

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Save Button -->
    <div class="save-section">
      <q-btn
        class="full-width bg-block"
        @click="saveChanges"
        rounded
        size="lg"
        unelevated
        :loading="saveLoading"
        :disable="saveLoading"
      >
        <q-icon name="save" size="18px" />
        <span class="q-ml-sm text-subtitle1">Save changes</span>
        <template #loading>
          <div class="flex items-center justify-center q-gap-sm">
            <q-spinner size="sm" />
            <span class="q-ml-sm text-subtitle1">Saving...</span>
          </div>
        </template>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, watch, reactive } from 'vue';
import { ThemeSettings } from 'src/components';
import ImageUploaderV2 from 'src/components/ImageUploader/index.vue';
import type { IShopFormData } from 'src/interfaces/shop';
import type { IOpeningHours, ILink } from 'src/interfaces/common';
import { useProfileStore } from 'src/stores/profile';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_SHOP_MUTATION } from 'src/apollo/types/mutations/shop';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';

const WorkingHoursEditor = defineAsyncComponent(() => import('./WorkingHoursEditor.vue'));

const profileStore = useProfileStore();
const { showSuccess, showError } = useNotify();

// Form data
const shopData = reactive<IShopFormData>({
  pictures: [],
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  email: '',
});
const links = ref<ILink[]>([]);
const openingHours = ref<IOpeningHours[]>([]);
const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

// Setup mutation
const {
  mutate: updateShop,
  onDone: onDoneUpdateShop,
} = useMutation(UPDATE_SHOP_MUTATION);

// Prepare data for mutation
const prepareDataForMutation = (uploadedFiles: UploadFileResponse[] | []) => {
  return {
    ...(uploadedFiles.length > 0 && { pictures: [
      ...uploadedFiles.map((file) => file.id),
      // Set current pictures ids
    ] }),
    name: shopData.name,
    description: shopData.description,
    phone: shopData.phone,
    email: shopData.email,
    openingHours: openingHours.value.filter((hour) => hour.start && hour.end),
    city: shopData.city,
    address: shopData.address,
  };
};

async function upload(): Promise<UploadFileResponse[] | []> {
  if (imagesForUpload.value.length > 0) {
    return await uploadFiles(imagesForUpload.value);
  }
  return [];
}

const saveChanges = async () => {
  saveLoading.value = true;
  try {
    const shopProfile = profileStore.getShopProfile;
    if (!shopProfile?.documentId) {
      throw new Error('Shop profile not found');
    }

    const uploadedFiles: UploadFileResponse[] = await upload();

    const data = prepareDataForMutation(uploadedFiles);

    void updateShop({
      documentId: shopProfile.documentId,
      data,
    });
  } catch (error) {
    console.error('Error updating data:', error);
    showError('Error updating data');
  } finally {
    saveLoading.value = false;
  }
};

onDoneUpdateShop((result) => {
  if (result.errors?.length) {
    console.error('Error updating shop:', result.errors);
    showError('Error updating shop');
    return;
  }

  if (result.data?.updateShop) {
    profileStore.setShopProfile({
      ...profileStore.getShopProfile,
      ...result.data.updateShop,
    });
    showSuccess('Shop successfully updated');
  }
});

watch(
  () => profileStore.getShopProfile,
  (profile) => {
    links.value = profile?.links || [];
    openingHours.value = profile?.openingHours || [];
    Object.assign(shopData, {
      pictures: profile?.pictures?.map((picture, index) => ({
        url: picture.url,
        documentId: picture.documentId,
        index,
      })) || [],
      name: profile?.name || '',
      description: profile?.description || '',
      city: profile?.city || '',
      address: profile?.address || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
    });
  },
  { immediate: true },
);

// Expose data for parent component
defineExpose({
  shopData,
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.input-group {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.hours-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hours-group {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.time-input {
  cursor: pointer;

  .q-field__control {
    cursor: pointer;
  }
}

.save-section {
  margin-top: 20px;
  text-align: center;
}

:deep(.working-hours) {
  .days-row {
    padding: 16px;
  }
}
</style>
