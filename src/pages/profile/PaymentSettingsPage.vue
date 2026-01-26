<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Payment <span class="text-primary">Settings</span></h2>
    </div>

  <PaymentSetupSuccessDialog
    v-model="showPaymentSuccessDialog"
    @dismiss="handleDismissPaymentSuccessDialog"
  />

  <div class="content-wrapper full-width q-pb-xl">
    <div class="container">
      <div class="payment-settings-card text-center full-width bg-block border-radius-lg">
        <div class="flex column items-start q-gap-sm full-width">
          <!-- Not Configured State -->
          <div v-if="!user?.stripeAccountID" class="payment-not-configured flex column items-center justify-center full-width">
            <div class="q-mb-md text-body2 text-grey-7 text-left">
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

          </div>
        </div>
      </div>
    </div>
  </div>

</q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { copyToClipboard } from 'quasar';
import { useMutation } from '@vue/apollo-composable';
import {
  GET_STRIPE_DASHBOARD_URL_MUTATION,
  CHECK_STRIPE_ACCOUNT_STATUS_MUTATION,
} from 'src/apollo/types/mutations/stripe';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useStripe from 'src/composables/useStripe';
import PaymentSetupSuccessDialog from 'src/components/Dialogs/PaymentSetupSuccessDialog.vue';
import { usePaymentSetupSuccessDialog } from 'src/composables/usePaymentSetupSuccessDialog';

const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();
const { openStripeUrl, addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();

const stripeSetupLoading = ref(false);
const stripeDashboardLoading = ref(false);
const stripeStatusLoading = ref(false);

// Payment success dialog
const {
  showPaymentSuccessDialog,
  handleDismissPaymentSuccessDialog,
  checkAndShowPaymentSuccessDialog,
} = usePaymentSetupSuccessDialog({ user });

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
    const wasPayoutsEnabledBefore = user.value?.payoutsEnabled === true;
    void fetchMe().then(() => {
      if (statusData.payoutsEnabled) {
        showSuccess('Payment account is fully configured');
        // Check if payoutsEnabled changed from false to true
        if (!wasPayoutsEnabledBefore && statusData.payoutsEnabled) {
          checkAndShowPaymentSuccessDialog();
        }
      } else if (statusData.detailsSubmitted) {
        showError('Payment account setup is incomplete. Please complete the setup.');
      } else {
        showError('Payment account is not yet configured');
      }
    });
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

const handleBrowserFinished = async () => {
  console.log('Browser closed, refreshing user data...');
  const wasPayoutsEnabledBefore = user.value?.payoutsEnabled === true;
  await fetchMe();
  // Check if payoutsEnabled changed from false/undefined to true
  if (!wasPayoutsEnabledBefore && user.value?.payoutsEnabled === true) {
    checkAndShowPaymentSuccessDialog();
  }
};

onMounted(() => {
  void addBrowserFinishedListener(() => void handleBrowserFinished());
});

onBeforeUnmount(async () => {
  await removeAllBrowserListeners();
});
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

.payment-settings-card {
  padding: 20px;
}
</style>
