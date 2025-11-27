<template>
  <q-page class="page flex column items-start create-booking-page">
    <!-- Search/Filter/Sort dialogs -->
    <SearchDialog v-model="showSearchDialog" v-model:query="searchQuery" no-route-replace />
    <FilterDialog
      v-model="showFilterDialog"
      v-model:filterValue="activeFilters"
      no-route-replace
      no-styles
      unelevated
    />
    <SortDialog v-model="showSortDialog" v-model:sortValue="sortSettings" no-route-replace />

    <div class="page-card">
      <div class="dialog-header">
        <div class="header-left flex items-center q-gap-sm">
          <div class="text-subtitle1 text-bold">Create Booking Request</div>
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

      <div class="dialog-content">
        <div class="custom-stepper">
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

          <ArtistStep
            v-if="isArtistSelectionRequired && currentStep === 1"
            :artists="localArtists"
            :selected-artist-id="selectedArtistId"
            :search-query="searchQuery"
            :artist-list-title="artistListTitle"
            :has-active-filters="hasActiveFilters"
            :has-active-sort="hasActiveSort"
            :is-loading="isLoadingArtists"
            :has-more-artists="hasMoreArtists"
            @update:search-query="updateSearchQuery"
            @open-search="showSearchDialog = true"
            @open-filter="showFilterDialog = true"
            @open-sort="showSortDialog = true"
            @load-more="loadMoreArtists"
            @select="selectArtist"
          />

          <DetailsStep
            v-else-if="currentStep === 2"
            ref="detailsStepRef"
            v-model:name="bookingDetails.name"
            v-model:email="bookingDetails.email"
            v-model:phone="bookingDetails.phone"
            v-model:description="bookingDetails.description"
            v-model:placement="bookingDetails.placement"
            v-model:size="bookingDetails.size"
            :reference-files="referenceFiles"
            :rules="rules"
            @update:reference-files="updateReferenceFiles"
          />

          <ScheduleStep
            v-else-if="currentStep === 3"
            ref="scheduleStepRef"
            v-model:day="schedule.day"
            v-model:start-time="schedule.startTime"
            :opening-hours="shopOpeningHours"
            :disabled-days="artistUnavailableDays"
            :rules="rules"
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
    <div class="dialog-actions bg-block full-width">
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
          :disable="isArtistSelectionRequired && currentStep === 1 && !selectedArtistId"
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
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import { SearchDialog, FilterDialog, SortDialog } from 'src/components/Dialogs';
import {
  ArtistStep,
  DetailsStep,
  ScheduleStep,
  PaymentStep,
} from 'src/components/Dialogs/CreateBookingSteps';

import { USERS_QUERY, USER_QUERY } from 'src/apollo/types/user';
import { CITIES_QUERY } from 'src/apollo/types/city';
import { CREATE_BOOKING_MUTATION } from 'src/apollo/types/mutations/booking';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';

import type { IUser, IGraphQLUsersResult, IGraphQLUserResult } from 'src/interfaces/user';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';
import type { IFilters } from 'src/interfaces/filters';
import type {
  IBooking,
  IBookingRequestPayload,
  IBookingCreateResponse,
  IBookingsQueryResponse,
} from 'src/interfaces/booking';
import type { IOpeningHours } from 'src/interfaces/common';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { UserType, EReactions } from 'src/interfaces/enums';
import useHelpers from 'src/modules/useHelpers';
import useNotify from 'src/modules/useNotify';
import { useCitiesStore } from 'src/stores/cities';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import useDate from 'src/modules/useDate';
import useUser from 'src/modules/useUser';
import useBookingPayment from 'src/composables/useBookingPayment';
import { centsToDollars } from 'src/helpers/currency';
import { useSettingsStore } from 'src/stores/settings';
import useStripe from 'src/composables/useStripe';

const route = useRoute();
const router = useRouter();

