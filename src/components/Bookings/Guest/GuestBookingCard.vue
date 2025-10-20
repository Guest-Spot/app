<template>
  <div
    class="booking-card bg-block q-pa-md border-radius-md cursor-pointer"
    :class="{ pending: booking.reaction === EReactions.Pending }"
    @click="handleClick"
  >
    <div class="card-header">
      <div class="user-info">
        <q-avatar size="40px" class="q-mr-sm bg-block">
          <q-img
            :src="booking.artist?.avatar?.url"
            spinner-color="dark"
            spinner-size="16px"
            :ratio="0.85"
            v-if="booking.artist?.avatar?.url"
          />
          <q-icon name="person" size="22px" color="grey-6" v-else />
        </q-avatar>
        <div class="flex column">
          <div class="user-role text-grey-6 text-caption">Artist</div>
          <div class="user-name">{{ booking.artist.name }}</div>
        </div>
      </div>
      <div class="status-badge absolute-top-right q-mr-md q-mt-md" :class="booking.reaction">
        {{ getStatusLabel(booking.reaction) }}
      </div>
    </div>

    <div class="card-content">
      <!-- Location -->
      <div v-if="booking.location" class="location-info q-mb-xs text-grey-6">
        <q-icon name="location_on" size="16px" />
        <span>{{ booking.location }}</span>
      </div>

      <!-- Date -->
      <div class="date-info q-mb-xs text-grey-6">
        <q-icon name="event" size="16px" />
        <span>{{ formattedDate }}</span>
      </div>

      <!-- Time -->
      <div class="time-info text-grey-6">
        <q-icon name="schedule" size="16px" />
        <span>{{ formattedTime }}</span>
      </div>

      <!-- Reference Images Count -->
      <div
        v-if="booking.references && booking.references.length > 0"
        class="references-count q-mt-sm"
      >
        <q-chip size="sm" icon="image" color="primary" text-color="white" dense class="q-pa-sm">
          {{ booking.references.length }} reference{{ booking.references.length > 1 ? 's' : '' }}
        </q-chip>
      </div>

      <!-- Reject Note -->
      <div
        v-if="booking.reaction === EReactions.Rejected && booking.rejectNote"
        class="reject-note q-mt-md"
      >
        <div class="reject-note__label text-caption text-grey-6">Reason for rejection</div>
        <div class="reject-note__text">{{ booking.rejectNote }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IBooking } from 'src/interfaces/booking';
import { EReactions } from 'src/interfaces/enums';
import useDate from 'src/modules/useDate';

interface Props {
  booking: IBooking;
}

interface Emits {
  (e: 'click', booking: IBooking): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatTime } = useDate();

const formattedDate = computed(() => {
  const date = new Date(props.booking.day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
});

const formattedTime = computed(() => {
  return formatTime(props.booking.start);
});

const getStatusLabel = (status: IBooking['reaction']) => {
  const statusMap = {
    [EReactions.Pending]: 'Pending',
    [EReactions.Accepted]: 'Accepted',
    [EReactions.Rejected]: 'Rejected',
  };
  return statusMap[status as keyof typeof statusMap];
};

const handleClick = () => {
  emit('click', props.booking);
};
</script>

<style scoped lang="scss">
.booking-card {
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;

    .user-info {
      display: flex;
      align-items: center;

      .user-name {
        font-weight: 600;
        font-size: 16px;
      }

      .booking-date {
        font-size: 14px;
        margin-top: 2px;
      }
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 600;

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
        color: var(--q-negative);
      }

      &.completed {
        background: rgba(49, 204, 236, 0.15);
        color: #31ccec;
      }
    }
  }

  .card-content {
    .booking-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .tattoo-details {
      line-height: 1.5;
      font-size: 14px;
    }

    .date-info,
    .time-info,
    .location-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .references-count {
      :deep(.q-chip) {
        font-size: 12px;
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
  }
}

.body--dark {
  .booking-card {
    &:hover {
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
    }

    .card-content {
      .reject-note {
        background: rgba(193, 0, 21, 0.05);

        &__label {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}
</style>
