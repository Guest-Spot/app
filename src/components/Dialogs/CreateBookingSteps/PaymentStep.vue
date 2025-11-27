<template>
  <div class="step-content">
    <div class="payment-info">
      <!-- Pricing Information Card -->
      <div v-if="depositDisplay !== null" class="pricing-card bg-block border-radius-lg q-mt-md">
        <div class="text-subtitle1 text-bold q-mb-md">Payment Summary</div>

        <div class="pricing-breakdown">
          <div class="price-row q-mb-sm">
            <span class="text-grey-8">Deposit</span>
            <span class="text-weight-bold">${{ depositDisplayText }}</span>
          </div>
          <div v-if="commissionDisplayText" class="price-row q-mb-sm">
            <span class="text-grey-8">Service Fee</span>
            <span class="text-weight-bold">${{ commissionDisplayText }}</span>
          </div>

          <q-separator class="q-my-md" />

          <div class="price-row flex items-center">
            <div class="flex column">
              <span class="text-caption text-grey-7">Total to pay now</span>
              <span class="text-h5 text-bold text-primary">${{ totalDisplayText }}</span>
            </div>
            <q-icon name="credit_card" size="24px" color="grey-5" class="q-ml-auto" />
          </div>
        </div>
      </div>

      <!-- Deposit Info -->
      <div class="info-card bg-block border-radius-lg">
        <div class="text-center q-mb-lg">
          <div class="icon-box q-mx-auto">
            <q-icon name="verified_user" size="42px" color="primary" />
          </div>
          <h3 class="text-h6 text-bold q-mb-sm">Secure Your Booking</h3>
          <p class="text-body2 text-grey-7 q-mb-none" style="max-width: 280px; margin: 0 auto">
            A deposit is required to confirm your appointment. The remaining balance is paid to the artist.
          </p>
        </div>

        <div class="trust-indicators full-width">
          <div class="indicator-item">
            <q-icon name="lock" size="20px" color="primary" class="q-mr-md" />
            <div class="text-body2 text-weight-medium">Secure SSL Payment</div>
          </div>
          <div class="indicator-item">
            <q-icon name="check_circle" size="20px" color="primary" class="q-mr-md" />
            <div class="text-body2 text-weight-medium">Instant Confirmation</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, withDefaults } from 'vue';

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
  return Math.round(props.depositAmount * 100) / 100;
});

const commissionDisplay = computed<number | null>(() => {
  if (props.platformCommission === null || props.platformCommission === undefined) {
    return null;
  }
  return Math.round(props.platformCommission * 100) / 100;
});

const totalDisplay = computed<number | null>(() => {
  if (props.totalAmount !== null && props.totalAmount !== undefined) {
    return Math.round(props.totalAmount * 100) / 100;
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
