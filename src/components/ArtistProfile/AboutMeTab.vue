<template>
  <div class="about-me-tab flex column q-gap-md">
    <ImageUploader
      :images="artistData.avatar ? [artistData.avatar] : []"
      placeholder-icon="person"
      class="artist-avatar"
      placeholder="Upload avatar"
      @on-upload="imagesForUpload = $event"
      @on-remove="imagesForRemove = $event"
      @on-update="onUpdateImages"
    />

    <!-- BIO Section -->
    <q-expansion-item
      icon="person"
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
            placeholder="Enter name"
            class="custom-input"
            v-model="artistData.name"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Bio</label>
          <q-input
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Tell us about yourself..."
            class="custom-input"
            v-model="artistData.description"
            rows="4"
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
            v-model="artistData.city"
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
            v-model="artistData.address"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts Section -->
    <q-expansion-item
      icon="contact_phone"
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
            placeholder="Enter phone number"
            class="custom-input"
            v-model="artistData.phone"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter email address"
            class="custom-input"
            v-model="artistData.email"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts Section -->
    <q-expansion-item
      icon="info"
      label="Additional Information"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Experience</label>
          <q-input
            outlined
            dense
            rounded
            type="number"
            placeholder="Enter experience"
            class="custom-input"
            :min="1"
            clearable
            suffix="years"
            v-model.number="artistData.experience"
            :rules="[(val) => val >= 1 || 'Experience must be at least 1 year']"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Theme Settings -->
    <ThemeSettings />

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
import type { IArtistFormData } from 'src/interfaces/artist';
import { useProfileStore } from 'src/stores/profile';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_ARTIST_MUTATION } from 'src/apollo/types/mutations/artist';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { compareAndReturnDifferences } from 'src/helpers/handleObject';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';

const profileStore = useProfileStore();
const { showSuccess, showError } = useNotify();
const { fetchMe } = useUser();

// Setup mutation
const { mutate: updateArtist, onDone: onDoneUpdateArtist } = useMutation(UPDATE_ARTIST_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

// Form data
const artistData = reactive<IArtistFormData>({
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  avatar: null,
  experience: null,
});
// NOTE: This variable is used to compare the original data with the new data
const artistDataOriginal = { ...artistData };
// ------------------------------------------------------------------------//

const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

const hasChanges = computed(
  () =>
    Object.keys(compareAndReturnDifferences(artistDataOriginal, artistData)).length > 0 ||
    imagesForUpload.value.length > 0 ||
    imagesForRemove.value.length > 0,
);

// Prepare data for mutation
const prepareDataForMutation = (uploadedFiles: UploadFileResponse[] | []) => {
  const preparedData = {
    ...artistData,
    ...(uploadedFiles.length > 0 && {
      avatar: uploadedFiles[0]?.id,
    }),
  };

  // Remove avatar field if no new image and no existing image
  if (!preparedData.avatar && imagesForRemove.value.length > 0) {
    preparedData.avatar = null;
  }

  const differences = compareAndReturnDifferences(artistDataOriginal, preparedData);
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
    const artistProfile = profileStore.getArtistProfile;
    if (!artistProfile?.documentId) {
      throw new Error('Artist profile not found');
    }

    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    const data = prepareDataForMutation(uploadedFiles);

    void updateArtist({
      documentId: artistProfile.documentId,
      data,
    });
  } catch (error) {
    console.error('Error updating data:', error);
    showError('Error updating data');
  } finally {
    saveLoading.value = false;
  }
};

onDoneUpdateArtist((result) => {
  if (result.errors?.length) {
    console.error('Error updating artist:', result.errors);
    showError('Error updating artist');
    return;
  }

  if (result.data?.updateArtist) {
    void (async () => {
      const userData = await fetchMe();
      if (userData) {
        profileStore.setUserProfile(userData);
      }
    })();
    Object.assign(artistDataOriginal, { ...artistData });
    imagesForUpload.value = [];
    imagesForRemove.value = [];
    showSuccess('Artist profile successfully updated');
  }
});

watch(
  () => profileStore.getArtistProfile,
  (profile) => {
    Object.assign(artistData, {
      ...profile,
      avatar: profile?.avatar
        ? {
            url: profile?.avatar?.url,
            id: profile?.avatar?.id,
            index: profile?.avatar?.index || 0,
          }
        : null,
    });
    Object.assign(artistDataOriginal, { ...artistData });
  },
  { immediate: true },
);

// Expose data for parent component
defineExpose({
  artistData,
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.input-group {
  width: 100%;
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

.links-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.link-input-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-link-btn {
  margin-bottom: 8px;
}

.remove-link-btn {
  margin-bottom: 8px;
}

.save-btn {
  margin-top: 20px;
  text-align: center;

  &--active {
    position: sticky;
    bottom: 90px;
  }
}

.artist-avatar {
  min-height: 300px;
}
</style>