const { convertFiltersToGraphQLFilters } = useHelpers();
const { showError, showSuccess } = useNotify();
const citiesStore = useCitiesStore();
const { formatToFullTime } = useDate();
const { user } = useUser();
const {
  initiatePayment: initiateBookingPayment,
  isProcessing: isPaymentProcessing,
} = useBookingPayment();
const settingsStore = useSettingsStore();
const { addBrowserFinishedListener, removeAllBrowserListeners } = useStripe();

const routeShopDocumentId = computed(() => (route.query.shopId as string | undefined) ?? null);
const routeArtistDocumentId = computed(() => (route.query.artistId as string | undefined) ?? null);

const baseSteps = [
  { id: 1, title: 'Artist', icon: 'person' },
  { id: 2, title: 'Details', icon: 'assignment' },
  { id: 3, title: 'Schedule', icon: 'event' },
  { id: 4, title: 'Payment', icon: 'payment' },
] as const;

const shopOpeningHours = ref<IOpeningHours[]>([]);

const isArtistSelectionRequired = computed(() => !routeArtistDocumentId.value);

const selectedArtist = ref<IUser | null>(null);
const createdBooking = ref<IBookingCreateResponse | null>(null);

const isSelectedArtistVerified = computed(() => selectedArtist.value?.verified === true);

const shouldShowPaymentStep = computed(() => {
  if (settingsStore.getStripeEnabled !== true || !isSelectedArtistVerified.value) {
    return false;
  }
  return selectedArtist.value?.payoutsEnabled === true;
});
const selectedArtistDepositAmount = computed(() => centsToDollars(selectedArtist.value?.depositAmount ?? 0));

