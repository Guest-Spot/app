<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <h2 class="text-h5 q-my-none">Guest <span class="text-primary">Spots</span></h2>
    </div>

    <div class="container full-width">
      <LoadingState
        v-if="isLoadingSlots && !slots.length"
        :is-loading="isLoadingSlots"
        title="Loading guest spots..."
        description="Please wait while we fetch available slots"
        spinner-name="dots"
      />

      <div v-else-if="slots.length" class="slots-grid">
        <GuestSpotSlotCard
          v-for="slotItem in slots"
          :key="slotItem.documentId"
          :slot-data="slotItem"
          @click="handleSlotClick"
        />
      </div>

      <NoResult
        v-else
        icon="event_available"
        title="No guest spots available"
        description="Check back later for new guest spot opportunities"
        no-btn
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import { GuestSpotSlotCard, LoadingState, NoResult } from 'src/components';

const router = useRouter();
const { slots, isLoadingSlots, loadSlots } = useGuestSpot();

onMounted(async () => {
  await loadSlots({ enabled: true });
});

const handleSlotClick = (slot: IGuestSpotSlot) => {
  if (slot.shop?.documentId) {
    void router.push(`/shop/${slot.shop.documentId}/guest-spot?slotId=${slot.documentId}`);
  }
};
</script>

<style scoped lang="scss">
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
}
</style>
