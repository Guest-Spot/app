<template>
  <q-dialog v-model="isVisible" position="bottom" maximized no-route-dismiss>
    <q-card class="booking-details-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Booking Details</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section v-if="booking" class="dialog-content">
        <!-- Status Badge for Artist View -->
        <div class="status-section flex column bg-block border-radius-lg q-pr-sm q-pl-md q-py-sm q-mb-md">
          <div class="status-row flex items-center justify-between">
            <div class="section-label text-grey-6">Status</div>
            <div
              class="status-chip text-caption text-bold"
              :class="`status-chip--${bookingStatus.variant}`"
            >
              <q-icon v-if="bookingStatus.icon" :name="bookingStatus.icon" size="16px" class="q-mr-xs" />
              <span>{{ bookingStatus.label }}</span>
            </div>
          </div>
        </div>

        <!-- Reject Note -->
        <div
          v-if="booking.reaction === EReactions.Rejected && booking.rejectNote"
          class="reject-note q-mt-md q-mb-md"
        >
          <div class="reject-note__label text-caption text-grey-6">Reason for rejection</div>
          <div class="reject-note__text">{{ booking.rejectNote }}</div>
        </div>

        <!-- Artist Info -->
        <div
          v-if="artist && !isCurrentUserArtist"
          class="artist-section flex column q-gap-sm q-mb-md"
        >
          <div class="artist-header flex items-center justify-between">
            <div class="section-label text-grey-6">Artist</div>
          </div>
          <ArtistCard :artist="artist" @click="viewArtistProfile" />
        </div>

        <div class="flex column q-gap-sm">
          <div class="flex column q-gap-md full-width">
            <div v-if="referenceImages.length" class="q-my-sm flex column q-gap-sm full-width">
              <div class="section-label text-grey-6">Tattoo Reference</div>
              <div class="references-gallery full-width">
                <div class="references-gallery__list">
                  <q-img
                    v-for="reference in referenceImages"
                    :key="reference.id"
                    :src="reference.url"
                    :ratio="1"
                    fit="cover"
                    class="reference-image"
                    spinner-color="dark"
                    @click="openImagePreview(reference.url)"
                  >
                    <template #error>
                      <div class="reference-image__placeholder flex flex-center column">
                        <q-icon name="image_not_supported" size="24px" color="grey-6" />
                        <span class="text-caption text-grey-6">Unavailable</span>
                      </div>
                    </template>
                  </q-img>
                </div>
              </div>
            </div>

            <InfoCard
              v-if="paymentData.length"
              title="Payment"
              icon="payment"
              :data="paymentData"
            />

            <InfoCard title="Session Details" icon="event" :data="sessionDetailsData" />

            <InfoCard
              v-if="guestInfoData.length"
              title="Guest Information"
              icon="person"
              :data="guestInfoData"
            />

            <InfoCard title="Tattoo Description" icon="description" :data="descriptionData" />
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <template v-if="canRespondToBooking">
          <div class="dialog-actions__controls">
            <q-btn
              label="Reject"
              color="negative"
              rounded
              flat
              class="bg-block full-width"
              @click="rejectBooking"
            />
            <q-btn
              label="Accept"
              color="primary"
              rounded
              class="full-width"
              @click="acceptBooking"
            />
          </div>
        </template>
        <template v-else>
          <div v-if="canInitiatePayment" class="dialog-actions__controls">
            <q-btn
              v-if="canCancelBooking"
              label="Cancel"
              color="negative"
              rounded
              flat
              class="bg-block"
              :loading="isCancelProcessing"
              :disable="actionsDisabled"
              @click="handleCancelBooking"
            />
            <q-btn
              :label="totalPaymentAmount ? `Pay Deposit ($${totalPaymentAmount.toFixed(2)})` : 'Pay Deposit'"
              color="primary"
              rounded
              class="full-width"
              icon="payment"
              :loading="isPaymentProcessing"
              :disable="actionsDisabled"
              @click="handlePayment"
            />
          </div>
          <q-btn
            v-else
            label="Close"
            rounded
            unelevated
            class="full-width bg-block"
            :disable="actionsDisabled"
            @click="closeDialog"
          />
        </template>
      </q-card-actions>

      <ImagePreviewDialog
        v-model="isImagePreviewVisible"
        :image-src="previewImageSrc"
        :allow-cropping="false"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import { useQuasar } from 'quasar';
