<template>
  <div class="about-me-tab flex column q-gap-md">
    <ImageUploader
      :images="isShop ? picturesData : (avatarData ? [avatarData] : [])"
      :multiple="isShop"
      :placeholder-icon="isShop ? 'photo_library' : 'person'"
      class="artist-avatar q-z-1"
      :placeholder="isShop ? 'Upload images' : 'Upload avatar'"
      :loading="saveLoading"
      @on-upload="onUploadImages"
      @on-remove="onRemoveImages"
      @on-update="onUpdateImages"
    />
    <!-- Navigation List -->
    <div class="navigation-list flex column bg-block border-radius-lg">
      <!-- Basic Information -->
      <div
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/basic-information')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="person" size="24px" color="grey-6" />
            <span>Basic Information</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Location -->
      <div
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/location')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="location_on" size="24px" color="grey-6" />
            <span>Location</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Contacts -->
      <div
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/contacts')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="contact_phone" size="24px" color="grey-6" />
            <span>Contacts</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Working Hours -->
      <div
        v-if="!isGuest"
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/working-hours')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="schedule" size="24px" color="grey-6" />
            <span>Working Hours</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Additional Information -->
      <div
        v-if="!isGuest"
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/additional-information')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="info" size="24px" color="grey-6" />
            <span>Additional Information</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Social Media -->
      <div
        v-if="!isGuest"
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/social-media')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="share" size="24px" color="grey-6" />
            <span>Social Media</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>

      <!-- Payment Settings -->
      <div
        v-if="settingsStore.getStripeEnabled && user?.verified && !isGuest"
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/payment-settings')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="payment" size="24px" color="grey-6" />
            <span>Payment Settings</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>
      <div
        v-if="isArtist && hasDismissedAddressDialog && user?.payoutsEnabled === true"
        class="nav-item q-pa-md cursor-pointer"
        @click="navigateTo('/profile/accept-tips')"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center q-gap-md">
            <q-icon name="volunteer_activism" size="24px" color="grey-6" />
            <span>Accept Tips & Support</span>
          </div>
          <q-icon name="chevron_right" size="24px" color="grey-6" />
        </div>
      </div>
    </div>

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Delete Account Section -->
    <DeleteAccountSection />

    <!-- Feedback & Logout Section -->
    <FeedbackLogout />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ThemeSettings } from 'src/components';
import ImageUploader from 'src/components/ImageUploader/index.vue';
import DeleteAccountSection from 'src/components/Profile/DeleteAccountSection.vue';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';
import { useSettingsStore } from 'src/stores/settings';
import FeedbackLogout from 'src/components/FeedbackLogout.vue';
import { getAddressDialogStorageKey } from 'src/composables/useAddressRequestDialog';

const router = useRouter();
const { showError } = useNotify();
const { fetchMe, user, isShop, isGuest, isArtist } = useUser();
const settingsStore = useSettingsStore();
const isClient = typeof window !== 'undefined';
const hasDismissedAddressDialog = computed(() => {
  if (!isClient || !user.value?.id) {
    return false;
  }
  const storageKey = getAddressDialogStorageKey(user.value.id);
  if (!storageKey) {
    return false;
  }
  return window.localStorage.getItem(storageKey) === 'true';
});

// Setup mutation for avatar only
const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

// Avatar data
const avatarData = computed(() => {
  if (!user.value?.avatar) return null;
  return {
    url: user.value.avatar.url,
    id: user.value.avatar.id,
    index: user.value.avatar.index || 0,
  };
});

// Pictures data for Shop
const picturesData = computed(() => {
  if (!user.value?.pictures || user.value.pictures.length === 0) return [];
  return user.value.pictures.map((picture, index) => ({
    url: picture.url,
    id: picture.id,
    index: index,
  }));
});

const navigateTo = (path: string) => {
  void router.push(path);
};

// ImageUploader emits on-remove and on-upload back-to-back; coalesce into one save.
let saveScheduled = false;
const scheduleSave = () => {
  if (saveScheduled) return;
  saveScheduled = true;
  void Promise.resolve().then(() => {
    saveScheduled = false;
    if (isShop.value) {
      void savePictures();
    } else {
      void saveAvatar();
    }
  });
};

const onUploadImages = (files: File[]) => {
  imagesForUpload.value = files;
  scheduleSave();
};

const onRemoveImages = (ids: string[]) => {
  imagesForRemove.value = ids;
  scheduleSave();
};

const onUpdateImages = (files: { id: string; file: File }[]) => {
  imagesForRemove.value = files.map((file) => file.id);
  imagesForUpload.value = files.map((file) => file.file);
  scheduleSave();
};

async function upload(): Promise<UploadFileResponse[] | []> {
  if (imagesForUpload.value.length > 0) {
    const username = user.value?.username;
    if (!username) {
      throw new Error('Username not found. Cannot upload images.');
    }
    const folderPath = isShop.value ? `${username}/gallery` : `${username}/avatar`;
    return await uploadFiles(imagesForUpload.value, folderPath);
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

const saveAvatar = async () => {
  saveLoading.value = true;
  try {
    if (!user.value?.id) {
      throw new Error('User not found');
    }

    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    const data: Record<string, unknown> = {};
    if (uploadedFiles.length > 0) {
      data.avatar = uploadedFiles[0]?.id;
    } else if (imagesForRemove.value.length > 0) {
      data.avatar = null;
    }

    if (Object.keys(data).length > 0) {
      await updateUser({
        id: user.value.id,
        data,
      });
    } else {
      saveLoading.value = false;
    }
  } catch (error) {
    console.error('Error updating avatar:', error);
    showError('Error updating avatar');
    saveLoading.value = false;
  }
};

const savePictures = async () => {
  saveLoading.value = true;
  try {
    if (!user.value?.id) {
      throw new Error('User not found');
    }

    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    const data: Record<string, unknown> = {};
    if (uploadedFiles.length > 0 || imagesForRemove.value.length > 0) {
      data.pictures = [
        ...uploadedFiles.map((file) => file.id),
        ...(user.value.pictures || [])
          .map((picture) => picture.id)
          .filter((id) => !imagesForRemove.value.includes(id)),
      ];
    }

    if (Object.keys(data).length > 0) {
      await updateUser({
        id: user.value.id,
        data,
      });
    } else {
      saveLoading.value = false;
    }
  } catch (error) {
    console.error('Error updating pictures:', error);
    showError('Error updating pictures');
    saveLoading.value = false;
  }
};

onDoneUpdate((result) => {
  saveLoading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError(isShop.value ? 'Error updating pictures' : 'Error updating avatar');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      imagesForUpload.value = [];
      imagesForRemove.value = [];
    });
  }
});
</script>

<style scoped lang="scss">
.artist-avatar {
  min-height: 300px;
}

.navigation-list {
  width: 100%;
}

.nav-item {
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
    transform: translateX(2px);
  }
}
</style>
