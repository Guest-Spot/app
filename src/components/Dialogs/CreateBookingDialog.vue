<template>
  <!-- Search/Filter/Sort dialogs -->
  <SearchDialog v-model="showSearchDialog" v-model:query="searchQuery" no-route-replace />
  <FilterDialog
    v-model="showFilterDialog"
    v-model:filterValue="activeFilters"
    no-route-replace
    unelevated
  />
  <SortDialog v-model="showSortDialog" v-model:sortValue="sortSettings" no-route-replace />

  <q-dialog v-model="isVisible" position="bottom" maximized no-route-dismiss>
    <q-card class="create-booking-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Create Booking Request</div>
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

      <q-card-section class="dialog-content">
        <div class="custom-stepper">
          <div class="stepper-header">
            <div
              v-for="step in steps"
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
            v-if="currentStep === 1"
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
            v-model:location="bookingDetails.location"
            v-model:description="bookingDetails.description"
            v-model:placement="bookingDetails.placement"
            v-model:size="bookingDetails.size"
            :reference-files="referenceFiles"
            :rules="rules"
            @update:reference-files="updateReferenceFiles"
          />

          <ScheduleStep
            v-else
            ref="scheduleStepRef"
            v-model:day="schedule.day"
            v-model:start-time="schedule.startTime"
            :rules="rules"
          />
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          v-if="currentStep === 1"
          label="Cancel"
          rounded
          unelevated
          class="bg-block"
          @click="closeDialog"
        />
        <q-btn v-else label="Back" rounded unelevated class="bg-block" @click="goToPrevStep" />
        <div class="actions-right flex q-gap-sm">
          <q-btn
            v-if="currentStep < 3"
            label="Next"
            color="primary"
            rounded
            unelevated
            :disable="currentStep === 1 && !selectedArtistId"
            @click="goToNextStep"
          />
          <q-btn
            v-else
            label="Submit Request"
            color="primary"
            rounded
            unelevated
            :loading="isSubmitting"
            @click="onSubmit"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useLazyQuery, useMutation } from '@vue/apollo-composable';
import { SearchDialog, FilterDialog, SortDialog } from 'src/components/Dialogs';
import ArtistStep from './CreateBookingSteps/ArtistStep.vue';
import DetailsStep from './CreateBookingSteps/DetailsStep.vue';
import ScheduleStep from './CreateBookingSteps/ScheduleStep.vue';

import { USERS_QUERY } from 'src/apollo/types/user';
import { CITIES_QUERY } from 'src/apollo/types/city';
import { CREATE_BOOKING_MUTATION } from 'src/apollo/types/mutations/booking';

import type { IUser, IGraphQLUsersResult } from 'src/interfaces/user';
import type { IGraphQLCitiesResult } from 'src/interfaces/city';
import type { IFilters } from 'src/interfaces/filters';
import type { IBookingRequestPayload, IBookingCreateResponse } from 'src/interfaces/booking';
import { PAGINATION_PAGE_SIZE } from 'src/config/constants';
import { UserType } from 'src/interfaces/enums';
import useHelpers from 'src/modules/useHelpers';
import useNotify from 'src/modules/useNotify';
import { useCitiesStore } from 'src/stores/cities';
import { uploadFiles, type UploadFileResponse } from 'src/api';
import useDate from 'src/modules/useDate';
import useUser from 'src/modules/useUser';

interface Props {
  modelValue: boolean;
  shopDocumentId?: string;
  artistDocumentId?: string;
  type?: 'shop-to-artist' | 'artist-to-shop';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', booking: IBookingCreateResponse): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { convertFiltersToGraphQLFilters } = useHelpers();
const { showError, showSuccess } = useNotify();
const citiesStore = useCitiesStore();
const { formatToFullTime } = useDate();
const { user } = useUser();

const steps = [
  { id: 1, title: 'Artist', icon: 'person' },
  { id: 2, title: 'Details', icon: 'assignment' },
  { id: 3, title: 'Schedule', icon: 'event' },
] as const;

const isVisible = ref(props.modelValue);
const currentStep = ref(1);
const isSubmitting = ref(false);
const isResetting = ref(false);

const detailsStepRef = ref<InstanceType<typeof DetailsStep> | null>(null);
const scheduleStepRef = ref<InstanceType<typeof ScheduleStep> | null>(null);

const bookingDetails = reactive({
  name: '',
  email: '',
  phone: '',
  location: '',
  description: '',
  placement: '',
  size: '',
});

const schedule = reactive({
  day: '',
  startTime: '',
});

const referenceFiles = ref<File[]>([]);

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
const selectedArtistId = ref<string | null>(props.artistDocumentId || null);

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