import type { IBooking } from 'src/interfaces/booking';
import type { IUser } from 'src/interfaces/user';
import type { IPicture } from 'src/interfaces/common';
import { ArtistCard } from 'src/components/SearchPage';
import { InfoCard } from 'src/components';
import { ImagePreviewDialog } from 'src/components/Dialogs';
import useDate from 'src/modules/useDate';
import { useUserStore } from 'src/stores/user';
import { useSettingsStore } from 'src/stores/settings';
import { EBookingPaymentStatus, EReactions } from 'src/interfaces/enums';
import { getBookingStatusInfo } from 'src/helpers/bookingStatus';
import useNotify from 'src/modules/useNotify';
import useBookingPayment from 'src/composables/useBookingPayment';
import useSettings from 'src/composables/useSettings';
import { centsToDollars } from 'src/helpers/currency';
import { DELETE_BOOKING_MUTATION } from 'src/apollo/types/mutations/booking';

interface Props {
  modelValue: boolean;
  booking: IBooking | null;
}

interface BookingReactionUpdatePayload {
  documentId: string;
  reaction: EReactions;
  rejectNote?: string | undefined;
}

interface DeleteBookingResponse {
  deleteBooking: Pick<IBooking, 'documentId'> | null;
}

interface DeleteBookingVariables {
  documentId: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:booking-reaction', value: BookingReactionUpdatePayload): void;
  (e: 'cancel-booking', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime } = useDate();
const $q = useQuasar();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { showSuccess, showError } = useNotify();
const {
  initiatePayment: initiateBookingPayment,
  isProcessing: isPaymentProcessing,
} = useBookingPayment();
const { fetchSettings } = useSettings();
const { mutate: deleteBookingMutation, loading: isCancelProcessing } = useMutation<
  DeleteBookingResponse,
  DeleteBookingVariables
>(DELETE_BOOKING_MUTATION);

const isVisible = ref(props.modelValue);
const isImagePreviewVisible = ref(false);
const previewImageSrc = ref<string | null>(null);
const initialRejectNote = ref('');

// Convert partial artist to full artist for ArtistCard
const artist = computed<IUser | null>(() => {
  if (!props.booking?.artist) return null;
  return props.booking.artist as IUser;
});

const bookingStatus = computed(() => getBookingStatusInfo(props.booking, artist.value?.payoutsEnabled));
const depositAmount = computed(() => centsToDollars(artist.value?.depositAmount ?? 0));

// Platform commission calculated from global settings
const platformCommission = computed(() => {
  const totalFeePercent = settingsStore.getTotalFeePercent;
  if (!depositAmount.value || !totalFeePercent) return 0;
  const feePercent = totalFeePercent / 100; // Convert percentage to decimal
  return Math.round(depositAmount.value * feePercent * 100) / 100; // Round to 2 decimal places
});

// Total payment amount (deposit + platform commission)
const totalPaymentAmount = computed(() => {
  const deposit = depositAmount.value ?? 0;
  const commission = platformCommission.value;
  return deposit + commission;
});

// Show deposit only for paid or authorized bookings
const showDeposit = computed(() => {
  const paymentStatus = props.booking?.paymentStatus;
  return depositAmount.value !== null &&
         (paymentStatus === EBookingPaymentStatus.Paid ||
          paymentStatus === EBookingPaymentStatus.Authorized);
});

// Session details data for InfoCard
const sessionDetailsData = computed(() => {
  if (!props.booking) return [];

  const data: { label: string; value: string; className?: string }[] = [
    {
      label: 'Date',
      value: formatDate(props.booking.day || ''),
    },
    {
      label: 'Time',
      value: formatTime(props.booking.start || ''),
    },
  ];

  // Add deposit amount if paid or authorized
  if (showDeposit.value && depositAmount.value) {
    data.push({
      label: 'Deposit',
      value: `$${depositAmount.value.toFixed(2)}`,
      className: 'text-warning',
    });
  }

  if (props.booking.location) {
    data.push({
      label: 'Location',
      value: props.booking.location,
    });
  }

  return data;
});

// Guest info data for InfoCard
const guestInfoData = computed(() => {
  if (!props.booking) return [];

  const data = [];

  if (props.booking.name) {
    data.push({
      label: 'Name',
      value: props.booking.name,
    });
  }

  if (props.booking.email) {
    data.push({
      label: 'Email',
      value: props.booking.email,
    });
  }

  if (props.booking.phone) {
    data.push({
      label: 'Phone',
      value: props.booking.phone,
    });
  }

  return data;
});

// Description data for InfoCard
const descriptionData = computed(() => {
  return [
    {
      label: 'Idea',
      value: props.booking?.description || '',
    },
    {
      label: 'Placement',
      value: props.booking?.placement || '',
    },
    {
      label: 'Size',
      value: props.booking?.size || '',
    },
  ].filter((item) => item.value);
});

// Payment data for InfoCard
const paymentData = computed(() => {
  if (!canInitiatePayment.value || !depositAmount.value) return [];

  const data: { label: string; value: string; className?: string }[] = [
    {
      label: 'Deposit',
      value: `$${depositAmount.value.toFixed(2)}`,
    },
    {
      label: 'Platform Commission',
      value: `$${platformCommission.value.toFixed(2)}`,
    },
  ];

  return data;
});

const referenceImages = computed<IPicture[]>(() => props.booking?.references ?? []);

const isCurrentUserArtist = computed(() => userStore.getIsArtist);

const canInitiatePayment = computed(() => {
  return (
    !isCurrentUserArtist.value &&
    props.booking?.paymentStatus === EBookingPaymentStatus.Unpaid &&
    settingsStore.getStripeEnabled &&
    artist.value?.payoutsEnabled === true &&
    artist.value.depositAmount !== null
  );
});

const canCancelBooking = computed(() => {
  if (isCurrentUserArtist.value) {
    return false;
  }

  if (!props.booking) {
    return false;
  }

  return (
    props.booking.reaction === EReactions.Pending &&
    props.booking.paymentStatus === EBookingPaymentStatus.Unpaid
  );
});

const canRespondToBooking = computed(() => {
  const isPending = props.booking?.reaction === EReactions.Pending;

  return Boolean(isCurrentUserArtist.value && isPending);
});

const actionsDisabled = computed(() => isPaymentProcessing.value || isCancelProcessing.value);

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const viewArtistProfile = () => {
  // Artist card handles navigation internally
};

const closeDialog = () => {
  isVisible.value = false;
  isPaymentProcessing.value = false;
};

const openImagePreview = (src?: string | null) => {
  if (!src) return;
  previewImageSrc.value = src;
  isImagePreviewVisible.value = true;
};

const handlePayment = async () => {
  await initiateBookingPayment(props.booking?.documentId);
};

const handleCancelBooking = () => {
  const documentId = props.booking?.documentId;

  if (!documentId) {
    showError('Booking not found. Please try again.');
    return;
  }

  $q.dialog({
    title: 'Cancel Booking',
    message: 'Are you sure you want to cancel this booking request?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Keep Booking',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Cancel Booking',
    },
  }).onOk(() => {
    void (async () => {
      try {
        const response = await deleteBookingMutation({ documentId });

        const deletedDocumentId = response?.data?.deleteBooking?.documentId;

        if (!deletedDocumentId) {
          showError('Failed to cancel booking. Please try again.');
          return;
        }

        showSuccess('Booking request cancelled');
        emit('cancel-booking', deletedDocumentId);
        closeDialog();
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        showError('Failed to cancel booking. Please try again.');
      }
    })();
  });
};

