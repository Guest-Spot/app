<template>
  <div class="about-shop-tab flex column q-gap-md">
    <!-- Banner Image Section -->
    <ImageUploader
      :images="shopData.pictures || []"
      placeholder="Upload images"
      multiple
      placeholderIcon="photo_library"
      @on-upload="imagesForUpload = $event"
      @on-remove="imagesForRemove = $event"
      @on-update="onUpdateImages"
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

    <!-- Location -->
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
            :mask="shopPhoneMask"
            placeholder="+# ### ###-####"
            class="custom-input"
            clearable
            v-model="shopData.phone"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Public email</label>
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
      <WorkingHoursEditor v-model="shopData.openingHours" />
    </q-expansion-item>

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Delete Account Section -->
    <DeleteAccountSection />

    <!-- Save Button -->
    <div class="save-btn" :class="{ 'save-btn--active': !!hasChanges }">
      <q-btn
        class="full-width bg-block"
        @click="saveChanges"
        rounded
        size="lg"
        :text-color="!!hasChanges ? 'primary' : ''"
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
import { ref, watch, reactive, computed } from 'vue';
import { ThemeSettings } from 'src/components';
import ImageUploader from 'src/components/ImageUploader/index.vue';
import WorkingHoursEditor from './WorkingHoursEditor.vue';
import DeleteAccountSection from 'src/components/Profile/DeleteAccountSection.vue';
import type { IShopFormData } from 'src/interfaces/shop';
import type { IOpeningHours } from 'src/interfaces/common';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { compareAndReturnDifferences } from 'src/helpers/handleObject';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';
import useOpeningHours from 'src/modules/useOpeningHours';
import { getPhoneInputMask } from 'src/modules/usePhoneMask';
import { useUnsavedChanges } from 'src/composables/useUnsavedChanges';

const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();
const { fetchOpeningHours, handleOpeningHoursChanges } = useOpeningHours();

// Setup mutation
const { mutate: updateShop, onDone: onDoneUpdateShop } = useMutation(UPDATE_USER_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

// Fetch opening hours separately
const { refetch: refetchOpeningHours, onResult: onResultOpeningHours } = fetchOpeningHours();

// Form data
const shopData = reactive<IShopFormData>({
  pictures: [],
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  openingHours: [],
});
const shopPhoneMask = computed(() => getPhoneInputMask(shopData.phone));
const shopDataOriginal = reactive<IShopFormData>({ ...shopData });
// ------------------------------------------------------------------------//

const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

const hasChanges = computed(() => {
  // Exclude openingHours from comparison as it's handled separately
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openingHours: _originalHours, ...originalWithoutHours } = shopDataOriginal;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openingHours: _currentHours, ...currentWithoutHours } = shopData;

  return (
    Object.keys(compareAndReturnDifferences(originalWithoutHours, currentWithoutHours)).length >
      0 ||
    imagesForUpload.value.length > 0 ||
    imagesForRemove.value.length > 0 ||
    openingHoursChanges.value
  );
});

// Setup unsaved changes warning
useUnsavedChanges(hasChanges);

// Helper function to build hours map (defined outside computed for better performance)
const buildHoursMap = (
  hours: IOpeningHours[] = [],
): Record<string, { start: string | null; end: string | null }> => {
  return hours.reduce<Record<string, { start: string | null; end: string | null }>>((acc, hour) => {
    if (!hour) return acc;

    const hasStart = hour.start !== null && hour.start !== '';
    const hasEnd = hour.end !== null && hour.end !== '';

    if (hasStart || hasEnd) {
      acc[hour.day] = { start: hour.start, end: hour.end };
    }

    return acc;
  }, {});
};

const openingHoursChanges = computed(() => {
  const currentHours = buildHoursMap(shopData.openingHours);
  const originalHours = buildHoursMap(shopDataOriginal.openingHours);

  // Check all days from both current and original hours
  const currentDays = Object.keys(currentHours);
  const originalDays = Object.keys(originalHours);

  // Early return: if length differs, there are changes
  if (currentDays.length !== originalDays.length) return true;

  // Check each day for changes
  for (const day of currentDays) {
    const current = currentHours[day];
    const original = originalHours[day];

    if (!current || !original || current.start !== original.start || current.end !== original.end) {
      return true;
    }
  }

  // Check for removed days
  for (const day of originalDays) {
    if (!currentHours[day]) return true;
  }

  return false;
});

