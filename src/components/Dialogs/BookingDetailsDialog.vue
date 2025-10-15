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
        <!-- Title -->
        <div class="title-section flex no-wrap items-start justify-between q-gap-sm q-mb-md">
          <h3 class="booking-title">{{ booking.title }}</h3>
          <div
            class="status-badge text-caption text-bold"
            :class="booking.status"
          >
            {{ getStatusLabel(booking.status) }}
          </div>
        </div>

        <!-- Artist Info -->
        <div v-if="artist" class="artist-section flex column q-gap-sm q-mb-md">
          <div class="section-label text-grey-6 q-mb-sm">Artist</div>
          <ArtistCard
            :artist="artist"
            @click="viewArtistProfile"
          />
        </div>

        <div class="flex column q-gap-sm">
          <div class="section-label text-grey-6 q-mb-sm">Session Details</div>

          <!-- Session Details -->
          <InfoCard
            title="Session Details"
            icon="event"
            :data="sessionDetailsData"
            class="q-mb-sm"
          />

          <!-- Tattoo Description -->
          <InfoCard
            v-if="booking.description"
            title="Tattoo Description"
            icon="description"
            :data="descriptionData"
          />
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
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
import type { IBooking } from 'src/interfaces/booking';
import type { IUser } from 'src/interfaces/user';
import { ArtistCard } from 'src/components/SearchPage';
import { InfoCard } from 'src/components';
import useDate from 'src/modules/useDate';

interface Props {
  modelValue: boolean;
  booking: IBooking | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime } = useDate();

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
      value: formatDate(props.booking.date),
    },
    {
      label: 'Time',
      value: formatTimeRange(props.booking.startTime, props.booking.endTime),
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
  if (!props.booking?.description) return [];

  return [
    {
      label: 'Details',
      value: props.booking.description,
    },
  ];
});

const getStatusLabel = (status: IBooking['status']): string => {
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    completed: 'Completed',
  };
  return labels[status] || status;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatTimeRange = (startTime: string, endTime: string): string => {
  const start = startTime || '00:00:00';
  const end = endTime || '00:00:00';
  return `${formatTime(start)} – ${formatTime(end)}`;
};

const viewArtistProfile = () => {
  // Artist card handles navigation internally
};

const closeDialog = () => {
  isVisible.value = false;
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

