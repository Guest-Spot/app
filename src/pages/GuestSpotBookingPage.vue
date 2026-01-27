<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Book Guest <span class="text-primary">Spot</span>
      </h2>
    </div>

    <!-- Single slot booking view -->
    <div v-if="slotData" class="container full-width">
      <GuestSpotSlotCard :slot-data="slotData" class="q-mb-md" @click="handleSlotClick" />
      <div class="flex justify-center q-mt-md">
        <q-btn
          rounded
          color="primary"
          size="lg"
          label="Book This Guest Spot"
          icon="event_available"
          @click="handleSlotClick(slotData)"
        />
      </div>
    </div>

    <!-- Slots list view -->
    <div v-else-if="!hasSlotId" class="container full-width">
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
        description="This shop doesn't have any available guest spots at the moment"
        no-btn
      />
    </div>

    <!-- Loading single slot -->
    <LoadingState
      v-else-if="isLoadingSlot"
      :is-loading="isLoadingSlot"
      title="Loading slot..."
      description="Please wait"
      spinner-name="dots"
    />

    <!-- Slot not found -->
    <NoResult
      v-else-if="!isLoadingSlot && !isLoadingSlots"
      icon="error"
      title="Slot not found"
      description="This guest spot slot may have been removed"
      no-btn
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import { GuestSpotSlotCard, LoadingState, NoResult } from 'src/components';

const route = useRoute();
const router = useRouter();
const {
  slots,
  currentSlot,
  isLoadingSlot,
  isLoadingSlots,
  loadSlot,
  loadSlots,
} = useGuestSpot();
const shopDocumentId = computed(() => route.params.documentId as string);
const slotId = computed(() => route.query.slotId as string | undefined);
const hasSlotId = computed(() => !!slotId.value);

// Try to get slot from currentSlot first, then from slots list
const slotData = computed(() => {
  if (currentSlot.value) {
    return currentSlot.value;
  }
  // Fallback: try to find slot in loaded slots list
  if (slotId.value) {
    return slots.value.find((s) => s.documentId === slotId.value) || null;
  }
  return null;
});

const loadSlotData = async () => {
  if (slotId.value) {
    // Load specific slot if slotId is provided
    await loadSlot(slotId.value);
    // If slot not found in currentSlot, try loading slots list as fallback
    if (!currentSlot.value && shopDocumentId.value) {
      await loadSlots({ shopDocumentId: shopDocumentId.value, enabled: true });
    }
  } else if (shopDocumentId.value) {
    // Load all slots for the shop if no slotId is provided
    await loadSlots({ shopDocumentId: shopDocumentId.value, enabled: true });
  }
};

onMounted(async () => {
  await loadSlotData();
});

// Watch for slotId changes in query params
watch(
  () => route.query.slotId,
  async (newSlotId, oldSlotId) => {
    // Only reload if slotId actually changed
    if (newSlotId !== oldSlotId) {
      if (newSlotId) {
        await loadSlot(newSlotId as string);
        // If slot not found in currentSlot, try loading slots list as fallback
        if (!currentSlot.value && shopDocumentId.value) {
          await loadSlots({ shopDocumentId: shopDocumentId.value, enabled: true });
        }
      } else if (shopDocumentId.value) {
        // If slotId is removed, reload slots list
        await loadSlots({ shopDocumentId: shopDocumentId.value, enabled: true });
      }
    }
  },
  { immediate: false }
);

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
.container {
  width: 100%;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  width: 100%;
}
</style>
