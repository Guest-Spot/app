<template>
  <div class="step-content">
    <div class="payment-info">
      <!-- Pricing Information Card -->
      <div v-if="depositDisplay !== null" class="pricing-card bg-block border-radius-lg q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">Payment Summary</div>

        <div class="pricing-breakdown">
          <div class="price-row q-mb-sm">
            <span class="text-grey-6">Deposit</span>
            <span class="text-weight-bold">${{ depositDisplayText }}</span>
          </div>
          <div v-if="commissionDisplayText" class="price-row q-mb-sm">
            <span class="text-grey-6">Service Fee</span>
            <span class="text-weight-bold">${{ commissionDisplayText }}</span>
          </div>

          <q-separator class="q-my-md" />

          <div class="price-row flex items-center">
            <div class="flex column">
              <span class="text-caption text-grey-6">Total to pay now</span>
              <span class="text-h5 text-bold text-primary">${{ totalDisplayText }}</span>
            </div>
            <q-icon name="credit_card" size="24px" color="grey-5" class="q-ml-auto" />
          </div>

          <q-banner dense rounded class="q-mt-md booking-notice">
            <template #avatar>
              <q-icon name="info" size="20px" />
            </template>
            Your booking will be created only after successful payment.
          </q-banner>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';
import { roundMoney } from 'src/helpers/currency';

const props = withDefaults(
  defineProps<{
    loading?: boolean;
    disabled?: boolean;
    depositAmount?: number | null;
    platformCommission?: number | null;
    totalAmount?: number | null;
  }>(),
  {
    loading: false,
    disabled: false,
    depositAmount: null,
    platformCommission: null,
    totalAmount: null,
  },
);

const depositDisplay = computed<number | null>(() => {
  if (props.depositAmount === null || props.depositAmount === undefined) {
    return null;
  }
  return roundMoney(props.depositAmount);
});

const commissionDisplay = computed<number | null>(() => {
  if (props.platformCommission === null || props.platformCommission === undefined) {
    return null;
  }
  return roundMoney(props.platformCommission);
});

const totalDisplay = computed<number | null>(() => {
  if (props.totalAmount !== null && props.totalAmount !== undefined) {
    return roundMoney(props.totalAmount);
  }
  if (depositDisplay.value !== null) {
    return depositDisplay.value;
  }
  return null;
});

const depositDisplayText = computed<string | null>(() => {
  return depositDisplay.value !== null ? depositDisplay.value.toFixed(2) : null;
});

const commissionDisplayText = computed<string | null>(() => {
  return commissionDisplay.value !== null ? commissionDisplay.value.toFixed(2) : null;
});

const totalDisplayText = computed<string | null>(() => {
  return totalDisplay.value !== null ? totalDisplay.value.toFixed(2) : null;
});

defineEmits<{
  (e: 'onPay'): void;
}>();
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pricing-card {
  padding: 24px;
}

.booking-notice {
  background: rgba(var(--q-primary-rgb), 0.08);
  color: rgba(var(--q-primary-rgb), 0.9);

  .body--dark & {
    background: rgba(var(--q-primary-rgb), 0.15);
  }
}

.icon-box {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(var(--q-primary-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.trust-indicators {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.indicator-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;

  .body--dark & {
    background: rgba(255, 255, 255, 0.05);
  }
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

h3 {
  margin: 0;
}
</style>
