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

        <div v-else class="full-width flex column q-gap-md">

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

              <div v-if="isLoadingPresets" class="tip-options">
                <q-skeleton v-for="i in 3" :key="i" height="50px" class="border-radius-lg" />
              </div>
              <div v-else class="tip-options">
                <button
                  v-for="option in tipOptions"
                  :key="option.id"
                  type="button"
                  class="tip-option bg-block"
                  :class="{ 'tip-option--active': selectedPresetId === option.id }"
                  @click="handleSelectOption(option)"
                >
                  <span class="tip-option__price">{{ getOptionTotal(option.amount) }}</span>
                  <span class="tip-option__label">{{ option.label }}</span>
                </button>
              </div>
              <div class="custom-tip-field full-width">
                <q-input
                  v-model.number="customAmount"
                  dense
                  type="number"
                  min="1"
                  step="0.5"
                  outlined
                  rounded
                  hide-bottom-space
                  class="custom-tip-field__input"
                  placeholder="Enter any amount"
                  hint="Select a preset above to submit."
                  :rules="[validateMinAmount]"
                />
              </div>

              <div v-if="tipAmount" class="fee-summary q-mt-md">
                <div class="flex justify-between items-center text-body2 text-grey-7 q-mb-xs">
                  <span>Tip amount</span>
                  <span>${{ tipAmount.toFixed(2) }}</span>
                </div>
                <div v-if="platformFeePercent > 0" class="flex justify-between items-center text-body2 text-grey-7 q-mb-xs">
                  <span>Service fee ({{ platformFeePercent }}%)</span>
                  <span>${{ platformFeeAmount.toFixed(2) }}</span>
                </div>
                <div v-if="stripeFeePercent > 0" class="flex justify-between items-center text-body2 text-grey-7 q-mb-xs">
                  <span>Stripe fee ({{ stripeFeePercent }}%)</span>
                  <span>${{ stripeFeeAmount.toFixed(2) }}</span>
                </div>
                <q-separator class="q-my-sm" />
                <div class="flex justify-between items-center text-subtitle1 text-bold">
                  <span>Total</span>
                  <span>{{ formattedTotalAmount }}</span>
                </div>
              </div>


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
          :disable="!canSubmit || isProcessing"
          @click="handleSubmit"
        >
          <div class="flex items-center justify-center q-gap-sm">
            <q-icon name="payments" />
            <span class="text-h6">
              Submit tip <span v-if="formattedTotalAmount"> {{ formattedTotalAmount }}</span>
            </span>
          </div>
        </q-btn>
      </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLazyQuery, useQuery } from '@vue/apollo-composable';
import useTipPayment from 'src/composables/useTipPayment';
import { USER_QUERY } from 'src/apollo/types/user';
import { TIP_PRESETS_QUERY } from 'src/apollo/types/queries/tip';
import type { IGraphQLUserResult, IUser } from 'src/interfaces/user';
import type { ITipPresetsResult } from 'src/interfaces/tip';
import useNotify from 'src/modules/useNotify';
import { roundMoney } from 'src/helpers/currency';
import { ArtistCard } from 'src/components/SearchPage';
import useSettings from 'src/composables/useSettings';
import { useSettingsStore } from 'src/stores/settings';

const route = useRoute();
const router = useRouter();
const { showError } = useNotify();
const { isProcessing, initiateTipPayment } = useTipPayment();
const { fetchSettings } = useSettings();
const settingsStore = useSettingsStore();

const { result: tipPresetsResult, loading: isLoadingPresets } = useQuery<ITipPresetsResult>(TIP_PRESETS_QUERY);

const tipOptions = computed(() => {
  const presets = tipPresetsResult.value?.tipPresets ?? [];
  return [...presets].sort((a, b) => a.order - b.order).map((p) => ({
    id: p.id,
    label: p.label,
    amountCents: p.amountCents,
    amount: p.amountCents / 100,
  }));
});

const selectedPresetId = ref<string | null>(null);
const customAmount = ref<number | null>(null);

