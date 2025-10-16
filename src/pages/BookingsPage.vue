<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <template v-if="isAuthenticated">
      <!-- Main Content Area -->
      <div class="container">
        <div class="main-content flex column q-gap-md">
          <div class="tab-content">
            <BookingCalendar :bookings="bookings" :loading="isLoading" />
          </div>
        </div>
      </div>
    </template>

    <SingInToContinue v-else class="fixed-center full-width" title="My Bookings" />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { BookingCalendar } from 'src/components';
import SingInToContinue from 'src/components/SingInToContinue.vue';
import useUser from 'src/modules/useUser';
import { useUserStore } from 'src/stores/user';
import { BOOKINGS_QUERY } from 'src/apollo/types/queries/booking';
import type { IBookingsQueryResponse } from 'src/interfaces/booking';

const { isAuthenticated } = useUser();
const userStore = useUserStore();

const userDocumentId = computed(() => userStore.getUser?.documentId);

const bookingFilters = computed(() => {
  const documentId = userDocumentId.value;

  if (!documentId) {
    return undefined;
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

const { result, loading } = useQuery<IBookingsQueryResponse>(
  BOOKINGS_QUERY,
  () => {
    const filters = bookingFilters.value;
    return filters ? { filters } : {};
  },
  {
    fetchPolicy: 'network-only',
    enabled: computed(() => Boolean(userDocumentId.value)),
  },
);

const bookings = computed(() => result.value?.bookings ?? []);
const isLoading = computed(() => loading.value);
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
