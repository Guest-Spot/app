<template>
  <div class="booking-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header bg-block border-radius-lg q-px-md q-py-sm q-mb-md">
      <div class="flex items-center no-wrap justify-between q-gap-md full-width">
        <div class="flex items-center no-wrap q-gap-md">
          <q-btn
            icon="chevron_left"
            flat
            round
            dense
            @click="previousMonth"
          />
          <div class="header-title text-h6 text-bold">
            {{ currentMonthYear }}
          </div>
          <q-btn
            icon="chevron_right"
            flat
            round
            dense
            @click="nextMonth"
          />
        </div>
        <q-btn
          icon="today"
          flat
          round
          dense
          @click="goToToday"
        >
          <q-tooltip>Go to today</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <q-spinner color="primary" size="50px" />
    </div>

    <!-- Calendar Events List -->
    <div v-else-if="groupedBookings.length > 0" class="calendar-events">
      <div
        v-for="(group, index) in groupedBookings"
        :key="group.weekLabel"
        class="week-group"
        :class="{ 'q-mb-xl': (groupedBookings.length - 1) !== index }"
      >
        <!-- Week Separator -->
        <div v-if="group.weekLabel" class="week-separator text-grey-6 text-weight-medium q-mb-md">
          {{ group.weekLabel }}
        </div>

        <!-- Days in Week -->
        <div
          v-for="day in group.days"
          :key="day.date"
          class="day-group q-mb-md"
        >
          <div class="day-header flex items-center q-gap-md q-mb-sm">
            <div class="day-label">
              <div class="day-name text-grey-6 text-uppercase text-weight-medium">
                {{ day.dayName }}
              </div>
              <div
                class="day-number text-h5 text-bold"
                :class="{ 'text-primary': isToday(day.date) }"
              >
                {{ day.dayNumber }}
              </div>
            </div>
          </div>

          <!-- Events for this day -->
          <div class="events-list">
            <div
              v-for="booking in day.bookings"
              :key="booking.documentId"
              class="event-card border-radius-md q-pa-md q-mb-sm"
              :class="getEventClass(booking)"
              @click="openBookingDetails(booking)"
            >
            <div class="flex items-start justify-between q-gap-sm">
                <div class="flex items-start q-gap-sm no-wrap flex-1">
                  <!-- Avatar (if artist available) -->
                  <q-avatar
                    v-if="booking.artist?.avatar?.url"
                    size="40px"
                    class="event-avatar"
                  >
                    <q-img
                      :src="booking.artist.avatar.url"
                      fit="cover"
                      spinner-color="white"
                      spinner-size="16px"
                    />
                  </q-avatar>
                  <q-avatar
                    v-else
                    size="40px"
                    class="event-avatar"
                    color="grey-4"
                    text-color="grey-7"
                  >
                    <q-icon name="person" size="24px" />
                  </q-avatar>

                  <!-- Event Info -->
                  <div class="event-info flex-1">
                    <div class="event-meta">
                      <div class="flex items-center q-gap-xs q-mb-xs">
                        <q-icon name="person" size="14px" />
                        <span class="text-bold">{{ booking.artist?.name || 'Artist' }}</span>
                      </div>
                      <div class="flex items-center q-gap-xs">
                        <q-icon name="schedule" size="14px" color="grey-6" />
                        <span class="text-grey-6">{{ formatTime(booking.start) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <NoResult
      v-else
      icon="event_busy"
      title="No bookings scheduled"
      description="When you have bookings scheduled, they will appear here in calendar view"
      no-btn
    />

    <!-- Booking Details Dialog -->
    <BookingDetailsDialog
      v-model="showDetailsDialog"
      :booking="selectedBooking"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { IBooking } from 'src/interfaces/booking';
import { NoResult } from 'src/components';
import { BookingDetailsDialog } from 'src/components/Dialogs';
import useDate from 'src/modules/useDate';
import { EReactions } from 'src/interfaces/enums';

interface DayGroup {
  date: string;
  dayName: string;
  dayNumber: number;
  bookings: IBooking[];
}

interface WeekGroup {
  weekLabel: string;
  days: DayGroup[];
}

interface Props {
  bookings: IBooking[];
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  bookings: () => [],
  loading: false,
});

const { formatTime } = useDate();

// State
const currentDate = ref(new Date());
const showDetailsDialog = ref(false);
const selectedBooking = ref<IBooking | null>(null);
const hasInitializedDate = ref(false);

const shopBookings = computed<IBooking[]>(() => {
  return props.bookings ?? [];
});

watch(
  shopBookings,
  (newBookings) => {
    if (hasInitializedDate.value || !newBookings.length) return;

    const bookingsWithDate = [...newBookings].filter(
      (booking): booking is IBooking & { day: string } => Boolean(booking.day),
    );

    if (!bookingsWithDate.length) return;

    const firstBooking = bookingsWithDate
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())[0];

    if (!firstBooking) return;

    const targetDate = new Date(firstBooking.day);

    if (!Number.isNaN(targetDate.getTime())) {
      currentDate.value = targetDate;
      hasInitializedDate.value = true;
    }
  },
  { immediate: true },
);

const bookingsForCurrentMonth = computed<IBooking[]>(() => {
  const month = currentDate.value.getMonth();
  const year = currentDate.value.getFullYear();

  return shopBookings.value.filter((booking) => {
    if (!booking.day) return false;

    const bookingDate = new Date(booking.day);
    if (Number.isNaN(bookingDate.getTime())) return false;

    return bookingDate.getMonth() === month && bookingDate.getFullYear() === year;
  });
});

// Computed
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
});

