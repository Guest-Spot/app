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

      <q-list v-else-if="slots.length > 1" class="slots-list bg-block border-radius-md">
        <q-item
          v-for="slotItem in slots"
          :key="slotItem.documentId"
          clickable
          v-ripple
          @click="handleSlotClick(slotItem)"
        >
          <q-item-section avatar>
            <q-icon name="store" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ slotItem.shop?.name || slotItem.title || 'Guest Spot' }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" color="grey" />
          </q-item-section>
        </q-item>
      </q-list>

      <NoResult
        v-else-if="!slots.length"
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
import { LoadingState, NoResult } from 'src/components';

const router = useRouter();
const { slots, isLoadingSlots, loadSlots } = useGuestSpot();

onMounted(async () => {
  await loadSlots({ enabled: true });

  if (slots.value.length === 1) {
    await router.replace({
      name: 'CreateGuestSpotBooking',
      query: { slotId: slots.value[0]!.documentId },
    });
  }
});

const handleSlotClick = (slot: IGuestSpotSlot) => {
  if (slot.documentId) {
    void router.push({
      name: 'CreateGuestSpotBooking',
      query: { slotId: slot.documentId },
    });
  }
};
</script>

<style scoped lang="scss">
.slots-list {
  overflow: hidden;
}
</style>