const confirmReactionChange = (reaction: EReactions) => {
  if (!props.booking) return;

  if (reaction === EReactions.Accepted) {
    $q.dialog({
      title: 'Accept Booking',
      message: 'Are you sure you want to accept this booking request?',
      cancel: {
        color: 'grey-9',
        rounded: true,
        label: 'Cancel',
      },
      ok: {
        color: 'primary',
        rounded: true,
        label: 'Yes, Accept',
      },
    }).onOk(() => {
      if (props.booking?.documentId) {
        emit('update:booking-reaction', {
          documentId: props.booking.documentId,
          reaction,
        });
        showSuccess('Booking request accepted');
        closeDialog();
      }
    });
  } else {
    // Reject with reason
    $q.dialog({
      title: 'Reject Booking',
      message: 'Please explain why you are rejecting this booking request:',
      prompt: {
        model: initialRejectNote.value,
        type: 'textarea',
        placeholder: 'Enter reason for rejection...',
        outlined: true,
        counter: true,
        rounded: true,
        maxlength: 250,
        color: 'primary',
        required: true,
        isValid: (val: string) => {
          const trimmedValue = val.trim();
          return trimmedValue.length > 0 && trimmedValue.length <= 250;
        },
        rules: [
          (val: string) => !!val.trim() || 'Reason is required',
          (val: string) =>
            val.trim().length <= 250 || 'Reason must be less than 250 characters',
        ],
      },
      cancel: {
        color: 'grey-9',
        rounded: true,
        label: 'Cancel',
      },
      ok: {
        color: 'negative',
        rounded: true,
        label: 'Reject',
      },
    }).onOk((note: string) => {
      if (props.booking?.documentId) {
        const payload: BookingReactionUpdatePayload = {
          documentId: props.booking.documentId,
          reaction,
        };

        const trimmedNote = note.trim();
        if (trimmedNote) {
          payload.rejectNote = trimmedNote;
        }

        emit('update:booking-reaction', payload);
        showSuccess('Booking request rejected');
        initialRejectNote.value = '';
        closeDialog();
      }
    });
  }
};

