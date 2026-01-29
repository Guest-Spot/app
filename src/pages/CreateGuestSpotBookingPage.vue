<template>
  <q-page class="page flex column items-start create-booking-page">
    <div class="page-card">
      <div class="dialog-header">
        <div class="header-left flex items-center q-gap-sm">
          <div class="text-subtitle1 text-bold">Book Guest Spot</div>
        </div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          @click="closePage"
        />
      </div>

      <div class="dialog-content q-mt-md">
        <LoadingState
          v-if="isLoadingSlotOrSlots"
          :is-loading="isLoadingSlotOrSlots"
          title="Loading slot..."
          description="Please wait"
          spinner-name="dots"
        />

        <NoResult
          v-else-if="!slotData"
          icon="error"
          title="Slot not found"
          description="This guest spot slot may have been removed"
          no-btn
        />

        <div v-else class="custom-stepper">
          <div class="stepper-header" ref="stepperHeaderRef">
            <div
              v-for="step in visibleSteps"
              :key="step.id"
              class="stepper-item"
              :class="{
                active: currentStep === step.id,
                completed: currentStep > step.id,
              }"
              @click="handleStepClick(step.id)"
            >
              <q-icon :name="step.icon" size="20px" />
              <span>{{ step.title }}</span>
            </div>
          </div>

          <RequirementsStep
            v-if="currentStep === 1"
            :description="slotData?.description ?? null"
          />

          <DateStep
            v-else-if="currentStep === 2"
            ref="dateStepRef"
            v-model:date="bookingData.selectedDate"
            :opening-hours="slotData.openingHours"
            :slot-data="slotData"
            :rules="rules"
            @update:availability="dateAvailability = $event"
          />

          <ReviewStep
            v-else-if="currentStep === 3"
            ref="reviewStepRef"
            v-model:comment="bookingData.comment"
            :selected-date="bookingData.selectedDate"
            :slot-data="slotData"
          />

          <PaymentStep
            v-else-if="currentStep === 4 && shouldShowPaymentStep"
            :loading="isPaymentProcessing"
            :disabled="isPaymentProcessing"
            :deposit-amount="depositAmountDisplay"
            :platform-commission="platformCommissionAmount"
            :total-amount="totalPaymentAmount"
            @on-pay="handlePayment"
          />
        </div>
      </div>
    </div>

    <div v-if="slotData" class="dialog-actions bg-block full-width">
      <q-btn
        v-if="isAtFirstStep"
        label="Cancel"
        rounded
        unelevated
        class="bg-block"
        @click="closePage"
      />
      <q-btn
        v-else-if="currentStep === 4"
        label="Pay later"
        rounded
        unelevated
        class="bg-block"
        @click="closePage"
      />
      <q-btn v-else label="Back" rounded unelevated class="bg-block" @click="goToPrevStep" />
      <div class="actions-right flex q-gap-sm">
        <q-btn
          v-if="currentStep < 3"
          label="Next"
          color="primary"
          rounded
          unelevated
          :disable="isNextDisabled"
          @click="goToNextStep"
        />
        <q-btn
          v-else-if="currentStep === 3"
          label="Submit Request"
          color="primary"
          rounded
          unelevated
          :disable="isSubmitDisabled"
          :loading="isSubmitting"
          @click="onSubmit"
        />
        <q-btn
          v-else-if="currentStep === 4"
          label="Pay Deposit"
          color="primary"
          icon="payments"
          rounded
          unelevated
          :disable="isPaymentProcessing"
          :loading="isPaymentProcessing"
          @click="handlePayment"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  DateStep,
  RequirementsStep,
  ReviewStep,
} from 'src/components/GuestSpot/CreateBookingSteps';
import { PaymentStep } from 'src/components/Dialogs/CreateBookingSteps';
import { LoadingState, NoResult } from 'src/components';
import useGuestSpot from 'src/composables/useGuestSpot';
import useGuestSpotPayment from 'src/composables/useGuestSpotPayment';
import { centsToDollars } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';
import useNotify from 'src/modules/useNotify';
import useStripe from 'src/composables/useStripe';
import type { IGuestSpotBooking, IGuestSpotBookingRequest } from 'src/interfaces/guestSpot';

const route = useRoute();
const router = useRouter();

