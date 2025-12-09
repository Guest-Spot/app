<template>
  <div class="about-me-tab flex column q-gap-md">
    <ImageUploader
      :images="guestData.avatar ? [guestData.avatar] : []"
      placeholder-icon="person"
      class="guest-avatar"
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
            v-model="guestData.name"
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
            type="tel"
            placeholder="Enter phone number"
            class="custom-input"
            clearable
            v-model="guestData.phone"
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
            v-model="guestData.email"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Location Section -->
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
            placeholder="Enter city"
            class="custom-input"
            clearable
            v-model="guestData.city"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Address</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter address"
            class="custom-input"
            clearable
            v-model="guestData.address"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Delete Account Section -->
    <DeleteAccountSection />

    <!-- Feedback & Logout Section -->
    <div class="flex q-gap-sm no-wrap">
      <q-btn
        label="Feedback"
        rounded
        unelevated
        to="/feedback"
        class="full-width bg-block"
      />
      <q-btn
        label="Logout"
        color="primary"
        rounded
        flat
        unelevated
        class="full-width bg-block"
        @click="handleLogout"
      />
    </div>

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
import DeleteAccountSection from 'src/components/Profile/DeleteAccountSection.vue';
import type { IGuestFormData } from 'src/interfaces/guest';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { compareAndReturnDifferences } from 'src/helpers/handleObject';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';
import { useUnsavedChanges } from 'src/composables/useUnsavedChanges';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useNotifiesStore } from 'src/stores/notifies';

const { showSuccess, showError } = useNotify();
const { fetchMe, user, logout } = useUser();
const $q = useQuasar();
const router = useRouter();
const notifiesStore = useNotifiesStore();
// Setup mutation
const { mutate: updateGuest, onDone: onDoneUpdateGuest } = useMutation(UPDATE_USER_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

// Form data
const guestData = reactive<IGuestFormData>({
  name: '',
  email: '',
  avatar: null,
  phone: '',
  city: '',
  address: '',
});
// NOTE: This variable is used to compare the original data with the new data
const guestDataOriginal = { ...guestData };
// ------------------------------------------------------------------------//

const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

const hasChanges = computed(
  () =>
    Object.keys(compareAndReturnDifferences(guestDataOriginal, guestData)).length > 0 ||
    imagesForUpload.value.length > 0 ||
    imagesForRemove.value.length > 0,
);

// Setup unsaved changes warning
useUnsavedChanges(hasChanges);

// Prepare data for mutation
const prepareDataForMutation = (uploadedFiles: UploadFileResponse[] | []) => {
  const preparedData = {
    ...guestData,
    ...(uploadedFiles.length > 0 && {
      avatar: uploadedFiles[0]?.id,
    }),
  };

  // Remove avatar field if no new image and no existing image
  if (!preparedData.avatar && imagesForRemove.value.length > 0) {
    preparedData.avatar = null;
  }

  const differences = compareAndReturnDifferences(guestDataOriginal, preparedData);
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
      throw new Error('Guest profile not found');
    }

    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    const data = prepareDataForMutation(uploadedFiles);

    await updateGuest({
      id: user.value.id,
      data,
    });
  } catch (error) {
    console.error('Error updating data:', error);
    showError('Error updating data');
  } finally {
    saveLoading.value = false;
  }
};

const handleLogout = () => {
  $q.dialog({
    title: 'Logout',
    message: 'Are you sure you want to logout?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Cancel',
    },
    ok: {
      color: 'primary',
      rounded: true,
      label: 'Logout',
    },
  }).onOk(() => {
    void logout();
    showSuccess('Logout successful');
    notifiesStore.setNotifies([]);
    notifiesStore.setHasNewNotifies(0);
    void router.push('/');
    window.location.reload();
  });
};

onDoneUpdateGuest((result) => {
  if (result.errors?.length) {
    console.error('Error updating guest:', result.errors);
    showError('Error updating profile');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe();
    Object.assign(guestDataOriginal, { ...guestData });
    imagesForUpload.value = [];
    imagesForRemove.value = [];
    showSuccess('Your profile successfully updated');
  }
});

watch(
  user,
  (profile) => {
    Object.assign(guestData, {
      ...profile,
      avatar: profile?.avatar
        ? {
            url: profile?.avatar?.url,
            id: profile?.avatar?.id,
            index: profile?.avatar?.index || 0,
          }
        : null,
    });
    Object.assign(guestDataOriginal, { ...guestData });
  },
  { immediate: true },
);

// Expose data for parent component
defineExpose({
  guestData,
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

.guest-avatar {
  min-height: 300px;
}
</style>
