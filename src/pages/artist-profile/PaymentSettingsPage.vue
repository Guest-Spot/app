<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Payment <span class="text-primary">Settings</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-sm full-width">
            <!-- Not Configured State -->
            <div v-if="!user?.stripeAccountID" class="payment-not-configured flex column items-center justify-center full-width">
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
            <div
              v-else-if="user?.stripeAccountID && user?.payoutsEnabled !== true"
              class="payment-setup-incomplete flex column items-start justify-center full-width"
            >
              <div class="flex items-start justify-start q-mb-md">
                <q-icon name="warning" color="warning" size="24px" class="q-mr-sm" />
                <span class="text-body1 text-weight-medium">Complete Stripe account setup</span>
              </div>
              <div class="q-mb-md text-body2 text-grey-7">
                Your Stripe account has been created, but the setup is incomplete. Please complete the setup to enable
                payouts.
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
            <div v-else class="payment-configured full-width">
              <div class="flex items-center q-mb-md">
                <q-icon name="check_circle" color="positive" size="24px" class="q-mr-sm" />
                <span class="text-body1 text-weight-medium">Payment configured</span>
              </div>

              <div v-if="user?.stripeAccountID" class="q-mb-md text-body2 text-grey-7">
                Account ID: •••• {{ user.stripeAccountID.slice(-4) }}
                <!-- Copy to clipboard -->
                <q-btn round flat size="sm" icon="content_copy" @click="onCopyToClipboard(user.stripeAccountID)" />
              </div>

              <div class="flex q-gap-sm q-mb-md">
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
                  <q-toggle v-model="formData.chargeDeposit" color="primary" />
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
                  :disable="!formData.chargeDeposit"
                  v-model.number="formData.depositAmount"
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
        </div>
      </div>
    </div>

    <!-- Sticky Save Button (only shown when payment is configured) -->
    <div v-if="user?.stripeAccountID && user?.payoutsEnabled === true" class="sticky-save-button">
      <div class="container">
        <q-btn
          class="save-btn bg-block full-width"
          :loading="loading"
          rounded
          unelevated
          @click="handleSave"
        >
          Save changes
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { copyToClipboard } from 'quasar';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import {
  GET_STRIPE_DASHBOARD_URL_MUTATION,
  CHECK_STRIPE_ACCOUNT_STATUS_MUTATION,
} from 'src/apollo/types/mutations/stripe';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useStripe from 'src/composables/useStripe';
import { centsToDollars, dollarsToCents } from 'src/helpers/currency';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();
const { openStripeUrl, addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();

const loading = ref(false);
const formData = ref({
  chargeDeposit: false,
  depositAmount: null as number | null,
});

// Stripe loading states
const stripeSetupLoading = ref(false);
const stripeDashboardLoading = ref(false);
const stripeStatusLoading = ref(false);

// Load user data
watch(
  user,
  (profile) => {
    if (profile) {
      formData.value = {
        chargeDeposit: profile.chargeDeposit || false,
        depositAmount: centsToDollars(profile?.depositAmount),
      };
    }
  },
  { immediate: true },
);

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

const { mutate: updateUser, onDone: onDoneUpdate } = useMutation(UPDATE_USER_MUTATION);

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating user:', result.errors);
    showError('Error updating payment settings');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Payment settings successfully updated');
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
  if (formData.value.chargeDeposit !== (user.value.chargeDeposit || false)) {
    data.chargeDeposit = formData.value.chargeDeposit;
  }
  if (dollarsToCents(formData.value.depositAmount) !== (user.value.depositAmount || null)) {
    data.depositAmount = dollarsToCents(formData.value.depositAmount);
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

const onCopyToClipboard = (text: string) => {
  void copyToClipboard(text);
  showSuccess('Copied to clipboard');
};

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

.sticky-save-button {
  position: sticky;
  bottom: 0;
  background: var(--q-dark-page, #fff);
  padding: 16px 0;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.save-btn {
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 48px;
  text-transform: none;
}
</style>

