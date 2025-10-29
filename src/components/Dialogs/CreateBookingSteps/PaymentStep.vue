<template>
  <div class="step-content">
    <div class="payment-info">
      <div class="info-card bg-block border-radius-lg">
        <div class="icon-wrapper">
          <q-icon name="payment" size="48px" color="primary" />
        </div>

        <div class="info-text">
          <h3 class="text-h6 text-bold q-mb-sm">Deposit Required</h3>
          <p class="text-body2 text-grey-7">
            To confirm your booking request, a deposit payment is required.
            You'll be redirected to a secure payment page to complete the transaction.
          </p>
        </div>

        <div class="info-details q-mt-md">
          <div class="detail-item">
            <q-icon name="check_circle" size="20px" color="positive" />
            <span>Secure payment processing</span>
          </div>
          <div class="detail-item">
            <q-icon name="check_circle" size="20px" color="positive" />
            <span>Your booking will be confirmed after payment</span>
          </div>
          <div class="detail-item">
            <q-icon name="check_circle" size="20px" color="positive" />
            <span>Artist will be notified immediately</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
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
  gap: 20px;
}

.info-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--q-primary-rgb), 0.1);
}

.info-text {
  max-width: 500px;

  h3 {
    margin: 0;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
}

.info-details {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>

