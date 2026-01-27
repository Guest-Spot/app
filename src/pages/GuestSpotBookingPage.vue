<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="container">
      <BackButton />
      <h2 class="text-h5 q-my-none q-mt-md">Book Guest <span class="text-primary">Spot</span></h2>
    </div>

    <div v-if="slotData" class="container full-width">
      <GuestSpotSlotCard :slot-data="slotData" class="q-mb-md" />

      <GuestSpotBookingDialog
        v-model="showBookingDialog"
        :slot-data="slotData"
        :loading="isCreatingBooking"
        @submit="handleBookingSubmit"
      />
    </div>

    <LoadingState
      v-else-if="isLoadingSlot"
      :is-loading="isLoadingSlot"
      title="Loading slot..."
      description="Please wait"
      spinner-name="dots"
    />

    <NoResult
      v-else
      icon="error"
      title="Slot not found"
      description="This guest spot slot may have been removed"
      no-btn
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { IGuestSpotBookingRequest } from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import { GuestSpotSlotCard, GuestSpotBookingDialog, LoadingState, NoResult, BackButton } from 'src/components';

const route = useRoute();
const router = useRouter();
const { currentSlot, isLoadingSlot, isCreatingBooking, loadSlot, createBooking } = useGuestSpot();

const showBookingDialog = ref(true);
const slotData = computed(() => currentSlot.value);

onMounted(async () => {
  const slotId = route.query.slotId as string;
  if (slotId) {
    await loadSlot(slotId);
  }
});

const handleBookingSubmit = async (data: IGuestSpotBookingRequest) => {
  if (!slotData.value) return;

  const booking = await createBooking({
    guestSpotSlotDocumentId: slotData.value.documentId,
    selectedDate: data.selectedDate,
    selectedTime: data.selectedTime || undefined,
    comment: data.comment || undefined,
  });

  if (booking) {
    showBookingDialog.value = false;
    void router.push('/events');
  }
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
}
</style>
