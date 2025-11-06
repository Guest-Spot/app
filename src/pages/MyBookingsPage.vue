<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-lg">
    <template v-if="isAuthenticated && isGuest">
      <!-- Header -->
      <div class="container">
        <div class="page-header">
          <h2 class="page-title text-h5 text-bold q-my-none">My Booking Requests</h2>
          <p class="page-subtitle text-body2 text-grey-7 q-mt-xs q-mb-none">
            Track and manage your booking requests
          </p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="container">
        <div class="main-content flex column q-gap-md">
          <GuestBookingsList />
        </div>
      </div>
    </template>

    <!-- Not Authenticated -->
    <SingInToContinue
      v-else-if="!hasTokens"
      class="fixed-center full-width"
      title="My Booking Requests"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import GuestBookingsList from 'src/components/Bookings/Guest/GuestBookingsList.vue';
import SingInToContinue from 'src/components/SingInToContinue.vue';
import useUser from 'src/modules/useUser';
import useTokens from 'src/modules/useTokens';

const { isAuthenticated, isGuest } = useUser();

const { getStoredTokens } = useTokens();
const hasTokens = computed(() => getStoredTokens()?.accessToken);
</script>

<style scoped lang="scss">
.page-header {
  .page-title {
    font-size: 24px;
    line-height: 1.3;
  }

  .page-subtitle {
    font-size: 14px;
  }
}

.main-content {
  min-height: 400px;
}
</style>
