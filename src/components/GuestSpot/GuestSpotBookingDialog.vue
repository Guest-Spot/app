<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card style="min-width: 500px; max-width: 800px">
      <q-card-section>
        <div class="text-h6">Book Guest Spot</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-stepper v-model="currentStep" color="primary" animated>
          <!-- Step 1: Date Selection -->
          <q-step :name="1" title="Select Date" icon="event">
            <q-form @submit="handleDateSubmit">
              <q-input
                v-model="selectedDate"
                label="Date"
                outlined
                readonly
                :rules="[(val) => !!val || 'Date is required']"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="selectedDate"
                        mask="YYYY-MM-DD"
                        :options="isDateAllowed"
                        @update:model-value="() => {}"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-btn
                type="submit"
                color="primary"
                label="Next"
                :disable="!selectedDate"
                class="q-mt-md"
              />
            </q-form>
          </q-step>

          <!-- Step 2: Comment -->
          <q-step :name="2" title="Add Comment" icon="comment">
            <q-form @submit="handleCommentSubmit">
              <q-input
                v-model="comment"
                label="Comment (optional)"
                type="textarea"
                rows="4"
                outlined
              />
              <div class="flex q-gap-sm q-mt-md">
                <q-btn flat label="Back" @click="currentStep = 1" />
                <q-btn type="submit" color="primary" label="Next" />
              </div>
            </q-form>
          </q-step>

          <!-- Step 3: Review & Submit -->
          <q-step :name="3" title="Review" icon="check">
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
            <div class="flex q-gap-sm q-mt-md">
              <q-btn flat label="Back" @click="currentStep = 2" />
              <q-btn
                color="primary"
                label="Submit Request"
                @click="handleSubmit"
                :loading="isCreating"
              />
            </div>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useDate from 'src/modules/useDate';
import { centsToDollars } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';

interface Props {
  modelValue: boolean;
  slotData: IGuestSpotSlot | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [data: { selectedDate: string; comment?: string }];
}>();

const { formatDate } = useDate();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const currentStep = ref(1);
const selectedDate = ref('');
const comment = ref('');

const isDateAllowed = (date: string) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected >= today;
};

const formattedDate = computed(() => {
  if (!selectedDate.value) return '';
  return formatDate(selectedDate.value, { useUsFormat: true });
});

const depositAmountText = computed(() => {
  if (!props.slotData) return '0.00';
  const amount = centsToDollars(props.slotData.depositAmount);
  return amount ? amount.toFixed(2) : '0.00';
});

const settingsStore = useSettingsStore();

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

const isCreating = computed(() => props.loading);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      currentStep.value = 1;
      selectedDate.value = '';
      comment.value = '';
    }
  },
);

const handleDateSubmit = () => {
  if (selectedDate.value) {
    currentStep.value = 2;
  }
};

const handleCommentSubmit = () => {
  currentStep.value = 3;
};

const handleSubmit = () => {
  if (!selectedDate.value || !props.slotData) return;

  emit('submit', {
    selectedDate: selectedDate.value,
    comment: comment.value || undefined,
  });
};
</script>

<style scoped lang="scss">
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
