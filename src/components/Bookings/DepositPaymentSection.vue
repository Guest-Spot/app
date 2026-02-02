<template>
  <div v-if="canInitiatePayment" class="deposit-payment-section">
    <InfoCard
      title="Payment"
      icon="payment"
      :data="paymentData"
    />
    <div class="deposit-payment-section__actions dialog-actions__controls">
      <q-btn
        v-if="showCancel"
        label="Cancel"
        color="negative"
        rounded
        flat
        class="bg-block"
        :loading="cancelLoading"
        :disable="actionsDisabled"
        @click="emit('cancel')"
      />
      <q-btn
        :label="totalAmount ? `Pay Deposit ($${totalAmount.toFixed(2)})` : 'Pay Deposit'"
        color="primary"
        rounded
        class="full-width"
        icon="payment"
        :loading="isProcessing"
        :disable="actionsDisabled"
        @click="emit('pay')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InfoCard from 'src/components/InfoCard.vue';

interface Props {
  depositAmount: number;
  totalAmount: number;
  canInitiatePayment: boolean;
  isProcessing: boolean;
  showCancel?: boolean;
  cancelLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showCancel: false,
  cancelLoading: false,
});

const emit = defineEmits<{
  pay: [];
  cancel: [];
}>();

const paymentData = computed(() => {
  if (!props.canInitiatePayment || !props.depositAmount) return [];
  const commission = Math.round((props.totalAmount - props.depositAmount) * 100) / 100;
  return [
    { label: 'Deposit', value: `$${props.depositAmount.toFixed(2)}` },
    { label: 'Platform Commission', value: `$${commission.toFixed(2)}` },
  ];
});

const actionsDisabled = computed(
  () => props.isProcessing || props.cancelLoading
);
</script>

<style scoped lang="scss">
.deposit-payment-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deposit-payment-section__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .q-btn {
    flex: 1;
    min-width: 0;
    font-weight: 600;
  }
}
</style>
