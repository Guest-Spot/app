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
        <div class="title-section q-mb-md">
          <h3 class="booking-title">{{ booking.title }}</h3>
          <div
            class="status-badge text-caption text-bold"
            :class="booking.status"
          >
            {{ getStatusLabel(booking.status) }}
          </div>
        </div>

        <!-- Artist Info -->
        <div v-if="artist" class="artist-section q-mb-md">
          <div class="section-label text-caption text-grey-6 q-mb-sm">ARTIST</div>
          <ArtistCard
            :artist="artist"
            @click="viewArtistProfile"
          />
        </div>

        <q-separator class="q-my-md" />

        <!-- Session Details -->
        <div class="details-section q-mb-md">
          <div class="section-label text-caption text-grey-6 q-mb-sm">SESSION DETAILS</div>
          <div class="details-list">
            <div class="detail-item">
              <q-icon name="event" size="20px" class="text-grey-6" />
              <span class="text-weight-medium">{{ formatDate(booking.date) }}</span>
            </div>
            <div class="detail-item">
              <q-icon name="schedule" size="20px" class="text-grey-6" />
              <span>{{ formatTimeRange(booking.startTime, booking.endTime) }}</span>
            </div>
            <div v-if="booking.location" class="detail-item">
              <q-icon name="location_on" size="20px" class="text-grey-6" />
              <span>{{ booking.location }}</span>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Tattoo Description -->
        <div v-if="booking.description" class="description-section">
          <div class="section-label text-caption text-grey-6 q-mb-sm">TATTOO DESCRIPTION</div>
          <p class="description-text">{{ booking.description }}</p>
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

    .artist-section {
      .section-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }
    }

    .details-section {
      .section-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .details-list {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .detail-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 0;
        }
      }
    }

    .description-section {
      .section-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5px;
      }

      .description-text {
        font-size: 15px;
        line-height: 1.6;
        margin: 0;
        color: var(--q-dark);
      }
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

      .description-section {
        .description-text {
          color: rgba(255, 255, 255, 0.9);
        }
      }
    }

    .dialog-actions {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
  }
}
</style>

