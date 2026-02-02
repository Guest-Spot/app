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

    <div class="container full-width">
      <LoadingState
        v-if="!hasAttemptedLoad && (isLoadingSlots || isLoadingSlot)"
        :is-loading="true"
        title="Loading guest spots..."
        description="Please wait"
        spinner-name="dots"
      />

      <NoResult
        v-else-if="hasAttemptedLoad && !hasSlotId && slots.length === 0"
        icon="event_available"
        title="No guest spots available"
        description="This shop doesn't have any available guest spots at the moment"
        no-btn
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useGuestSpot from 'src/composables/useGuestSpot';
import { LoadingState, NoResult } from 'src/components';

const route = useRoute();
const router = useRouter();
const { slots, isLoadingSlot, isLoadingSlots, loadSlots } = useGuestSpot();

const shopDocumentId = computed(() => route.params.documentId as string);
const slotId = computed(() => route.query.slotId as string | undefined);
const hasSlotId = computed(() => !!slotId.value);

const hasAttemptedLoad = ref(false);

const buildCreateBookingQuery = (slotIdValue: string) => {
  const query: Record<string, string> = {
    slotId: slotIdValue,
  };
  if (shopDocumentId.value) {
    query.shopId = shopDocumentId.value;
  }
  return query;
};

const loadSlotData = async () => {
  hasAttemptedLoad.value = false;

  if (slotId.value) {
    // Redirect to calendar page with slotId (no cards shown)
    await router.replace({
      name: 'CreateGuestSpotBooking',
      query: buildCreateBookingQuery(slotId.value),
    });
    return;
  }

  if (shopDocumentId.value) {
    await loadSlots({ shopDocumentId: shopDocumentId.value, enabled: true });
    hasAttemptedLoad.value = true;

    if (slots.value.length === 1) {
      await router.replace({
        name: 'CreateGuestSpotBooking',
        query: buildCreateBookingQuery(slots.value[0]!.documentId),
      });
    }
  }
};

onMounted(() => {
  void loadSlotData();
});
</script>

<style scoped lang="scss">
.container {
  width: 100%;
}
</style>
