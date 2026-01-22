<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
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

        <div v-else class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="flex column items-start q-gap-md full-width text-left">
            <p class="text-body1 text-grey-8 q-mb-md">
              Choose a preset amount or enter a custom value. You will be redirected to Stripe to complete the payment.
            </p>

            <div class="tip-options flex q-gap-sm q-mb-md flex-wrap">
              <q-btn
                v-for="option in tipOptions"
                :key="option"
                :label="`$${option}`"
                size="lg"
                :color="selectedAmount === option ? 'primary' : 'grey-4'"
                :text-color="selectedAmount === option ? 'white' : 'black'"
                rounded
                unelevated
                class="option-btn"
                @click="handleSelectOption(option)"
              />
            </div>

            <div class="custom-input q-mb-md full-width">
              <q-input
                outlined
                rounded
                size="lg"
                type="number"
                min="1"
                placeholder="Enter a custom tip"
                prefix="$"
                :model-value="customAmount ?? ''"
                @update:model-value="handleCustomAmount"
                :disable="isProcessing"
                class="full-width"
                bg-color="transparent"
              />
              <p class="text-caption text-grey-6 q-mt-xs">Minimum $1</p>
            </div>

            <div class="selected-amount text-body1 q-mb-md">
              Tip amount: <span class="text-h6">{{ formattedTipAmount }}</span>
            </div>

            <q-btn
              label="Submit tip"
              color="secondary"
              rounded
              unelevated
              class="full-width"
              :loading="isProcessing"
              :disable="!canTip || isProcessing"
              @click="handleSubmit"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useLazyQuery } from '@vue/apollo-composable';
import useTipPayment from 'src/composables/useTipPayment';
import { USER_QUERY } from 'src/apollo/types/user';
import type { IGraphQLUserResult, IUser } from 'src/interfaces/user';
import useNotify from 'src/modules/useNotify';
import { dollarsToCents } from 'src/helpers/currency';

const route = useRoute();
const { showError } = useNotify();
const { isProcessing, initiateTipPayment } = useTipPayment();
const tipOptions = [5, 20, 100];
const selectedAmount = ref<number>(tipOptions[0]);
const customAmount = ref<number | null>(null);
const artistData = ref<IUser | null>(null);

const { load: loadArtist, onResult, onError, loading: isLoadingArtist } =
  useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const artistName = computed(() => {
  if (!artistData.value) return 'artist';
  return artistData.value.name || artistData.value.username || 'artist';
});

const canTip = computed(() => artistData.value?.payoutsEnabled === true);

const tipAmount = computed(() => {
  if (customAmount.value && customAmount.value > 0) {
    return customAmount.value;
  }
  return selectedAmount.value;
});

const formattedTipAmount = computed(() => `$${tipAmount.value.toFixed(2)}`);

const handleSelectOption = (amount: number) => {
  selectedAmount.value = amount;
  customAmount.value = null;
};

const handleCustomAmount = (value: string | number) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    customAmount.value = null;
  } else {
    customAmount.value = parsed;
  }
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

  const amountInCents = dollarsToCents(tipAmount.value);
  if (!amountInCents || amountInCents <= 0) {
    showError('Enter a valid tip amount.');
    return;
  }

  const success = await initiateTipPayment(artistData.value.documentId, amountInCents);
  if (success) {
    customAmount.value = null;
  }
};

onResult((result) => {
  if (result.data?.usersPermissionsUser) {
    artistData.value = result.data.usersPermissionsUser;
  }
});

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
.tip-options {
  gap: 0.75rem;
}

.option-btn {
  min-width: 110px;
  font-weight: 600;
}

.selected-amount {
  font-weight: 500;
}
</style>
