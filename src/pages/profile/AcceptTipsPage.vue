<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" to="/profile" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Accept Tips <span class="text-primary">&amp; Support</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="tips-toggle-card full-width bg-block border-radius-lg q-pa-lg q-mb-md">
          <div class="flex items-center justify-between full-width">
            <div>
                <p class="text-body1 text-weight-medium q-mb-xs flex items-center q-gap-sm justify-between">
                  <span class="text-primary">Tips availability</span>
                  <q-toggle
                    v-model="tipsEnabled"
                    color="primary"
                    dense
                    :disable="isSavingTipsPreference"
                    @update:model-value="handleAcceptTipsToggle"
                  />
                </p>
              <p class="text-caption text-grey-6 q-mb-none">
                Pause tips without disconnecting Stripe to give yourself a break from new contributions.
              </p>
            </div>
          </div>
        </div>

        <div class="text-center full-width bg-block border-radius-lg q-pa-lg q-mb-md">
          <div class="flex column items-start q-gap-sm full-width text-left">
            <p class="q-mb-md">
              Share your tip link to let fans show appreciation and keep them coming back.
            </p>

            <div class="share-link-row">
              <q-input
                outlined
                dense
                rounded
                readonly
                :model-value="tipLink"
                label="Your Tip Page"
                class="full-width"
              >
                <template #append>
                  <q-btn round size="sm" text-color="primary" icon="content_copy" @click="copyTipLink" />
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <div class="tips-toggle-card full-width bg-block border-radius-lg q-pa-lg q-mb-md">
          <p class="text-body1 q-mb-none">
            If tips are enabled:
          </p>
          <ul class="tips-instruction-list text-grey-6">
            <li>Fans see the Tip link on your public profile and in shared posts.</li>
            <li>Every tip is routed through Stripe and lands in your connected account.</li>
            <li>Toggle this off anytime to hide the link without touching Stripe settings.</li>
          </ul>
          <p class="text-caption text-grey-7 q-my-none">
            Stripe takes {{ stripeFeePercentLabel }} of each tip.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { copyToClipboard } from 'quasar';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import useStripe from 'src/composables/useStripe';

import { WEB_FALLBACK } from 'src/config/constants';
import { useSettingsStore } from 'src/stores/settings';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';

const router = useRouter();
const { user, fetchMe } = useUser();
const { addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();
const { showError, showSuccess } = useNotify();
const settingsStore = useSettingsStore();
const stripeFeePercent = computed(() => settingsStore.getStripeFeePercent);
const stripeFeePercentLabel = computed(() => (stripeFeePercent.value !== null ? `${stripeFeePercent.value}%` : 'процент'));

const isStripeConfigured = computed(() => user.value?.payoutsEnabled === true);

const redirectIfUnavailable = () => {
  if (!user.value?.id) return;
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

const resolveAcceptTipsState = () => {
  const acceptTipsFlag = user.value?.acceptTips;
  if (typeof acceptTipsFlag === 'boolean') {
    return acceptTipsFlag;
  }
  return user.value?.payoutsEnabled === true;
};

const tipsEnabled = ref(resolveAcceptTipsState());
const lastPersistedAcceptTips = ref(tipsEnabled.value);
const isSavingTipsPreference = ref(false);
const { mutate: updateUser } = useMutation(UPDATE_USER_MUTATION);

watch(
  () => [user.value?.acceptTips, user.value?.payoutsEnabled],
  () => {
    const normalized = resolveAcceptTipsState();
    lastPersistedAcceptTips.value = normalized;
    tipsEnabled.value = normalized;
  },
  { immediate: true },
);

const handleAcceptTipsToggle = async (value: boolean) => {
  const userId = user.value?.id;
  if (!userId) {
    tipsEnabled.value = lastPersistedAcceptTips.value;
    showError('Unable to update tips availability right now.');
    return;
  }

  if (value === lastPersistedAcceptTips.value) {
    return;
  }

  isSavingTipsPreference.value = true;
  try {
    const result = await updateUser({
      id: userId,
      data: {
        acceptTips: value,
      },
    });

    if (result.errors?.length || !result.data?.updateUsersPermissionsUser?.data) {
      throw new Error(result.errors?.[0]?.message || 'Failed to update tips preference.');
    }

    lastPersistedAcceptTips.value = value;
    showSuccess('Tips availability updated.');
    void fetchMe();
  } catch (error) {
    console.error('Failed to update tips preference:', error);
    tipsEnabled.value = lastPersistedAcceptTips.value;
    showError('Failed to update tips availability. Try again.');
  } finally {
    isSavingTipsPreference.value = false;
  }
};

const tipLink = computed(() => {
  if (!user.value?.documentId) {
    return '';
  }
  return `${WEB_FALLBACK}/#/artist/${user.value.documentId}/tip`;
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

.tips-toggle-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tips-instruction-list {
  margin: 0;
  padding-left: 18px;
  color: var(--q-grey-7);
  font-size: 0.9rem;
  line-height: 1.4;
}

.tips-instruction-list li {
  margin-bottom: 4px;
}

.tips-disabled-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}
</style>
