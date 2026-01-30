<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <template v-if="isAuthenticated">
      <!-- Navigation Tabs -->
      <div class="container">
        <TabsComp
          :tabs="tabs"
          :activeTab="activeTab"
          use-query
          send-initial-tab
          @setActiveTab="setActiveTab"
          class="full-width"
        />
      </div>

      <!-- Main Content Area -->
      <div class="container">
        <div class="main-content flex column q-gap-md">
          <div v-if="activeTab.tab === TAB_BOOKINGS" class="tab-content">
            <BookingCalendar :bookings="bookings" :loading="isLoading" />
          </div>
          <div v-else-if="activeTab.tab === TAB_INVITES" class="tab-content">
            <InvitesTab />
          </div>
          <div v-else-if="activeTab.tab === TAB_GUEST_SPOT" class="tab-content">
            <ArtistGuestSpotBookings
              :bookings="guestSpotBookings"
              :loading="isLoadingGuestSpotBookings"
              :has-more="hasMoreGuestSpotBookings"
              @load-more="loadMoreGuestSpotBookings"
              @paid="handleGuestSpotPaid"
            />
          </div>
        </div>
      </div>
    </template>
    <SingInToContinue v-else-if="!hasTokens" class="fixed-center full-width" title="My Trips & Bookings" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { BookingCalendar, TabsComp, ArtistGuestSpotBookings } from 'src/components';
import { useUserStore } from 'src/stores/user';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';
import type { IBookingsQueryResponse } from 'src/interfaces/booking';
import { type ITab } from 'src/interfaces/tabs';
import SingInToContinue from 'src/components/SingInToContinue.vue';
import useUser from 'src/modules/useUser';
import InvitesTab from 'src/components/Events/InvitesTab/index.vue';
import useTokens from 'src/modules/useTokens';
import useGuestSpot from 'src/composables/useGuestSpot';

const TAB_INVITES = 'invites';
const TAB_GUEST_SPOT = 'guest-spot';
const TAB_BOOKINGS = 'bookings';
const GUEST_SPOT_PAGE_SIZE = 20;

const { isAuthenticated, isArtist } = useUser();
const { getStoredTokens } = useTokens();
const hasTokens = computed(() => getStoredTokens()?.accessToken);
const userStore = useUserStore();

const tabs = computed<ITab[]>(() => {
  const baseTabs: ITab[] = [
    {
      label: 'Invites',
      tab: TAB_INVITES,
    },
  ];

  if (isArtist.value) {
    baseTabs.push({
      label: 'Guest Spot',
      tab: TAB_GUEST_SPOT,
    });
  }

  return [
    {
      label: 'Bookings',
      tab: TAB_BOOKINGS,
    },
    ...baseTabs,
  ];
});

// Tab management
const activeTab = ref<ITab>(tabs.value[0]!);

watch(
  tabs,
  (newTabs) => {
    if (!newTabs.length) {
      return;
    }

    const currentTabExists = newTabs.some((tab) => tab.tab === activeTab.value.tab);
    if (!currentTabExists) {
      activeTab.value = newTabs[0]!;
    }
  },
  { immediate: true },
);

const userDocumentId = computed(() => userStore.getUser?.documentId);

const bookingFilters = computed(() => {
  const documentId = userDocumentId.value;

  if (!documentId) {
    return undefined;
  }

  if (isArtist.value) {
    return {
      artist: {
        documentId: {
          eq: documentId,
        },
      },
    };
  }

  return {
    or: [
      {
        owner: {
          documentId: {
            eq: documentId,
          },
        },
      },
      {
        artist: {
          parent: {
            documentId: {
              eq: documentId,
            },
          },
        },
      },
    ],
  };
});

const {
  bookings: guestSpotBookings,
  isLoadingBookings: isLoadingGuestSpotBookings,
  hasMoreBookings: hasMoreGuestSpotBookings,
  loadBookings: loadGuestSpotBookings,
  refetchBookings: refetchGuestSpotBookings,
} = useGuestSpot();

const guestSpotSort = ['createdAt:desc'] as const;
const loadGuestSpotBookingsInitial = () => {
  if (!userDocumentId.value) return;
  void loadGuestSpotBookings(
    { artistDocumentId: userDocumentId.value },
    [...guestSpotSort],
    { limit: GUEST_SPOT_PAGE_SIZE },
  );
};
const loadMoreGuestSpotBookings = () => {
  if (!userDocumentId.value) return;
  void loadGuestSpotBookings(
    { artistDocumentId: userDocumentId.value },
    [...guestSpotSort],
    { limit: GUEST_SPOT_PAGE_SIZE, start: guestSpotBookings.value.length },
    { append: true },
  );
};

const {
  result,
  loading,
  refetch: refetchBookings,
} = useQuery<IBookingsQueryResponse>(
  BOOKINGS_QUERY,
  () => {
    const filters = bookingFilters.value;

    return {
      ...(filters ? { filters } : {}),
      sort: ['createdAt:desc'],
      pagination: {
        limit: 100,
      },
    };
  },
  {
    fetchPolicy: 'network-only',
    enabled: computed(() => Boolean(userDocumentId.value)),
  },
);

const bookings = computed(() => result.value?.bookings ?? []);
const isLoading = computed(() => loading.value);

const setActiveTab = (tab: ITab) => {
  activeTab.value = tab;

  if (tab.tab === TAB_BOOKINGS) {
    void refetchBookings();
  } else if (tab.tab === TAB_GUEST_SPOT && isArtist.value) {
    loadGuestSpotBookingsInitial();
  }
};

onMounted(() => {
  if (isArtist.value) {
    loadGuestSpotBookingsInitial();
  }
});

const handleGuestSpotPaid = () => {
  void refetchGuestSpotBookings();
};
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
