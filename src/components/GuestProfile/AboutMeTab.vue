<template>
  <div class="about-me-tab flex column q-gap-md">
    <div class="relative-position">
      <ImageUploader
        :images="avatarData ? [avatarData] : []"
        placeholder-icon="person"
        class="guest-avatar q-z-1"
        placeholder="Upload avatar"
        @on-upload="imagesForUpload = $event"
        @on-remove="imagesForRemove = $event"
        @on-update="onUpdateImages"
      />
    </div>

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
import FeedbackLogout from 'src/components/FeedbackLogout.vue';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

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

const navigateTo = (path: string) => {
  void router.push(path);
};

const onUpdateImages = (files: { id: string; file: File }[]) => {
  imagesForRemove.value = files.map((file) => file.id);
  imagesForUpload.value = files.map((file) => file.file);
  void saveAvatar();
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

onDoneUpdate((result) => {
  saveLoading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating avatar');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      imagesForUpload.value = [];
      imagesForRemove.value = [];
      showSuccess('Avatar successfully updated');
    });
  }
});
</script>

<style scoped lang="scss">
.guest-avatar {
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
