<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" to="/profile" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Booking <span class="text-primary">Deposit</span></h2>
    </div>

    <div class="content-wrapper full-width q-pb-xl">
      <div class="container">
        <div class="input-group booking-deposit-card q-mt-md bg-block border-radius-lg">
          <div class="flex items-center justify-between full-width q-mb-sm">
            <label class="input-label q-mb-none text-body1">Charge a deposit?</label>
            <q-toggle v-model="formData.chargeDeposit" color="primary" dense />
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

    <SaveButton
      v-if="user?.stripeAccountID && user?.payoutsEnabled === true"
      :has-changes="hasChanges"
      :loading="loading"
      @save="handleSave"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_USER_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import useUser from 'src/modules/useUser';
import SaveButton from 'src/components/SaveButton.vue';
import { centsToDollars, dollarsToCents } from 'src/helpers/currency';

const router = useRouter();
const { showSuccess, showError } = useNotify();
const { fetchMe, user } = useUser();

const loading = ref(false);
const formData = ref({
  chargeDeposit: false,
  depositAmount: null as number | null,
});

const {
  mutate: updateUser,
  onDone: onDoneUpdate,
  onError: onErrorUpdate,
} = useMutation(UPDATE_USER_MUTATION);

const hasChanges = computed(() => {
  if (!user.value) {
    return false;
  }
  const depositAmount = user.value.depositAmount ?? null;
  return (
    formData.value.chargeDeposit !== (user.value.chargeDeposit || false) ||
    dollarsToCents(formData.value.depositAmount) !== depositAmount
  );
});

watch(
  user,
  (profile) => {
    if (!profile) {
      return;
    }
    formData.value = {
      chargeDeposit: profile.chargeDeposit || false,
      depositAmount: centsToDollars(profile.depositAmount),
    };
  },
  { immediate: true },
);

onDoneUpdate((result) => {
  loading.value = false;
  if (result.errors?.length) {
    console.error('Error updating booking deposit settings:', result.errors);
    showError('Failed to update booking deposit settings');
    return;
  }

  if (result.data?.updateUsersPermissionsUser) {
    void fetchMe().then(() => {
      showSuccess('Booking deposit settings saved');
      router.back();
    });
  }
});

onErrorUpdate((error) => {
  loading.value = false;
  console.error('Booking deposit update failed:', error);
  showError('Failed to update booking deposit settings');
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
  const depositAmountInCents = dollarsToCents(formData.value.depositAmount);
  if (depositAmountInCents !== (user.value.depositAmount || null)) {
    data.depositAmount = depositAmountInCents;
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
</script>

<style scoped>
.content-wrapper {
  padding-bottom: 100px;
}

.input-group {
  width: 100%;
}

.booking-deposit-card {
  padding: 20px;
}
</style>