const depositAmountDisplay = computed<number | null>(() => {
  const amount = selectedArtistDepositAmount.value;
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

const visibleSteps = computed(() => {
  let steps: typeof baseSteps[number][] = isArtistSelectionRequired.value ? [...baseSteps] : baseSteps.filter((step) => step.id !== 1);
  if (!shouldShowPaymentStep.value) {
    steps = steps.filter((step) => step.id !== 4);
  }
  return steps;
});

const firstVisibleStepId = computed(() => visibleSteps.value[0]?.id ?? baseSteps[0].id);

const currentStep = ref(firstVisibleStepId.value);
const isSubmitting = ref(false);
const isResetting = ref(false);
const stepperHeaderRef = ref<HTMLDivElement | null>(null);

const isAtFirstStep = computed(() => currentStep.value === firstVisibleStepId.value);
const lastVisibleStepId = computed<number>(() => {
  const steps = visibleSteps.value;
  if (steps.length > 0) {
    return steps[steps.length - 1]!.id;
  }
  return baseSteps[baseSteps.length - 1]!.id;
});
const isAtLastStep = computed(() => currentStep.value === lastVisibleStepId.value);

const detailsStepRef = ref<InstanceType<typeof DetailsStep> | null>(null);
const scheduleStepRef = ref<InstanceType<typeof ScheduleStep> | null>(null);

watch(firstVisibleStepId, (stepId) => {
  if (!visibleSteps.value.some((step) => step.id === currentStep.value)) {
    currentStep.value = stepId;
  }
});

const bookingDetails = reactive({
  name: '',
  email: '',
  phone: '',
  description: '',
  placement: '',
  size: '',
});

const schedule = reactive({
  day: '',
  startTime: '',
});

const isScheduleComplete = computed(() => Boolean(schedule.day) && Boolean(schedule.startTime));
const isSubmitDisabled = computed(() => isSubmitting.value || !isScheduleComplete.value);

const artistBookings = ref<IBooking[]>([]);

const referenceFiles = ref<File[]>([]);

const normalizeBookingDay = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const sanitized = (value.split('T')[0] || value).replace(/\//g, '-').trim();
  const parts = sanitized.split('-');
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number.parseInt(yearStr || '0', 10);
  const month = Number.parseInt(monthStr || '0', 10);
  const day = Number.parseInt(dayStr || '0', 10);
  if ([year, month, day].some((part) => Number.isNaN(part))) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  const normalizedMonth = String(date.getMonth() + 1).padStart(2, '0');
  const normalizedDay = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${normalizedMonth}-${normalizedDay}`;
};

const artistUnavailableDays = computed<string[]>(() => {
  const uniqueDays = new Set<string>();
  artistBookings.value.forEach((booking) => {
    if (!booking.day) return;
    if (booking.reaction === EReactions.Rejected) return;
    const normalized = normalizeBookingDay(booking.day);
    if (normalized) {
      uniqueDays.add(normalized);
    }
  });
  return Array.from(uniqueDays);
});

const rules = {
  required: (field: string) => (val: string | null | undefined) => !!val || `${field} is required`,
  email: (val: string | null | undefined) => {
    if (!val) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val) || 'Enter a valid email';
  },
};

// Artist search and list state
const showSearchDialog = ref(false);
const showFilterDialog = ref(false);
const showSortDialog = ref(false);
const searchQuery = ref('');

const activeFilters = ref<IFilters>({
  type: UserType.Artist,
  city: null,
  name: null,
});

const sortSettings = ref({
  sortBy: null as string | null,
  sortDirection: 'asc' as 'asc' | 'desc',
});

const localArtists = ref<IUser[]>([]);
const currentPage = ref(1);
const totalArtists = ref(0);
const hasMoreArtists = ref(true);

const selectedArtistId = computed(() => selectedArtist.value?.documentId || null);

const {
  load: loadArtistsQuery,
  loading: isLoadingQuery,
  onResult: onArtistsResult,
  onError: onArtistsError,
} = useLazyQuery<IGraphQLUsersResult>(USERS_QUERY);

const {
  load: loadCities,
  onResult: onResultCities,
  onError: onErrorCities,
} = useLazyQuery<IGraphQLCitiesResult>(CITIES_QUERY);

const {
  load: loadArtistById,
  onResult: onArtistResult,
  onError: onArtistError,
} = useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const {
  load: loadShopById,
  onResult: onShopResult,
  onError: onShopError,
} = useLazyQuery<IGraphQLUserResult>(USER_QUERY);

const { load: loadArtistBookings, stop: stopArtistBookings } = useLazyQuery<IBookingsQueryResponse>(BOOKINGS_QUERY);

const { mutate: createBooking } = useMutation(CREATE_BOOKING_MUTATION);

const isLoadingArtists = computed(() => isLoadingQuery.value);
const hasActiveFilters = computed(() =>
  Object.entries(activeFilters.value).some(([key, value]) => key !== 'type' && !!value),
);
const hasActiveSort = computed(() => !!sortSettings.value.sortBy);
const artistListTitle = computed(() => {
  if (totalArtists.value === 0) {
    return 'Artists';
  }
  if (totalArtists.value <= PAGINATION_PAGE_SIZE) {
    return `Artists (${localArtists.value.length})`;
  }
  return `Artists (${localArtists.value.length}/${totalArtists.value})`;
});

const resetPagination = () => {
  currentPage.value = 1;
  totalArtists.value = 0;
  hasMoreArtists.value = true;
};

const buildQueryVariables = () => {
  const filters: Record<string, unknown> = {
    type: {
      eq: UserType.Artist,
    },
    ...convertFiltersToGraphQLFilters({
      ...activeFilters.value,
      name: searchQuery.value || null,
    }),
  };

  if (routeShopDocumentId.value) {
    filters.parent = {
      documentId: {
        eq: routeShopDocumentId.value,
      },
    };
  }

  const sort = sortSettings.value.sortBy
    ? [`${sortSettings.value.sortBy}:${sortSettings.value.sortDirection}`]
    : ['name:asc'];

  return {
    filters,
    sort,
    pagination: {
      page: currentPage.value,
      pageSize: PAGINATION_PAGE_SIZE,
    },
  };
};

const loadArtistsList = (resetData = false) => {
  if (!isArtistSelectionRequired.value) return;
  if (resetData) {
    resetPagination();
  }

  if (!isLoadingQuery.value) {
    void loadArtistsQuery(null, buildQueryVariables());
  }
};

const loadMoreArtists = () => {
  if (!isArtistSelectionRequired.value) return;
  if (!isLoadingQuery.value && hasMoreArtists.value) {
    currentPage.value += 1;
    void loadArtistsQuery(null, buildQueryVariables());
  }
};

const refetchArtistsData = () => {
  if (!isArtistSelectionRequired.value) return;
  resetPagination();
  loadArtistsList(true);
};

const fetchArtistBookings = async (artistId: string | null) => {
  if (!artistId) {
    artistBookings.value = [];
    stopArtistBookings();
    return;
  }

  stopArtistBookings();

  try {
    const response = await loadArtistBookings(null, {
      filters: {
        artist: {
          documentId: {
            eq: artistId,
          },
        },
      },
      sort: ['createdAt:desc'],
      pagination: {
        limit: 100,
      },
    });

    if (!response) {
      return;
    }

    if (selectedArtistId.value !== artistId) {
      return;
    }

    artistBookings.value = response.bookings ?? [];
  } catch (error) {
    console.error('Error fetching artist bookings:', error);
  }
};

const updateReferenceFiles = (files: (File | null)[]) => {
  referenceFiles.value = files.filter((file): file is File => file !== null);
};

const selectArtist = (artist: IUser) => {
  selectedArtist.value = artist;
};

const updateSearchQuery = (value: string) => {
  searchQuery.value = value;
};

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
  if (currentStep.value === 1 && isArtistSelectionRequired.value) {
    if (!selectedArtistId.value) {
      showError('Please select an artist to continue.');
      return false;
    }
    return true;
  }
  if (currentStep.value === 2) {
    const result = await detailsStepRef.value?.validateForm();
    return !!result;
  }
  if (currentStep.value === 3) {
    const result = await scheduleStepRef.value?.validateForm();
    return !!result;
  }
  return true;
};

const buildBookingPayload = (references: UploadFileResponse[]): IBookingRequestPayload => {
  return {
    name: bookingDetails.name,
    email: bookingDetails.email,
    phone: bookingDetails.phone,
    location: user.value?.address || '',
    description: bookingDetails.description,
    placement: bookingDetails.placement,
    size: bookingDetails.size,
    day: schedule.day,
    start: formatToFullTime(schedule.startTime),
    references: references.map((file) => file.id),
    artist: selectedArtistId.value || '',
    owner: user.value?.documentId || '',
  };
};

const onSubmit = async () => {
  const scheduleValid = await scheduleStepRef.value?.validateForm();
  if (!scheduleValid) {
    return;
  }

  if (!selectedArtistId.value) {
    showError('Please select an artist before submitting.');
    return;
  }

  if (!user.value?.documentId) {
    showError('Unable to submit booking. Missing user information.');
    return;
  }

  try {
    isSubmitting.value = true;
    let uploadedReferences: UploadFileResponse[] = [];
    if (referenceFiles.value.length > 0) {
      uploadedReferences = await uploadFiles(referenceFiles.value);
    }

    const input = buildBookingPayload(uploadedReferences);

    const mutationVariables = {
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        location: input.location,
        description: input.description,
        placement: input.placement,
        size: input.size,
        day: input.day,
        start: input.start,
        artist: input.artist,
        references: input.references,
        owner: input.owner,
      },
    };

    Object.keys(mutationVariables.data).forEach((key) => {
      const value = mutationVariables.data[key as keyof typeof mutationVariables.data];
      if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        delete mutationVariables.data[key as keyof typeof mutationVariables.data];
      }
    });

    const result = await createBooking(mutationVariables);
    const booking = result?.data?.createBooking as IBookingCreateResponse | undefined;

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
      void router.push('/my-bookings');
    }
  } catch (error) {
    console.error('Failed to submit booking:', error);
    showError('Failed to submit booking. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const handlePayment = async () => {
  await initiateBookingPayment(createdBooking.value?.documentId ?? null);
};

const resetFormState = async () => {
  isResetting.value = true;
  isPaymentProcessing.value = false;
  currentStep.value = firstVisibleStepId.value;
  searchQuery.value = '';
  activeFilters.value = { type: UserType.Artist, city: null, name: null };
  sortSettings.value = { sortBy: null, sortDirection: 'asc' };
  referenceFiles.value = [];
  artistBookings.value = [];
  createdBooking.value = null;

  if (!routeArtistDocumentId.value) {
    selectedArtist.value = null;
  }

  Object.assign(bookingDetails, {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    description: '',
    placement: '',
    size: '',
  });

  Object.assign(schedule, {
    day: '',
    startTime: '',
  });

  resetPagination();

  await nextTick();
  detailsStepRef.value?.resetForm();
  scheduleStepRef.value?.resetForm();
  isResetting.value = false;
  currentStep.value = firstVisibleStepId.value;
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

watch(
  () => selectedArtist.value,
  (newArtist, oldArtist) => {
    if (newArtist?.documentId === oldArtist?.documentId) return;
    artistBookings.value = [];
    stopArtistBookings();
    Object.assign(schedule, {
      day: '',
      startTime: '',
    });
    scheduleStepRef.value?.resetForm();

    if (newArtist?.parent?.openingHours) {
      shopOpeningHours.value = newArtist.parent.openingHours;
    } else if (!routeShopDocumentId.value) {
      shopOpeningHours.value = [];
    }
  },
  {
    immediate: true,
  }
);

watch(
  selectedArtistId,
  (artistId) => {
    if (artistId) {
      void fetchArtistBookings(artistId);
    } else {
      artistBookings.value = [];
      stopArtistBookings();
    }
  },
  { immediate: true },
);

watch(
  [activeFilters, searchQuery, sortSettings],
  () => {
    if (isResetting.value || !isArtistSelectionRequired.value) return;
    refetchArtistsData();
  },
  { deep: true },
);

watch(
  () => routeArtistDocumentId.value,
  (id) => {
    if (id) {
      void loadArtistById(null, { documentId: id });
    } else {
      selectedArtist.value = null;
    }
  },
  { immediate: true },
);

watch(
  () => routeShopDocumentId.value,
  (id) => {
    if (id) {
      void loadShopById(null, { documentId: id });
    } else {
      shopOpeningHours.value = [];
    }
  },
  { immediate: true },
);

let initialized = false;

const initializePage = async () => {
  await resetFormState();
  if (isArtistSelectionRequired.value) {
    loadArtistsList(true);
    void loadCities();
  }
};

watch(
  () => route.fullPath,
  async () => {
    if (!initialized) return;
    await initializePage();
  },
);

onMounted(async () => {
  await initializePage();
  initialized = true;
});

onArtistsResult(({ data, loading }) => {
  if (loading) return;
  if (currentPage.value === 1) {
    localArtists.value = data?.usersPermissionsUsers || [];
  } else {
    localArtists.value = [...localArtists.value, ...(data?.usersPermissionsUsers || [])];
  }
  totalArtists.value = data?.usersPermissionsUsers_connection?.pageInfo?.total || 0;
  hasMoreArtists.value =
    (data?.usersPermissionsUsers?.length || 0) === PAGINATION_PAGE_SIZE &&
    localArtists.value.length < totalArtists.value;
});

onArtistsError((error) => {
  console.error('Error fetching artists:', error);
  showError('Failed to load artists. Please try again.');
});

onResultCities(({ data }) => {
  citiesStore.setCities(data?.cities || []);
});

onErrorCities((error) => {
  console.error('Error loading cities:', error);
});

onArtistResult(({ data }) => {
  if (data?.usersPermissionsUser) {
    selectedArtist.value = data.usersPermissionsUser;
  }
});

onArtistError((error) => {
  console.error('Error loading artist:', error);
  showError('Failed to load artist information.');
});

onShopResult(({ data }) => {
  shopOpeningHours.value = data?.usersPermissionsUser?.openingHours || [];
});

onShopError((error) => {
  console.error('Error loading shop:', error);
});

const handleBrowserFinished = () => {
  console.log('Browser closed, redirecting to my bookings...');
  void router.push('/my-bookings');
};

onMounted(() => {
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
  padding: 20px 0 16px;
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