const { showError, showSuccess } = useNotify();
const settingsStore = useSettingsStore();
const { addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();

const {
  currentSlot,
  slots,
  isLoadingSlot,
  isLoadingSlots,
  loadSlot,
  loadSlots,
  createBooking,
} = useGuestSpot();

const {
  initiateDeposit,
  isProcessing: isPaymentProcessing,
} = useGuestSpotPayment();

const slotId = computed(() => route.query.slotId as string | undefined);
const shopId = computed(() => route.query.shopId as string | undefined);

const slotData = computed(() => {
  if (slotId.value && currentSlot.value) {
    return currentSlot.value;
  }
  if (shopId.value && slots.value.length > 0) {
    return slots.value[0] ?? null;
  }
  return null;
});

const isLoadingSlotOrSlots = computed(
  () => (slotId.value && isLoadingSlot.value) || (shopId.value && isLoadingSlots.value),
);

const baseSteps = [
  { id: 1, title: 'Requirements', icon: 'description' },
  { id: 2, title: 'Date', icon: 'event' },
  { id: 3, title: 'Review', icon: 'check' },
  { id: 4, title: 'Payment', icon: 'payment' },
] as const;

const shouldShowPaymentStep = computed(() => {
  if (settingsStore.getStripeEnabled !== true || !slotData.value) {
    return false;
  }
  const deposit = centsToDollars(slotData.value.depositAmount);
  return deposit !== null && deposit > 0;
});

const visibleSteps = computed(() => {
  let steps: typeof baseSteps[number][] = [...baseSteps];
  if (!shouldShowPaymentStep.value) {
    steps = steps.filter((step) => step.id !== 4);
  }
  return steps;
});

const firstVisibleStepId = computed(() => visibleSteps.value[0]?.id ?? baseSteps[0].id);
const lastVisibleStepId = computed<number>(() => {
  const steps = visibleSteps.value;
  if (steps.length > 0) {
    return steps[steps.length - 1]!.id;
  }
  return baseSteps[baseSteps.length - 1]!.id;
});

const currentStep = ref(firstVisibleStepId.value);
const isSubmitting = ref(false);
const stepperHeaderRef = ref<HTMLDivElement | null>(null);
const createdBooking = ref<IGuestSpotBooking | null>(null);

const dateStepRef = ref<InstanceType<typeof DateStep> | null>(null);
const reviewStepRef = ref<InstanceType<typeof ReviewStep> | null>(null);

const isAtFirstStep = computed(() => currentStep.value === firstVisibleStepId.value);
const isAtLastStep = computed(() => currentStep.value === lastVisibleStepId.value);

const bookingData = reactive({
  selectedDate: '',
  comment: '',
});

const rules = {
  required: (field: string) => (val: string | null | undefined) => !!val || `${field} is required`,
};

const depositAmountDisplay = computed<number | null>(() => {
  if (!slotData.value) return null;
  const amount = centsToDollars(slotData.value.depositAmount);
  if (!amount || amount <= 0) {
    return null;
  }
  return Math.round(amount * 100) / 100;
});

const platformCommissionAmount = computed<number | null>(() => {
  const deposit = depositAmountDisplay.value;
  const totalFeePercent = settingsStore.getTotalFeePercent;
  if (!deposit || !totalFeePercent) {
    return null;
  }
  const feePercent = totalFeePercent / 100;
  const commission = deposit * feePercent;
  return Math.round(commission * 100) / 100;
});

const totalPaymentAmount = computed<number | null>(() => {
  const deposit = depositAmountDisplay.value;
  if (!deposit) {
    return null;
  }
  const commission = platformCommissionAmount.value ?? 0;
  const total = deposit + commission;
  return Math.round(total * 100) / 100;
});

const dateAvailability = ref<{ available: number; total: number; taken: number } | null>(null);

const isNextDisabled = computed(() => {
  if (currentStep.value === 2) {
    if (!bookingData.selectedDate) return true;
    if (dateAvailability.value?.available === 0) return true;
    return false;
  }
  return false;
});

const isSubmitDisabled = computed(() => isSubmitting.value || !bookingData.selectedDate);

watch(firstVisibleStepId, (stepId) => {
  if (!visibleSteps.value.some((step) => step.id === currentStep.value)) {
    currentStep.value = stepId;
  }
});

const goToNextStep = async () => {
  const isValid = await validateCurrentStep();
  if (!isValid) return;
  const stepsOrder = visibleSteps.value;
  const currentIndex = stepsOrder.findIndex((step) => step.id === currentStep.value);
  if (currentIndex !== -1 && currentIndex < stepsOrder.length - 1) {
    currentStep.value = stepsOrder[currentIndex + 1]!.id;
  }
};

const goToPrevStep = () => {
  const stepsOrder = visibleSteps.value;
  const currentIndex = stepsOrder.findIndex((step) => step.id === currentStep.value);
  if (currentIndex > 0) {
    currentStep.value = stepsOrder[currentIndex - 1]!.id;
  }
};

const handleStepClick = (stepId: number) => {
  if (isAtLastStep.value) return;
  const stepsOrder = visibleSteps.value;
  const targetIndex = stepsOrder.findIndex((step) => step.id === stepId);
  const currentIndex = stepsOrder.findIndex((step) => step.id === currentStep.value);
  if (targetIndex === -1 || currentIndex === -1) return;
  if (targetIndex <= currentIndex) {
    currentStep.value = stepsOrder[targetIndex]!.id;
  }
};

const validateCurrentStep = async (): Promise<boolean> => {
  if (currentStep.value === 2) {
    const result = await dateStepRef.value?.validateForm();
    return !!result;
  }
  return true;
};

const onSubmit = async () => {
  const isValid = await validateCurrentStep();
  if (!isValid) return;

  if (!slotData.value) {
    showError('Slot not found. Please try again.');
    return;
  }

  if (!bookingData.selectedDate) {
    showError('Please select a date before submitting.');
    return;
  }

  try {
    isSubmitting.value = true;

    const bookingDataPayload: IGuestSpotBookingRequest = {
      guestSpotSlotDocumentId: slotData.value.documentId,
      selectedDate: bookingData.selectedDate,
    };

    if (bookingData.comment) {
      bookingDataPayload.comment = bookingData.comment;
    }

    const booking = await createBooking(bookingDataPayload);

    if (!booking) {
      showError('Failed to create booking. Please try again.');
      return;
    }

    createdBooking.value = booking;

    if (shouldShowPaymentStep.value) {
      currentStep.value = 4;
    } else {
      showSuccess('Booking request sent!');
      await resetFormState();
      void router.push('/events?tab=guest-spot');
    }
  } catch (error) {
    console.error('Failed to submit booking:', error);
    showError('Failed to submit booking. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const handlePayment = async () => {
  if (!createdBooking.value?.documentId) {
    showError('Booking not found. Please try again.');
    return;
  }

  await initiateDeposit(createdBooking.value.documentId);
};

const resetFormState = async () => {
  currentStep.value = firstVisibleStepId.value;
  bookingData.selectedDate = '';
  bookingData.comment = '';
  createdBooking.value = null;

  await nextTick();
  dateStepRef.value?.resetForm();
  reviewStepRef.value?.resetForm();
};

const closePage = () => {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    router.back();
    return;
  }
  void router.push('/');
};

watch(currentStep, (newStep, oldStep) => {
  if (newStep > oldStep && newStep === 2) {
    stepperHeaderRef.value?.scrollTo({
      left: stepperHeaderRef.value?.offsetWidth ?? 0,
      behavior: 'smooth',
    });
  }
  if (newStep < oldStep && newStep === 1) {
    stepperHeaderRef.value?.scrollTo({
      left: 0,
      behavior: 'smooth',
    });
  }
});

const loadSlotData = async () => {
  if (slotId.value) {
    await loadSlot(slotId.value);
  } else if (shopId.value) {
    await loadSlots({ shopDocumentId: shopId.value, enabled: true });
  } else {
    showError('Slot or shop is required');
    void router.push('/');
  }
};

const handleBrowserFinished = () => {
  console.log('Browser closed, redirecting to events...');
  void router.push('/events');
};

onMounted(async () => {
  await loadSlotData();
  addBrowserFinishedListener(() => void handleBrowserFinished());
});

onBeforeUnmount(async () => {
  await removeAllBrowserListeners();
});
</script>

<style scoped lang="scss">
.create-booking-page {
  box-sizing: border-box;
  padding-bottom: 90px;
}

.page-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.dialog-content {
  padding: 0 20px;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.custom-stepper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.stepper-header {
  display: flex;
  gap: 8px;
  padding: 2px 16px 0;
  margin-bottom: 16px;
  flex-shrink: 0;
  overflow-x: auto;
  flex-wrap: nowrap;
}

.stepper-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  min-height: 32px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.4);
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &.active {
    border: 1px solid var(--q-primary);
    background: rgba(0, 0, 0, 0.06);
    color: rgba(0, 0, 0, 0.6);
    transform: translateY(-1px);
  }

  &.completed {
    background: var(--q-primary) !important;
    color: #fff;
  }

  span {
    font-size: 12px;
  }
}

.dialog-actions {
  padding: 16px 20px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  bottom: 0;
  z-index: 10;

  .q-btn {
    font-weight: 600;
  }
}

.body--dark {
  .create-booking-page {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .stepper-item {
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.4);

      &.active,
      &.completed {
        background: rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }
}
</style>
