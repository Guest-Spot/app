<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Accept Tips <span class="text-primary">&amp; Support</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-sm full-width text-left">
            <div v-if="!user?.stripeAccountID">
              <p class="text-body1 text-grey-8 q-mb-md">
                Connecting Stripe lets you receive tips securely and directly. Follow the steps below to start accepting support.
              </p>

              <div class="steps q-mb-lg">
                <div class="step flex items-start q-gap-md">
                  <div class="step-number">1</div>
                  <div>
                    <p class="step-title q-mb-xs">Connect Stripe</p>
                    <p class="text-caption text-grey-6">
                      Securely connect your Stripe account to accept tips directly on GuestSpot.
                    </p>
                  </div>
                </div>
                <div class="step flex items-start q-gap-md">
                  <div class="step-number">2</div>
                  <div>
                    <p class="step-title q-mb-xs">Share your tip page</p>
                    <p class="text-caption text-grey-6">
                      Share your personal tip link so fans can show support from anywhere.
                    </p>
                  </div>
                </div>
              </div>

              <q-btn
                label="Setup Stripe"
                color="secondary"
                rounded
                unelevated
                class="full-width"
                :loading="stripeSetupLoading"
                :disable="stripeSetupLoading"
                @click="handleSetupStripe"
              />
            </div>

            <div v-else>
              <p class="text-body1 q-mb-md">
                Share your tip link to let fans show appreciation and keep them coming back.
              </p>

              <div class="share-link-row q-mb-md">
                <q-input
                  outlined
                  dense
                  rounded
                  readonly
                  :model-value="tipLink"
                  label="Your Tip Page"
                  class="full-width"
                />
              </div>

              <div class="q-mt-xs">
                <q-btn label="Copy link" color="primary" rounded class="full-width bg-block" @click="copyTipLink" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { copyToClipboard } from 'quasar';
import { useMutation } from '@vue/apollo-composable';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useStripe from 'src/composables/useStripe';
import { GET_STRIPE_DASHBOARD_URL_MUTATION } from 'src/apollo/types/mutations/stripe';
import { getAddressDialogStorageKey } from 'src/composables/useAddressRequestDialog';

const router = useRouter();
const { user, fetchMe } = useUser();
const { openStripeUrl, addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();
const { showError, showSuccess } = useNotify();
const stripeSetupLoading = ref(false);
const isClient = typeof window !== 'undefined';

const hasDismissedAddressDialog = computed(() => {
  if (!isClient) {
    return false;
  }
  const storageKey = getAddressDialogStorageKey(user.value?.id);
  if (!storageKey) {
    return false;
  }
  return window.localStorage.getItem(storageKey) === 'true';
});

const redirectIfAddressDialogNotSeen = () => {
  if (!user.value?.id) return;
  if (!hasDismissedAddressDialog.value) {
    void router.replace('/profile/basic-information');
  }
};

onBeforeMount(() => {
  redirectIfAddressDialogNotSeen();
});

watch(
  () => user.value?.id,
  () => {
    redirectIfAddressDialogNotSeen();
  },
);

const {
  mutate: getStripeDashboardUrl,
  onDone: onDoneGetStripeDashboardUrl,
  onError: onErrorGetStripeDashboardUrl,
} = useMutation(GET_STRIPE_DASHBOARD_URL_MUTATION);

const tipLink = computed(() => {
  if (!user.value?.documentId) {
    return '';
  }
  return `https://getguestspot.com/artist/${user.value.documentId}/tip`;
});

const handleSetupStripe = async () => {
  stripeSetupLoading.value = true;
  try {
    await getStripeDashboardUrl();
  } catch (error) {
    console.error('Error fetching Stripe dashboard URL:', error);
    showError('Unable to connect to Stripe. Please try again.');
    stripeSetupLoading.value = false;
  }
};

const handleBrowserFinished = async () => {
  await fetchMe();
};

const copyTipLink = () => {
  if (!tipLink.value) {
    showError('Tip link not available yet.');
    return;
  }
  void copyToClipboard(tipLink.value);
  showSuccess('Link copied to clipboard');
};

onDoneGetStripeDashboardUrl((result) => {
  stripeSetupLoading.value = false;
  if (result.errors?.length) {
    console.error('Error fetching Stripe URL:', result.errors);
    showError('Unable to connect to Stripe.');
    return;
  }

  const url = result.data?.getStripeDashboardUrl?.url;
  if (!url) {
    showError('Unable to connect to Stripe.');
    return;
  }

  try {
    void openStripeUrl(url);
  } catch (error) {
    console.error('Error opening Stripe URL:', error);
    showError('Unable to open Stripe. Please try again.');
  }
});

onErrorGetStripeDashboardUrl((error) => {
  stripeSetupLoading.value = false;
  console.error('Stripe dashboard URL mutation error:', error);
  showError('Unable to connect to Stripe. Please try again later.');
});

onMounted(() => {
  void addBrowserFinishedListener(() => void handleBrowserFinished());
});

onBeforeUnmount(() => {
  void removeAllBrowserListeners();
});
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step {
  align-items: flex-start;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--q-secondary);
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.share-link-row {
  width: 100%;
}
</style>
