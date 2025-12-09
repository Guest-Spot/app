<template>
  <div class="about-me-tab flex column q-gap-md">
    <div class="relative-position">
      <ImageUploader
        :images="artistData.avatar ? [artistData.avatar] : []"
        placeholder-icon="person"
        class="artist-avatar q-z-1"
        placeholder="Upload avatar"
        @on-upload="imagesForUpload = $event"
        @on-remove="imagesForRemove = $event"
        @on-update="onUpdateImages"
      />
    </div>

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
            type="tel"
            placeholder="Enter phone number"
            class="custom-input"
            v-model="artistData.phone"
            clearable
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

    <!-- Working Hours -->
    <q-expansion-item
      icon="schedule"
      label="Working Hours"
      header-class="expansion-header"
      class="bg-block border-radius-lg full-width"
    >
      <WorkingHoursEditor v-model="artistData.openingHours" />
    </q-expansion-item>

    <!-- Additional Information Section -->
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
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Payment Settings -->
    <q-expansion-item
      v-if="settingsStore.getStripeEnabled && user?.verified"
      icon="payment"
      label="Payment Settings"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <!-- Not Configured State -->
        <div v-if="!user?.stripeAccountID" class="payment-not-configured flex column items-center justify-center">
          <div class="q-mb-md text-body2 text-grey-7">
            Configure your payment settings to receive payments from clients
          </div>
          <div class="flex q-gap-sm full-width no-wrap">
            <q-btn
              rounded
              unelevated
              color="primary"
              label="Setup payment account"
              icon="payment"
              class="full-width"
              @click="setupStripeAccount"
              :loading="stripeSetupLoading"
              :disable="stripeSetupLoading"
            />
            <q-btn
              round
              outline
              color="primary"
              icon="refresh"
              @click="checkStripeStatus"
              :loading="stripeStatusLoading"
              :disable="stripeStatusLoading"
            />
          </div>
        </div>

        <!-- Setup Incomplete State -->
        <div v-else-if="user?.stripeAccountID && user?.payoutsEnabled !== true" class="payment-setup-incomplete flex column items-start justify-center">
          <div class="flex items-start justify-start q-mb-md">
            <q-icon name="warning" color="warning" size="24px" class="q-mr-sm" />
            <span class="text-body1 text-weight-medium">Complete Stripe account setup</span>
          </div>
          <div class="q-mb-md text-body2 text-grey-7">
            Your Stripe account has been created, but the setup is incomplete. Please complete the setup to enable payouts.
          </div>
          <div class="flex q-gap-sm full-width no-wrap">
            <q-btn
              rounded
              unelevated
              color="primary"
              label="Continue setup"
              icon="payment"
              class="full-width"
              @click="openStripeDashboard"
              :loading="stripeDashboardLoading"
              :disable="stripeDashboardLoading"
            />
            <q-btn
              round
              outline
              color="primary"
              icon="refresh"
              @click="checkStripeStatus"
              :loading="stripeStatusLoading"
              :disable="stripeStatusLoading"
            />
          </div>
        </div>

        <!-- Configured State -->
        <div v-else class="payment-configured">
          <div class="flex items-center q-mb-md">
            <q-icon name="check_circle" color="positive" size="24px" class="q-mr-sm" />
            <span class="text-body1 text-weight-medium">Payment configured</span>
          </div>

          <div v-if="user?.stripeAccountID" class="q-mb-md text-body2 text-grey-7">
            Account ID: •••• {{ user.stripeAccountID.slice(-4) }}
            <!-- Copy to clipboard -->
            <q-btn
              round
              flat
              size="sm"
              icon="content_copy"
              @click="onCopyToClipboard(user.stripeAccountID)"
            />
          </div>

          <div class="flex q-gap-sm">
            <q-btn
              rounded
              unelevated
              flat
              color="primary"
              class="full-width bg-block"
              label="Open Stripe Dashboard"
              icon="open_in_new"
              @click="openStripeDashboard"
              :loading="stripeDashboardLoading"
              :disable="stripeDashboardLoading"
            />
          </div>

          <div class="input-group q-mt-md bg-block border-radius-lg q-pa-md">
            <div class="flex items-center justify-between full-width q-mb-sm">
              <label class="input-label q-mb-none">Charge a deposit?</label>
              <q-toggle
                v-model="artistData.chargeDeposit"
                color="primary"
              />
            </div>
            <q-input
              outlined
              dense
              rounded
              type="number"
              class="custom-input"
              placeholder="Enter deposit amount"
              prefix="$"
              :min="0"
              :disable="!artistData.chargeDeposit"
              v-model.number="artistData.depositAmount"
              hint="Guests will be charged this amount upfront when booking."
              :rules="[
                (val) =>
                  val === null ||
                  val === undefined ||
                  val >= 0 ||
                  'Deposit amount must be zero or greater',
              ]"
            />
          </div>
        </div>
      </div>
    </q-expansion-item>

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Delete Account Section -->
    <DeleteAccountSection />

    <!-- Feedback & Logout Section -->
    <FeedbackLogout />

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
import { ref, watch, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { copyToClipboard } from 'quasar';
import { ThemeSettings } from 'src/components';
import ImageUploader from 'src/components/ImageUploader/index.vue';
import DeleteAccountSection from 'src/components/Profile/DeleteAccountSection.vue';
import WorkingHoursEditor from 'src/components/ShopProfile/WorkingHoursEditor.vue';
import type { IArtistFormData } from 'src/interfaces/artist';
import type { IOpeningHours } from 'src/interfaces/common';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import { compareAndReturnDifferences } from 'src/helpers/handleObject';
import { DELETE_IMAGE_MUTATION } from 'src/apollo/types/mutations/image';
import useUser from 'src/modules/useUser';
import useOpeningHours from 'src/modules/useOpeningHours';
import {
  GET_STRIPE_DASHBOARD_URL_MUTATION,
  CHECK_STRIPE_ACCOUNT_STATUS_MUTATION,
} from 'src/apollo/types/mutations/stripe';
import useStripe from 'src/composables/useStripe';
import { centsToDollars, dollarsToCents } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';
import { useUnsavedChanges } from 'src/composables/useUnsavedChanges';
import FeedbackLogout from 'src/components/FeedbackLogout.vue';

const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();
const { fetchOpeningHours, handleOpeningHoursChanges } = useOpeningHours();
const { openStripeUrl, addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();
const settingsStore = useSettingsStore();

// Setup mutation
const { mutate: updateArtist, onDone: onDoneUpdateArtist } = useMutation(UPDATE_USER_MUTATION);
const { mutate: deleteImage } = useMutation(DELETE_IMAGE_MUTATION);

// Fetch opening hours separately - filter by current user
const userDocumentId = computed(() => user.value?.documentId);
const { refetch: refetchOpeningHours, onResult: onResultOpeningHours } = fetchOpeningHours(userDocumentId);

// Stripe mutations
const {
  mutate: getStripeDashboardUrl,
  onDone: onDoneGetStripeDashboardUrl,
  onError: onErrorGetStripeDashboardUrl,
} = useMutation(GET_STRIPE_DASHBOARD_URL_MUTATION);

const {
  mutate: checkStripeAccountStatus,
  onDone: onDoneCheckStripeAccountStatus,
  onError: onErrorCheckStripeAccountStatus,
} = useMutation(CHECK_STRIPE_ACCOUNT_STATUS_MUTATION);

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
  depositAmount: null,
  openingHours: [],
});
// NOTE: This variable is used to compare the original data with the new data
const artistDataOriginal = reactive<IArtistFormData>({ ...artistData });
// ------------------------------------------------------------------------//