  // If shopDocumentId is provided, filter artists by parent shop
  if (props.shopDocumentId) {
    filters.parent = {
      documentId: {
        eq: props.shopDocumentId,
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
  if (resetData) {
    resetPagination();
  }

  if (!isLoadingQuery.value) {
    void loadArtistsQuery(null, buildQueryVariables());
  }
};

const loadMoreArtists = () => {
  if (!isLoadingQuery.value && hasMoreArtists.value) {
    currentPage.value += 1;
    void loadArtistsQuery(null, buildQueryVariables());
  }
};

const refetchArtistsData = () => {
  resetPagination();
  loadArtistsList(true);
};

const updateReferenceFiles = (files: File[]) => {
  referenceFiles.value = [...files];
};

const selectArtist = (artist: IUser) => {
  selectedArtistId.value = artist.documentId;
};

const updateSearchQuery = (value: string) => {
  searchQuery.value = value;
};

const goToNextStep = async () => {
  const isValid = await validateCurrentStep();
  if (isValid) {
    currentStep.value = Math.min(currentStep.value + 1, 3);
  }
};

const goToPrevStep = () => {
  currentStep.value = Math.max(currentStep.value - 1, 1);
};

const handleStepClick = (stepId: number) => {
  if (stepId < currentStep.value) {
    currentStep.value = stepId;
  }
};

const validateCurrentStep = async (): Promise<boolean> => {
  if (currentStep.value === 1) {
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
    location: bookingDetails.location,
    description: bookingDetails.description,
    placement: bookingDetails.placement,
    size: bookingDetails.size,
    day: schedule.day,
    start: formatToFullTime(schedule.startTime),
    references: references.map((file) => file.documentId),
    artist: selectedArtistId.value || '',
  };
};

const onSubmit = async () => {
  if (!selectedArtistId.value) {
    showError('Please select an artist before submitting.');
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
      },
    };

    // Remove undefined fields to avoid GraphQL errors
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

    emit('submit', booking);
    showSuccess('Booking request sent!');
    closeDialog();
  } catch (error) {
    console.error('Failed to submit booking:', error);
    showError('Failed to submit booking. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const resetFormState = () => {
  isResetting.value = true;
  currentStep.value = 1;
  searchQuery.value = '';
  activeFilters.value = { type: UserType.Artist, city: null, name: null };
  sortSettings.value = { sortBy: null, sortDirection: 'asc' };
  referenceFiles.value = [];
  selectedArtistId.value = props.artistDocumentId || null;

  // Auto-fill user data if available
  Object.assign(bookingDetails, {
    name: user.value?.name || '',
    email: user.value?.email || '',
    phone: user.value?.phone || '',
    location: '',
    description: '',
    placement: '',
    size: '',
  });

  Object.assign(schedule, {
    day: '',
    startTime: '',
  });

  resetPagination();
  void nextTick(() => {
    detailsStepRef.value?.resetForm();
    scheduleStepRef.value?.resetForm();
    isResetting.value = false;
  });
};

const closeDialog = () => {
  isVisible.value = false;
};

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (newValue) {
      resetFormState();
      // Force reload artists on dialog open
      resetPagination();
      loadArtistsList(true);
      void loadCities();
    }
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
  if (!newValue) {
    resetFormState();
  }
});

watch(
  [activeFilters, searchQuery, sortSettings],
  () => {
    if (isResetting.value || !isVisible.value) return;
    refetchArtistsData();
  },
  { deep: true },
);

watch(
  () => props.artistDocumentId,
  (id) => {
    if (id) {
      selectedArtistId.value = id;
    }
  },
);

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

onMounted(() => {
  if (props.modelValue) {
    resetPagination();
    loadArtistsList(true);
    void loadCities();
  }
});
</script>

<style scoped lang="scss">
.create-booking-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;

    .text-subtitle1 {
      font-weight: 600;
    }
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

    .stepper-header {
      display: flex;
      gap: 12px;
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
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .q-btn {
      font-weight: 600;
    }
  }
}

.body--dark {
  .create-booking-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .custom-stepper {
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
}
</style>
