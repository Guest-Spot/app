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
        <!-- Artist Info -->
        <div v-if="artist" class="artist-section flex column q-gap-sm q-mb-md">
          <div class="artist-header flex items-center justify-between">
            <div class="section-label text-grey-6">Artist</div>
            <div class="status-badge text-caption text-bold" :class="booking.reaction">
              {{ getStatusLabel(booking.reaction) }}
            </div>
          </div>
          <ArtistCard :artist="artist" @click="viewArtistProfile" />
        </div>

        <div class="flex column q-gap-sm">
          <div class="section-label text-grey-6">Details</div>

          <div class="flex column q-gap-md">
            <InfoCard title="Session Details" icon="event" :data="sessionDetailsData" />

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
              @click="approveBooking"
            />
          </div>
        </template>
        <q-btn
          v-else
          label="Close"
          rounded
          unelevated
          class="full-width bg-block"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { IBooking } from 'src/interfaces/booking';
import type { IUser } from 'src/interfaces/user';
import { ArtistCard } from 'src/components/SearchPage';
import { InfoCard } from 'src/components';
import useDate from 'src/modules/useDate';
import { useUserStore } from 'src/stores/user';
import { EReactions } from 'src/interfaces/enums';

interface Props {
  modelValue: boolean;
  booking: IBooking | null;
}

interface BookingReactionUpdatePayload {
  documentId: string;
  reaction: EReactions;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'update:booking-reaction', value: BookingReactionUpdatePayload): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime } = useDate();
const $q = useQuasar();
const userStore = useUserStore();

const isVisible = ref(props.modelValue);

// Convert partial artist to full artist for ArtistCard
const artist = computed<IUser | null>(() => {
  if (!props.booking?.artist) return null;
  return props.booking.artist as IUser;
});

// Session details data for InfoCard
const sessionDetailsData = computed(() => {
  if (!props.booking) return [];

  const data = [
    {
      label: 'Date',
      value: formatDate(props.booking.day || ''),
    },
    {
      label: 'Time',
      value: formatTime(props.booking.start || ''),
    },
  ];

  if (props.booking.location) {
    data.push({
      label: 'Location',
      value: props.booking.location,
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
  ].filter(Boolean);
});

const canRespondToBooking = computed(() => {
  const currentUserId = userStore.getUser?.documentId;
  const artistDocumentId = props.booking?.artist?.documentId;
  const isPending = props.booking?.reaction === EReactions.Pending;

  return Boolean(currentUserId && artistDocumentId && currentUserId === artistDocumentId && isPending);
});

const getStatusLabel = (reaction: IBooking['reaction']): string => {
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
  };
  return labels[reaction] || reaction;
};

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
};

const confirmReactionChange = (reaction: EReactions) => {
  if (!props.booking) return;

  const dialogCopy =
    reaction === EReactions.Accepted
      ? {
          title: 'Approve Booking',
          message: 'Are you sure you want to approve this booking request?',
          okLabel: 'Yes, Approve',
          okColor: 'positive',
        }
      : {
          title: 'Reject Booking',
          message: 'Are you sure you want to reject this booking request?',
          okLabel: 'Yes, Reject',
          okColor: 'negative',
        };

  $q.dialog({
    title: dialogCopy.title,
    message: dialogCopy.message,
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'Cancel',
    },
    ok: {
      color: dialogCopy.okColor,
      rounded: true,
      label: dialogCopy.okLabel,
    },
  }).onOk(() => {
    if (props.booking?.documentId) {
      emit('update:booking-reaction', {
        documentId: props.booking.documentId,
        reaction,
      });
    }
  });
};

const approveBooking = () => {
  confirmReactionChange(EReactions.Accepted);
};

const rejectBooking = () => {
  confirmReactionChange(EReactions.Rejected);
};

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
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

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;

      &.pending {
        background: rgba(242, 192, 55, 0.15);
        color: #f2c037;
      }

      &.accepted {
        background: rgba(33, 186, 69, 0.15);
        color: #21ba45;
      }

      &.rejected,
      &.cancelled {
        background: rgba(193, 0, 21, 0.15);
        color: #c10015;
      }

      &.completed {
        background: rgba(49, 204, 236, 0.15);
        color: #31ccec;
      }
    }

    .section-label {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.5px;
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
    }

    .dialog-actions {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