const groupedBookings = computed<WeekGroup[]>(() => {
  if (!bookingsForCurrentMonth.value.length) return [];

  // Sort bookings by date
  const sortedBookings = [...bookingsForCurrentMonth.value].sort((a, b) => {
    const dateDifference = new Date(a.day).getTime() - new Date(b.day).getTime();

    if (dateDifference !== 0) {
      return dateDifference;
    }

    return (a.start || '').localeCompare(b.start || '');
  });

  // Group by date
  const bookingsByDate = new Map<string, IBooking[]>();
  sortedBookings.forEach((booking) => {
    if (!booking.day) return;

    const dateKey = booking.day.split('T')[0] || booking.day; // Get YYYY-MM-DD
    if (!bookingsByDate.has(dateKey)) {
      bookingsByDate.set(dateKey, []);
    }
    bookingsByDate.get(dateKey)!.push(booking);
  });

  // Group by weeks
  const weeks: WeekGroup[] = [];
  let currentWeek: DayGroup[] = [];
  let currentWeekStart: Date | null = null;

  Array.from(bookingsByDate.entries()).forEach(([dateStr, bookings]) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return;

    const weekStart = getWeekStart(date);

    // If new week, save previous week and start new one
    if (currentWeekStart && weekStart.getTime() !== currentWeekStart.getTime()) {
      if (currentWeek.length > 0) {
        weeks.push({
          weekLabel: getWeekLabel(currentWeekStart),
          days: currentWeek,
        });
        currentWeek = [];
      }
    }

    currentWeekStart = weekStart;

    // Add day to current week
    currentWeek.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      dayNumber: date.getDate(),
      bookings: bookings,
    });
  });

  // Add last week
  if (currentWeek.length > 0 && currentWeekStart) {
    weeks.push({
      weekLabel: getWeekLabel(currentWeekStart),
      days: currentWeek,
    });
  }

  return weeks;
});

const isLoading = computed(() => props.loading);

// Methods
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day; // adjust when day is sunday
  d.setDate(diff);
  return d;
};

const getWeekLabel = (weekStart: Date): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const monthStart = weekStart.toLocaleDateString('en-US', { month: 'long' });
  const monthEnd = weekEnd.toLocaleDateString('en-US', { month: 'long' });
  const dayStart = weekStart.getDate();
  const dayEnd = weekEnd.getDate();

  if (monthStart === monthEnd) {
    return `${monthStart} ${dayStart} – ${dayEnd}`.toUpperCase();
  } else {
    return `${monthStart} ${dayStart} – ${monthEnd} ${dayEnd}`.toUpperCase();
  }
};

const isToday = (dateStr: string): boolean => {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const getEventClass = (booking: IBooking): string => {
  const classes = [];

  // Color based on status
  switch (booking.reaction) {
    case EReactions.Accepted:
      classes.push('event-primary');
      break;
    case EReactions.Pending:
      classes.push('event-warning');
      break;
    case EReactions.Rejected:
      classes.push('event-negative');
      break;
  }

  return classes.join(' ');
};

const openBookingDetails = (booking: IBooking) => {
  selectedBooking.value = booking;
  showDetailsDialog.value = true;
};

const previousMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() - 1);
  currentDate.value = newDate;
};

const nextMonth = () => {
  const newDate = new Date(currentDate.value);
  newDate.setMonth(newDate.getMonth() + 1);
  currentDate.value = newDate;
};

const goToToday = () => {
  currentDate.value = new Date();
};
</script>

<style scoped lang="scss">
.booking-calendar {
  .calendar-header {
    position: sticky;
    top: 24px;
    z-index: 1;

    .header-title {
      min-width: 140px;
      text-align: center;
    }
  }

  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .calendar-events {
    .week-group {
      .week-separator {
        font-size: 12px;
        letter-spacing: 0.5px;
        padding: 8px 0;
      }

      .day-group {
        .day-header {
          .day-label {
            min-width: 48px;
            text-align: center;

            .day-name {
              font-size: 11px;
              letter-spacing: 0.5px;
            }

            .day-number {
              line-height: 1;
              margin-top: 4px;
            }
          }
        }

        .events-list {
          margin-left: 64px;

          .event-card {
            position: relative;
            transition: all 0.2s ease;
            border-left: 4px solid transparent;

            &.event-primary {
              background: rgba(49, 204, 236, 0.08);
              border-left-color: #31ccec;
            }

            &.event-warning {
              background: rgba(242, 192, 55, 0.08);
              border-left-color: #f2c037;
            }

            &.event-negative {
              background: rgba(193, 0, 21, 0.08);
              border-left-color: #c10015;
            }

            &.event-positive {
              background: rgba(33, 186, 69, 0.08);
              border-left-color: #21ba45;
            }

            .event-avatar {
              flex-shrink: 0;
            }

            .event-info {
              .event-title {
                font-size: 15px;
                line-height: 1.3;
              }

              .event-meta {
                line-height: 1.4;
              }
            }

            .event-actions {
              flex-shrink: 0;

              .status-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                border-radius: 50%;

                &.pending {
                  background: rgba(242, 192, 55, 0.2);
                  color: #f2c037;
                }

                &.rejected,
                &.cancelled {
                  background: rgba(193, 0, 21, 0.2);
                  color: #c10015;
                }

                &.completed {
                  background: rgba(33, 186, 69, 0.2);
                  color: #21ba45;
                }
              }

              .details-btn {
                min-width: 70px;
              }
            }
          }
        }
      }
    }
  }

}

.body--dark {
  .booking-calendar {
    .calendar-events {
      .event-card {
        &.event-primary {
          background: rgba(49, 204, 236, 0.1);
        }

        &.event-warning {
          background: rgba(242, 192, 55, 0.1);
        }

        &.event-negative {
          background: rgba(193, 0, 21, 0.1);
        }

        &.event-positive {
          background: rgba(33, 186, 69, 0.1);
        }
      }
    }
  }
}
</style>