// Prepare data for mutation
const prepareDataForMutation = (uploadedFiles: UploadFileResponse[] | []) => {
  const preparedData = {
    ...shopData,
    ...(uploadedFiles.length > 0 && {
      pictures: [
        ...uploadedFiles.map((file) => file.id),
        ...shopData.pictures
          .map((picture) => picture.id)
          .filter((id) => !imagesForRemove.value.includes(id)),
      ],
    }),
  };
  const differences = compareAndReturnDifferences(shopDataOriginal, preparedData);
  // Exclude openingHours from the main mutation as it's handled separately
  delete differences.openingHours;
  return differences;
};

async function upload(): Promise<UploadFileResponse[] | []> {
  if (imagesForUpload.value.length > 0) {
    return await uploadFiles(imagesForUpload.value);
  }
  return [];
}

async function deleteImages(): Promise<void> {
  if (imagesForRemove.value.length > 0) {
    for (const id of imagesForRemove.value) {
      await deleteImage({
        id,
      });
    }
  }
}

const onUpdateImages = (files: { id: string; file: File }[]) => {
  imagesForRemove.value = files.map((file) => file.id);
  imagesForUpload.value = files.map((file) => file.file);
};

const saveChanges = async () => {
  saveLoading.value = true;
  try {
    if (!user.value?.documentId) {
      throw new Error('Shop profile not found');
    }

    // Handle images
    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    // Handle opening hours separately
    await handleOpeningHoursChanges(
      shopDataOriginal.openingHours || [],
      shopData.openingHours || [],
      user.value.id,
    );

    // Update main shop data (excluding opening hours)
    const data = prepareDataForMutation(uploadedFiles);

    // Only update main data if there are changes
    if (Object.keys(data).length > 0) {
      await updateShop({
        id: user.value.id,
        data,
      });
    } else {
      // If only opening hours changed, still trigger success
      await Promise.all([fetchMe(), refetchOpeningHours()]);
      // After refetch, data will be synced via onResultOpeningHours
      imagesForUpload.value = [];
      imagesForRemove.value = [];
      showSuccess('Your profile successfully updated');
    }
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

  if (result.data?.updateUsersPermissionsUser) {
    // Trigger refetch - data will be synced via watchers and onResultOpeningHours
    void Promise.all([fetchMe(), refetchOpeningHours()]).then(() => {
      imagesForUpload.value = [];
      imagesForRemove.value = [];
      showSuccess('Your profile successfully updated');
    });
  }
});

watch(
  user,
  (profile) => {
    if (profile) {
      // Preserve existing openingHours as they are managed separately
      const currentOpeningHours = shopData.openingHours;
      const originalOpeningHours = shopDataOriginal.openingHours;

      const userData = {
        ...profile,
        pictures:
          profile?.pictures?.map((picture, index) => ({
            url: picture.url,
            id: picture.id,
            index,
          })) || [],
        // Don't include openingHours from user profile, use separate query
        openingHours: currentOpeningHours,
      };

      Object.assign(shopData, userData);
      // Preserve original openingHours separately
      Object.assign(shopDataOriginal, {
        ...userData,
        openingHours: originalOpeningHours,
      });
    }
  },
  { immediate: true },
);

onResultOpeningHours((result) => {
  if (result.data?.openingHours) {
    const hours = [...result.data.openingHours];
    shopData.openingHours = hours;
    // Create a deep copy for original to ensure proper change detection reset
    shopDataOriginal.openingHours = JSON.parse(JSON.stringify(hours));
  }
});

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

.save-btn {
  margin-top: 20px;
  text-align: center;

  &--active {
    position: sticky;
    bottom: 90px;
  }
}

:deep(.working-hours) {
  .days-row {
    padding: 16px;
  }
}
</style>