const imagesForRemove = ref<string[]>([]);
const imagesForUpload = ref<File[]>([]);
const saveLoading = ref(false);

// Stripe loading states
const stripeSetupLoading = ref(false);
const stripeDashboardLoading = ref(false);
const stripeStatusLoading = ref(false);

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
  const currentHours = buildHoursMap(artistData.openingHours);
  const originalHours = buildHoursMap(artistDataOriginal.openingHours);

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

const hasChanges = computed(() => {
  // Exclude openingHours from comparison as it's handled separately
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openingHours: _originalHours, ...originalWithoutHours } = artistDataOriginal;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openingHours: _currentHours, ...currentWithoutHours } = artistData;

  return (
    Object.keys(compareAndReturnDifferences(originalWithoutHours, currentWithoutHours)).length > 0 ||
    imagesForUpload.value.length > 0 ||
    imagesForRemove.value.length > 0 ||
    openingHoursChanges.value
  );
});

// Setup unsaved changes warning
useUnsavedChanges(hasChanges);

// Prepare data for mutation
const prepareDataForMutation = (uploadedFiles: UploadFileResponse[] | []) => {
  const preparedData = {
    ...artistData,
    // Convert dollars to cents for backend
    depositAmount: dollarsToCents(artistData.depositAmount),
    ...(uploadedFiles.length > 0 && {
      avatar: uploadedFiles[0]?.id,
    }),
  };

  // Remove avatar field if no new image and no existing image
  if (!preparedData.avatar && imagesForRemove.value.length > 0) {
    preparedData.avatar = null;
  }

  const differences = compareAndReturnDifferences(artistDataOriginal, preparedData);
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

const onCopyToClipboard = (text: string) => {
  void copyToClipboard(text);
  showSuccess('Copied to clipboard');
};

const saveChanges = async () => {
  saveLoading.value = true;
  try {
    if (!user.value?.documentId) {
      throw new Error('Artist profile not found');
    }

    await deleteImages();
    const uploadedFiles: UploadFileResponse[] = await upload();

    // Handle opening hours separately
    await handleOpeningHoursChanges(
      artistDataOriginal.openingHours || [],
      artistData.openingHours || [],
      user.value.id,
    );

    const data = prepareDataForMutation(uploadedFiles);

    // Only update main data if there are changes
    if (Object.keys(data).length > 0) {
      await updateArtist({
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

onDoneUpdateArtist((result) => {
  if (result.errors?.length) {
    console.error('Error updating artist:', result.errors);
    showError('Error updating profile');
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
      const currentOpeningHours = artistData.openingHours;
      const originalOpeningHours = artistDataOriginal.openingHours;

      const userData = {
        ...profile,
        // Convert cents to dollars for display
        depositAmount: centsToDollars(profile?.depositAmount),
        avatar: profile?.avatar
          ? {
              url: profile?.avatar?.url,
              id: profile?.avatar?.id,
              index: profile?.avatar?.index || 0,
            }
          : null,
        // Don't include openingHours from user profile, use separate query
        openingHours: currentOpeningHours,
      };

      Object.assign(artistData, userData);
      // Preserve original openingHours separately
      Object.assign(artistDataOriginal, {
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
    artistData.openingHours = hours;
    // Create a deep copy for original to ensure proper change detection reset
    artistDataOriginal.openingHours = JSON.parse(JSON.stringify(hours));
  }
});

// Stripe functions
const setupStripeAccount = async () => {
  stripeSetupLoading.value = true;
  try {
    await getStripeDashboardUrl();
  } catch (error) {
    console.error('Error getting Stripe dashboard URL:', error);
    showError('Error setting up payment account');
    stripeSetupLoading.value = false;
  }
};

const openStripeDashboard = async () => {
  stripeDashboardLoading.value = true;
  try {
    await getStripeDashboardUrl();
  } catch (error) {
    console.error('Error opening Stripe dashboard:', error);
    showError('Error opening Stripe dashboard');
    stripeDashboardLoading.value = false;
  }
};

const checkStripeStatus = async () => {
  stripeStatusLoading.value = true;
  try {
    await checkStripeAccountStatus();
  } catch (error) {
    console.error('Error checking Stripe status:', error);
    showError('Error checking payment status');
    stripeStatusLoading.value = false;
  }
};

// Handle Stripe dashboard URL response
onDoneGetStripeDashboardUrl((result) => {
  stripeSetupLoading.value = false;
  stripeDashboardLoading.value = false;

  if (result.errors?.length) {
    console.error('Error getting Stripe dashboard URL:', result.errors);
    showError(result.errors.map((error) => error.message).join(', ') || 'Error getting Stripe URL');
    return;
  }

  const url = result.data?.getStripeDashboardUrl?.url;
  if (url) {
    try {
      void openStripeUrl(url);
    } catch (error) {
      console.error('Error opening URL:', error);
      showError('Error opening Stripe dashboard');
    }
  }
});

onErrorGetStripeDashboardUrl((error) => {
  stripeSetupLoading.value = false;
  stripeDashboardLoading.value = false;
  console.error('Stripe dashboard URL mutation error:', error);
  showError('Error connecting to Stripe');
});

// Handle Stripe status check response
onDoneCheckStripeAccountStatus((result) => {
  stripeStatusLoading.value = false;

  if (result.errors?.length) {
    console.error('Error checking Stripe status:', result.errors);
    showError('Error checking payment status');
    return;
  }

  const statusData = result.data?.checkStripeAccountStatus;
  if (statusData) {
    // Refresh user data to get updated status
    void fetchMe();

    if (statusData.payoutsEnabled) {
      showSuccess('Payment account is fully configured');
    } else if (statusData.detailsSubmitted) {
      showError('Payment account setup is incomplete. Please complete the setup.');
    } else {
      showError('Payment account is not yet configured');
    }
  }
});

onErrorCheckStripeAccountStatus((error) => {
  stripeStatusLoading.value = false;
  console.error('Stripe status check mutation error:', error);
  showError('Error checking payment status');
});

// Handle browser close event - refresh user data
const handleBrowserFinished = async () => {
  console.log('Browser closed, refreshing user data...');
  await fetchMe();
};

// Setup browser finished listener on mount
onMounted(() => {
  void addBrowserFinishedListener(() => void handleBrowserFinished());
});

// Cleanup listener on unmount
onBeforeUnmount(async () => {
  await removeAllBrowserListeners();
});

// Expose data for parent component
defineExpose({
  artistData,
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.profile-verified-status {
  display: flex;
  justify-content: center;
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

:deep(.working-hours) {
  .days-row {
    padding: 16px;
  }
}
</style>