const acceptBooking = () => {
  confirmReactionChange(EReactions.Accepted);
};

const rejectBooking = () => {
  confirmReactionChange(EReactions.Rejected);
};

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      // Load settings if not already loaded
      fetchSettings();
    } else {
      isPaymentProcessing.value = false;
    }
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
  if (!newValue) {
    isImagePreviewVisible.value = false;
    previewImageSrc.value = null;
    isPaymentProcessing.value = false;
  }
});

watch(
  () => props.booking?.documentId,
  () => {
    isPaymentProcessing.value = false;
  },
);

watch(isImagePreviewVisible, (newValue) => {
  if (!newValue) {
    previewImageSrc.value = null;
  }
});
</script>

<style scoped lang="scss">
.booking-details-dialog {
  border-radius: 20px 20px 0 0;
  max-width: 500px;
  width: 100%;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;

    .title-section {
      .booking-title {
        font-size: 20px;
        font-weight: 700;
        line-height: 1.3;
        margin: 0 0 8px 0;
        color: var(--q-dark);
      }
    }

    .section-label {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .status-section {
      padding-bottom: 8px;
    }

    .status-row {
      gap: 12px;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0.3px;

      &--positive {
        background: rgba(33, 186, 69, 0.12);
        color: #21ba45;
      }

      &--warning {
        background: rgba(242, 192, 55, 0.12);
        color: #f2c037;
      }

      &--negative {
        background: rgba(193, 0, 21, 0.12);
        color: #c10015;
      }

      &--neutral {
        background: rgba(0, 0, 0, 0.06);
        color: #757575;
      }

      &--info {
        background: rgba(49, 204, 236, 0.12);
        color: #31ccec;
      }
    }

    .reject-note {
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13px;
      line-height: 1.4;
      border-left: 1px solid rgba(193, 0, 21, 0.2);
      background: rgba(193, 0, 21, 0.01);

      &__label {
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 600;
      }
    }

    .references-gallery {
      display: flex;
      flex-direction: column;
      gap: 8px;

      &__list {
        display: flex;
        gap: 12px;
        overflow-x: auto;

        &::webkit-scrollbar {
          display: none;
        }

        &::scrollbar {
          display: none;
        }

        .reference-image {
          min-width: 96px;
          max-width: 96px;
          height: 96px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.04);
        }

        .reference-image__placeholder {
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 12px;
        }
      }
    }
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    border-top: 1px solid rgba(0, 0, 0, 0.08);

    .dialog-actions__controls {
      width: 100%;
      display: flex;
      gap: 12px;
    }

    .q-btn {
      font-weight: 600;
    }
  }
}

.body--dark {
  .booking-details-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .dialog-content {
      .title-section {
        .booking-title {
          color: #fff;
        }
      }

      .references-gallery {
        &__list {
          .reference-image,
          .reference-image__placeholder {
            background: rgba(255, 255, 255, 0.08);
          }
        }
      }
    }

    .reject-note {
      background: rgba(193, 0, 21, 0.05);

      &__label {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .dialog-actions {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
