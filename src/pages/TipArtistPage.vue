<template>
  <q-page class="page q-py-md flex column items-start q-gap-md q-pb-5xl">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="redirectToArtistProfile" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Tip <span class="text-primary">{{ artistName }}</span>
      </h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div v-if="isLoadingArtist" class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column q-gap-sm">
            <q-skeleton type="text" width="90%" />
            <q-skeleton type="text" width="70%" />
            <q-skeleton type="text" width="80%" />
          </div>
        </div>

        <div v-else-if="!artistData" class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <p class="text-negative text-subtitle2 q-my-none">Artist not found.</p>
        </div>

        <div v-else-if="!canTip" class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <p class="text-body2 text-grey-7 q-my-none">
            This artist is not accepting tips yet. Check back later or book a session instead.
          </p>
        </div>

        <div v-else class="full-width flex colimmn q-gap-md">

          <!-- Artist Summary -->
          <ArtistCard :artist="artistData" class="full-width" no-bookmarks />

          <div class="tip-card bg-block border-radius-lg q-pa-lg">
            <div class="tip-body">
              <div class="tip-header">
                <div class="text-subtitle1 text-bold">Choose a tip amount</div>
                <div class="text-caption text-grey-6">
                  You will be redirected to Stripe to complete the payment.
                </div>
              </div>

              <div class="tip-options">
                <button
                  v-for="option in tipOptions"
                  :key="option.amount"
                  type="button"
                  class="tip-option bg-block"
                  :class="{ 'tip-option--active': selectedAmount === option.amount }"
                  @click="handleSelectOption(option.amount)"
                >
                  <span v-if="option.badge" class="tip-option__badge">{{ option.badge }}</span>
                  <span class="tip-option__price">${{ option.amount }}</span>
                  <span class="tip-option__label">{{ option.label }}</span>
                </button>
              </div>

              <div class="tip-summary bg-block border-radius-md q-pa-md">
                <div>
                  <div class="text-caption text-grey-6">Selected tip</div>
                  <div class="text-h6">{{ formattedTipAmount }}</div>
                </div>
                <q-icon name="payments" color="primary" size="26px" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="action-buttons container bg-block">
        <q-btn
          rounded
          class="grow-button q-py-sm q-mb-lg q-mt-md"
          color="primary"
          :loading="isProcessing"
          :disable="!canTip || isProcessing"
          @click="handleSubmit"
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="payments" />
            <span class="text-h6">Submit tip</span>
          </div>
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLazyQuery } from '@vue/apollo-composable';
import useTipPayment from 'src/composables/useTipPayment';
import { USER_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUserResult, IUser } from 'src/interfaces/user';
import useNotify from 'src/modules/useNotify';
import { dollarsToCents } from 'src/helpers/currency';
import { ArtistCard } from 'src/components/SearchPage';

const route = useRoute();
const router = useRouter();
const { showError } = useNotify();
const { isProcessing, initiateTipPayment } = useTipPayment();
const tipOptions = [
  { amount: 5, label: 'Quick thanks' },
  { amount: 20, label: 'Big support', badge: 'Popular' },
  { amount: 100, label: 'Super fan' },
];
const selectedAmount = ref<number>(tipOptions[0]!.amount);
const artistData = ref<IUser | null>(null);

const { load: loadArtist, onResult, onError, loading: isLoadingArtist } =
  useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const artistName = computed(() => artistData.value?.name ?? artistData.value?.email);

const canTip = computed(() => artistData.value?.payoutsEnabled === true);

const tipAmount = computed(() => selectedAmount.value);

const formattedTipAmount = computed(() => `$${tipAmount.value.toFixed(2)}`);

const handleSelectOption = (amount: number) => {
  selectedAmount.value = amount;
};

const handleSubmit = async () => {
  if (!artistData.value?.documentId) {
    showError('Artist not found. Please try again.');
    return;
  }

  if (!canTip.value) {
    showError('This artist is not accepting tips at the moment.');
    return;
  }

  if (!selectedAmount.value || selectedAmount.value <= 0) {
    showError('Enter a valid tip amount.');
    return;
  }

  const amountInCents = dollarsToCents(selectedAmount.value);
  if (!amountInCents || amountInCents <= 0) {
    showError('Enter a valid tip amount.');
    return;
  }

  await initiateTipPayment(artistData.value.documentId, amountInCents);
};

onResult((result) => {
  if (result.data?.usersPermissionsUser) {
    artistData.value = result.data.usersPermissionsUser;
  }
});

const redirectToArtistProfile = () => {
  const documentId = artistData.value?.documentId ?? (route.params.documentId as string);
  if (documentId) {
    void router.replace(`/artist/${documentId}`);
    return;
  }
  void router.replace('/');
};

watch(
  () => artistData.value,
  (artist) => {
    if (!artist) return;
    if (artist.payoutsEnabled !== true) {
      showError('This artist is not accepting tips at the moment.');
      redirectToArtistProfile();
    }
  },
);

onError((error) => {
  console.error('Failed to load artist for tipping:', error);
  showError('Unable to load artist profile.');
});

onBeforeMount(() => {
  const documentId = route.params.documentId as string;
  if (documentId) {
    void loadArtist(null, { documentId });
  } else {
    showError('Artist not found.');
  }
});
</script>

<style scoped>
.tip-card,
.tip-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.tip-option {
  position: relative;
  min-height: 50px;
  padding: 14px 12px 12px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  color: var(--q-text-primary);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.tip-option:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 0, 0, 0.2);
}

.tip-option__price {
  font-size: 20px;
  font-weight: 700;
}

.tip-option__label {
  font-size: 12px;
  color: var(--text-secondary);
}

.tip-option__badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.08);
}

.tip-option--active {
  background: var(--q-primary);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.tip-option--active .tip-option__label {
  color: rgba(255, 255, 255, 0.8);
}

.tip-option--active .tip-option__badge {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.tip-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.grow-button {
  flex: 1;
  min-width: 180px;
  width: 100%;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  right: 0;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}

.body--dark .tip-option {
  border-color: rgba(255, 255, 255, 0.12);
}

.body--dark .tip-option:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.body--dark .tip-option__badge {
  background: rgba(255, 255, 255, 0.12);
}
</style>
