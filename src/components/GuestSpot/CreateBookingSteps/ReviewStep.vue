<template>
  <div class="step-content">
    <div class="review-section">
      <div class="review-item">
        <strong>Date:</strong> {{ formattedDate }}
      </div>
      <div v-if="comment" class="review-item">
        <strong>Comment:</strong> {{ comment }}
      </div>
      <div class="review-item">
        <strong>Deposit:</strong> ${{ depositAmountText }}
      </div>
      <div v-if="platformCommissionText" class="review-item">
        <strong>Platform Commission:</strong> ${{ platformCommissionText }}
      </div>
      <div v-if="totalAmountText" class="review-item">
        <strong>Total:</strong> ${{ totalAmountText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useDate from 'src/modules/useDate';
import { centsToDollars } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';

interface Props {
  selectedDate: string;
  comment?: string;
  slotData: IGuestSpotSlot | null;
}

const props = defineProps<Props>();

const { formatDate } = useDate();
const settingsStore = useSettingsStore();

const formattedDate = computed(() => {
  if (!props.selectedDate) return '';
  return formatDate(props.selectedDate, { useUsFormat: true });
});

const depositAmountText = computed(() => {
  if (!props.slotData) return '0.00';
  const amount = centsToDollars(props.slotData.depositAmount);
  return amount ? amount.toFixed(2) : '0.00';
});

const platformCommissionText = computed(() => {
  if (!props.slotData) return null;
  const deposit = centsToDollars(props.slotData.depositAmount);
  const totalFeePercent = settingsStore.getTotalFeePercent;
  if (!deposit || !totalFeePercent) return null;
  const feePercent = totalFeePercent / 100;
  const commission = deposit * feePercent;
  return (Math.round(commission * 100) / 100).toFixed(2);
});

const totalAmountText = computed(() => {
  const deposit = depositAmountText.value ? parseFloat(depositAmountText.value) : 0;
  const commission = platformCommissionText.value ? parseFloat(platformCommissionText.value) : 0;
  const total = deposit + commission;
  return total > 0 ? total.toFixed(2) : null;
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.review-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  padding: 12px;
  background-color: var(--bg-block);
  border-radius: 8px;
}
</style>
