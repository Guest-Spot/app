<template>
  <div class="booking-calendar">
    <BookingCalendarHeader
      :current-month-label="currentMonthYear"
      :can-go-prev="canGoPrev"
      :can-go-next="canGoNext"
      @previous="previousMonth"
      @next="nextMonth"
      @today="goToToday"
    />

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container flex column items-center q-gap-md">
      <q-spinner color="primary" size="32px" />
      <span class="text-grey-6 text-weight-medium">Loading bookings...</span>
    </div>

    <!-- Calendar Events List -->
    <div v-else-if="groupedBookings.length > 0" class="calendar-events">
      <div
        v-for="(group, index) in groupedBookings"
        :key="`week-${index}`"
        class="week-group"
      >
        <!-- Week Separator -->
        <div v-if="group.weekLabel" class="week-separator text-grey-6 text-weight-medium q-mb-md">
          {{ group.weekLabel }}
        </div>

        <!-- Days in Week -->
        <div v-for="day in group.days" :key="day.date" class="day-group flex no-wrap q-gap-md items-start q-mb-md">
          <div class="day-header flex items-center q-gap-md q-mb-sm">
            <div class="day-label bg-block border-radius-md q-py-sm">
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
          <div class="events-list flex column q-gap-sm">
            <div
              v-for="booking in day.bookings"
              :key="booking.documentId"
              class="event-card border-radius-md q-pa-md"
              :class="getEventClass(booking)"
              @click="openBookingDetails(booking)"
            >
              <div class="flex items-start justify-between q-gap-sm">
                <div class="flex items-start q-gap-sm no-wrap flex-1">
                  <!-- Avatar (if artist available) -->
                  <q-avatar v-if="booking.artist?.avatar?.url" size="40px" class="event-avatar bg-block">
                    <q-img
                      :src="booking.artist.avatar.url"
                      fit="cover"
                      spinner-color="white"
                      spinner-size="16px"
                      ratio="0.85"
                    />
                  </q-avatar>
                  <q-avatar
                    v-else
                    size="40px"
                    class="event-avatar bg-block"
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
                        <span class="text-grey-6">{{ formatTime(booking.start || '') }}</span>
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
      @update:booking-reaction="handleBookingReactionUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMutation } from '@vue/apollo-composable';
import type { IBooking } from 'src/interfaces/booking';
import { NoResult } from 'src/components';
import { BookingDetailsDialog } from 'src/components/Dialogs';
import useDate from 'src/modules/useDate';
import { EReactions } from 'src/interfaces/enums';
import { UPDATE_BOOKING_MUTATION } from 'src/apollo/types/mutations/booking';
import useNotify from 'src/modules/useNotify';
import BookingCalendarHeader from './BookingCalendarHeader.vue';

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

