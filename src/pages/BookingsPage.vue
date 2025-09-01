<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <!-- Main Content Area -->
      <div class="main-content flex column q-gap-md">
        <div class="tab-content">
          <BookingsList :artist-id="artistId" :shop-id="shopId" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BookingsList from 'src/components/Bookings/Shop/BookingsList.vue';

// Mock IDs - in real app these would come from user store
const artistId = ref(1);
const shopId = ref(1);
</script>

<style scoped lang="scss">
.tab-content {
  min-height: 400px;
}
</style>
