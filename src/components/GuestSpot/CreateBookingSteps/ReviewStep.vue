<template>
  <div class="step-content">
    <InfoCard title="Review" icon="info" :data="reviewData" />
    <q-form ref="formRef" class="comment-form flex column q-gap-lg">
      <div class="input-group">
        <label class="input-label">Comment (optional)</label>
        <q-input
          v-model="commentModel"
          type="textarea"
          rows="4"
          outlined
          dense
          rounded
          placeholder="Add any additional information..."
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QForm } from 'quasar';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useDate from 'src/modules/useDate';
import { centsToDollars, roundMoney } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';
import { InfoCard } from 'src/components';
import { EGuestSpotPricingType } from 'src/interfaces/enums';

interface Props {
  selectedDate: string;
  comment?: string;
  slotData: IGuestSpotSlot | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:comment', value: string): void;
}>();

const formRef = ref<QForm | null>(null);

const commentModel = computed({
  get: () => props.comment ?? '',
  set: (val: string) => emit('update:comment', val),
});

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
  return roundMoney(commission).toFixed(2);
});

const totalAmountText = computed(() => {
  const deposit = depositAmountText.value ? parseFloat(depositAmountText.value) : 0;
  const commission = platformCommissionText.value ? parseFloat(platformCommissionText.value) : 0;
  const total = deposit + commission;
  return total > 0 ? roundMoney(total).toFixed(2) : null;
});

const getPricingTypeLabel = (type: EGuestSpotPricingType): string => {
  const labels: Record<EGuestSpotPricingType, string> = {
    [EGuestSpotPricingType.Hourly]: 'Hourly',
    [EGuestSpotPricingType.Daily]: 'Daily',
    [EGuestSpotPricingType.Flat]: 'Flat',
  };
  return labels[type] || type;
};

const slotPriceText = computed(() => {
  if (!props.slotData || !props.slotData.pricingOptions || props.slotData.pricingOptions.length === 0) {
    return 'Free';
  }

  return props.slotData.pricingOptions
    .map((option) => {
      const amount = centsToDollars(option.amount);
      const formattedAmount = amount ? amount.toFixed(2) : '0.00';
      return `${getPricingTypeLabel(option.type)}: $${formattedAmount}`;
    })
    .join(', ');
});

const reviewData = computed(() => {
  const data: { label: string; value: string }[] = [
    {
      label: 'Date',
      value: formattedDate.value,
    },
  ];

  if (props.slotData) {
    data.push({
      label: 'Price',
      value: slotPriceText.value,
    });
  }

  if (props.comment) {
    data.push({
      label: 'Comment',
      value: props.comment,
    });
  }

  data.push({
    label: 'Deposit',
    value: `$${depositAmountText.value}`,
  });

  if (platformCommissionText.value) {
    data.push({
      label: 'Platform Commission',
      value: `$${platformCommissionText.value}`,
    });
  }

  if (totalAmountText.value) {
    data.push({
      label: 'Total',
      value: `$${totalAmountText.value}`,
    });
  }

  return data;
});

const validateForm = (): boolean => {
  return true;
};

const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
};

defineExpose({
  validateForm,
  resetForm,
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