interface BookingReactionUpdatePayload {
  documentId: string;
  reaction: EReactions;
  rejectNote?: string | undefined;
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
const { showError } = useNotify();
const { mutate: updateBookingMutation } = useMutation(UPDATE_BOOKING_MUTATION);

// State
const currentDate = ref(new Date());
const showDetailsDialog = ref(false);
const selectedBooking = ref<IBooking | null>(null);
const hasInitializedDate = ref(false);
const internalBookings = ref<IBooking[]>([]);

const getMonthStartDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

watch(
  () => props.bookings,
  (newBookings) => {
    internalBookings.value = (newBookings ?? []).map((booking) => ({ ...booking }));

    if (selectedBooking.value) {
      const updatedSelected = internalBookings.value.find(
        (booking) => booking.documentId === selectedBooking.value?.documentId,
      );

      if (updatedSelected) {
        selectedBooking.value = { ...updatedSelected };
      }
    }
  },
  { immediate: true, deep: true },
);

const shopBookings = computed<IBooking[]>(() => {
  return internalBookings.value;
});

watch(
  shopBookings,
  () => {
    if (!hasInitializedDate.value) {
      currentDate.value = new Date();
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

const availableMonths = computed<Date[]>(() => {
  const monthMap = new Map<string, Date>();

  shopBookings.value.forEach((booking) => {
    if (!booking.day) return;

    const bookingDate = new Date(booking.day);
    if (Number.isNaN(bookingDate.getTime())) return;

    const monthStart = getMonthStartDate(bookingDate);
    const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, monthStart);
    }
  });

  return Array.from(monthMap.values()).sort((a, b) => a.getTime() - b.getTime());
});

const previousAvailableMonth = computed<Date | null>(() => {
  if (!availableMonths.value.length) return null;

  const currentMonthStart = getMonthStartDate(currentDate.value);
  const currentIndex = availableMonths.value.findIndex(
    (month) =>
      month.getFullYear() === currentMonthStart.getFullYear() &&
      month.getMonth() === currentMonthStart.getMonth(),
  );

  if (currentIndex > 0) {
    return availableMonths.value[currentIndex - 1];
  }

  if (currentIndex === -1) {
    const candidates = availableMonths.value.filter(
      (month) => month.getTime() < currentMonthStart.getTime(),
    );

    if (candidates.length) {
      return candidates[candidates.length - 1];
    }
  }

  return null;
});

const nextAvailableMonth = computed<Date | null>(() => {
  if (!availableMonths.value.length) return null;

  const currentMonthStart = getMonthStartDate(currentDate.value);
  const currentIndex = availableMonths.value.findIndex(
    (month) =>
      month.getFullYear() === currentMonthStart.getFullYear() &&
      month.getMonth() === currentMonthStart.getMonth(),
  );

  if (currentIndex >= 0 && currentIndex < availableMonths.value.length - 1) {
    return availableMonths.value[currentIndex + 1];
  }

  if (currentIndex === -1) {
    const candidate = availableMonths.value.find(
      (month) => month.getTime() > currentMonthStart.getTime(),
    );

    if (candidate) {
      return candidate;
    }
  }

  return null;
});

const canGoPrev = computed<boolean>(() => Boolean(previousAvailableMonth.value));
const canGoNext = computed<boolean>(() => Boolean(nextAvailableMonth.value));

watch(availableMonths, (months) => {
  if (!months.length) {
    currentDate.value = new Date();
    hasInitializedDate.value = false;
  }
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
    const dateDifference = new Date(a.day || '').getTime() - new Date(b.day || '').getTime();

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

const updateLocalBookingReaction = (documentId: string, reaction: EReactions) => {
  const bookingIndex = internalBookings.value.findIndex(
    (booking) => booking.documentId === documentId,
  );

  if (bookingIndex === -1) {
    return;
  }

  const updatedBooking = {
    ...internalBookings.value[bookingIndex],
    reaction,
  };

  internalBookings.value.splice(bookingIndex, 1, updatedBooking);

  if (selectedBooking.value?.documentId === documentId) {
    selectedBooking.value = {
      ...selectedBooking.value,
      reaction,
    };
  }
};

const handleBookingReactionUpdate = async ({
  documentId,
  reaction,
  rejectNote,
}: BookingReactionUpdatePayload) => {
  const existingBooking = internalBookings.value.find(
    (booking) => booking.documentId === documentId,
  );

  if (!existingBooking) {
    return;
  }

  const previousReaction = existingBooking.reaction;

  updateLocalBookingReaction(documentId, reaction);

  try {
    await updateBookingMutation({
      documentId,
      data: {
        reaction,
        rejectNote,
      },
    });
  } catch {
    updateLocalBookingReaction(documentId, previousReaction);
    showError('Failed to update booking. Please try again.');
  }
};

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
      classes.push('event-positive');
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
  const targetMonth = previousAvailableMonth.value;

  if (!targetMonth) {
    return;
  }

  currentDate.value = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
};

const nextMonth = () => {
  const targetMonth = nextAvailableMonth.value;

  if (!targetMonth) {
    return;
  }

  currentDate.value = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
};

const goToToday = () => {
  const today = new Date();
  const todayMonthStart = getMonthStartDate(today);

  const matchingMonth = availableMonths.value.find(
    (month) =>
      month.getFullYear() === todayMonthStart.getFullYear() &&
      month.getMonth() === todayMonthStart.getMonth(),
  );

  if (matchingMonth) {
    currentDate.value = new Date(matchingMonth.getFullYear(), matchingMonth.getMonth(), 1);
    return;
  }

  currentDate.value = today;
};
</script>

<style scoped lang="scss">
.booking-calendar {
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
          width: 100%;

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
