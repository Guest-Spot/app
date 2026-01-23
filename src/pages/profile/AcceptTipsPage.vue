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

            <q-btn label="Copy link" color="primary" rounded class="full-width bg-block" @click="copyTipLink" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, watch, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { copyToClipboard } from 'quasar';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useStripe from 'src/composables/useStripe';
import { getAddressDialogStorageKey } from 'src/composables/useAddressRequestDialog';

const router = useRouter();
const { user, fetchMe } = useUser();
const { addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();
const { showError, showSuccess } = useNotify();
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

const isStripeConfigured = computed(() => user.value?.payoutsEnabled === true);

const redirectIfUnavailable = () => {
  if (!user.value?.id) return;
  if (!hasDismissedAddressDialog.value) {
    void router.replace('/profile/basic-information');
    return;
  }
  if (!isStripeConfigured.value) {
    void router.replace('/profile/payment-settings');
  }
};

onBeforeMount(() => {
  redirectIfUnavailable();
});

watch(
  () => [user.value?.id, user.value?.payoutsEnabled],
  () => {
    redirectIfUnavailable();
  },
);

const tipLink = computed(() => {
  if (!user.value?.documentId) {
    return '';
  }
  return `https://getguestspot.com/artist/${user.value.documentId}/tip`;
});

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