watch(tipOptions, (options) => {
  if (options.length > 0 && selectedPresetId.value === null) {
    selectedPresetId.value = options[0]!.id;
  }
}, { immediate: true });

const platformFeePercent = computed(() => settingsStore.getPlatformFeePercent ?? 0);
const stripeFeePercent = computed(() => settingsStore.getStripeFeePercent ?? 0);

const customAmountIsValid = computed(
  (): boolean => typeof customAmount.value === 'number' && customAmount.value >= 1,
);

const hasInvalidCustomAmount = computed(
  (): boolean => customAmount.value !== null && typeof customAmount.value === 'number' && customAmount.value < 1,
);

const validateMinAmount = (val: number | null): boolean | string => {
  if (val === null || val === undefined) {
    return true; // Allow empty value
  }
  if (typeof val === 'number' && (val <= 0 || val < 1)) {
    return 'Minimum tip amount is $1';
  }
  return true;
};

const artistData = ref<IUser | null>(null);

const { load: loadArtist, onResult, onError, loading: isLoadingArtist } =
  useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const artistName = computed(() => artistData.value?.name ?? artistData.value?.email);

const canTip = computed(() => artistData.value?.payoutsEnabled === true);

const selectedPreset = computed(() => {
  if (!selectedPresetId.value || tipOptions.value.length === 0) return null;
  return tipOptions.value.find((o) => o.id === selectedPresetId.value) ?? null;
});

const tipAmount = computed(() => {
  if (customAmountIsValid.value) {
    return customAmount.value!;
  }
  if (hasInvalidCustomAmount.value) {
    return null; // Don't show amount if custom value is invalid
  }
  return selectedPreset.value?.amount ?? null;
});

const platformFeeAmount = computed(() => {
  if (tipAmount.value === null || platformFeePercent.value === 0) {
    return 0;
  }
  return roundMoney(tipAmount.value * (platformFeePercent.value / 100));
});

const stripeFeeAmount = computed(() => {
  if (tipAmount.value === null || stripeFeePercent.value === 0) {
    return 0;
  }
  return roundMoney(tipAmount.value * (stripeFeePercent.value / 100));
});

const feeAmount = computed(() => platformFeeAmount.value + stripeFeeAmount.value);

const totalAmount = computed(() => {
  if (tipAmount.value === null) {
    return 0;
  }
  return roundMoney(tipAmount.value + feeAmount.value);
});

const formattedTotalAmount = computed(() => {
  return `$${totalAmount.value.toFixed(2)}`;
});

const getOptionTotal = (amount: number) => {
  const fees = amount * (platformFeePercent.value / 100) + amount * (stripeFeePercent.value / 100);
  const total = roundMoney(amount + fees);
  return `$${total % 1 === 0 ? total.toFixed(0) : total.toFixed(2)}`;
};

const canSubmit = computed(() => {
  if (!canTip.value) return false;
  if (hasInvalidCustomAmount.value) return false;
  return selectedPresetId.value !== null;
});

const handleSelectOption = (option: { id: string; label: string; amountCents: number; amount: number }) => {
  selectedPresetId.value = option.id;
  customAmount.value = null;
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

  if (!selectedPresetId.value) {
    showError('Choose a tip amount to continue.');
    return;
  }

  await initiateTipPayment(artistData.value.documentId, selectedPresetId.value);
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

watch(
  () => customAmount.value,
  (newVal) => {
    // Clear selected preset when user starts typing custom value
    if (newVal !== null && newVal !== undefined) {
      selectedPresetId.value = null;
    }
  },
);

onError((error) => {
  console.error('Failed to load artist for tipping:', error);
  showError('Unable to load artist profile.');
});

onBeforeMount(() => {
  fetchSettings();
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

.custom-tip-field {
  display: none;
  flex-direction: column;
  gap: 6px;
}

.custom-tip-field__input {
  width: 100%;
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

.grow-button {
  flex: 1;
  min-width: 180px;
  width: 100%;
}

.action-buttons {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
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
