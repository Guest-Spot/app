<template>
  <div class="guest-spot-tab">
    <!-- Enable/Disable Toggle -->
    <div class="toggle-section bg-block border-radius-lg q-pa-md q-mb-md">
      <div class="flex items-center justify-between">
        <div class="flex items-center justify-between full-width">
          <h3 class="text-subtitle1 text-bold q-my-none">Guest Spot Availability</h3>
          <q-toggle
            v-model="isEnabled"
            color="primary"
            :loading="isTogglingEnabled"
            @update:model-value="handleToggleEnabled"
          />
        </div>
        <p class="text-body2 text-grey-6 q-mt-xs q-mb-none">
          Enable guest spot slots for artists to book
        </p>
      </div>
    </div>

    <!-- Slots Section -->
    <div v-if="isEnabled" class="slots-section">
        <div class="section-header q-mb-md flex items-center justify-between">
          <h3 class="text-subtitle1 text-bold q-my-none">Guest Spot Slots</h3>
        </div>

      <LoadingState
        v-if="isLoadingSlots && !slots.length"
        :is-loading="isLoadingSlots"
        title="Loading slots..."
        description="Please wait while we fetch the slots"
        spinner-name="dots"
      />

      <div v-else-if="slots.length" class="slots-list">
        <q-card
          v-for="slot in slots"
          :key="slot.documentId"
          class="slot-card bg-block q-mb-md"
        >
          <q-card-section>
            <div class="flex items-center justify-between q-mb-sm">
              <div>
                <div class="text-subtitle2 text-weight-bold">{{ slot.description }}</div>
                <div class="text-caption text-grey-6">
                  Deposit: ${{ (slot.depositAmount / 100).toFixed(2) }} | Spaces:
                  {{ slot.spaces }}
                </div>
              </div>
              <div class="flex q-gap-xs">
                <q-btn
                  flat
                  icon="delete"
                  size="sm"
                  color="negative"
                  @click.stop="handleDeleteSlot(slot.documentId)"
                  :loading="isDeletingSlot"
                />
              </div>
            </div>
            <div class="pricing-options q-mt-sm">
              <q-chip
                v-for="(option, index) in slot.pricingOptions"
                :key="index"
                size="sm"
                :label="`${option.type}: $${(option.amount / 100).toFixed(2)}`"
                color="primary"
                text-color="white"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <NoResult
        v-else
        icon="event_available"
        title="No slots created yet"
        description="Create your first guest spot slot to start accepting bookings"
        no-btn
      />
    </div>

      <!-- Slot Form Dialog -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';

defineOptions({
  name: 'GuestSpotTab',
});

import useGuestSpot from 'src/composables/useGuestSpot';
import useUser from 'src/modules/useUser';
import { LoadingState, NoResult } from 'src/components';

const $q = useQuasar();
const { user } = useUser();

const {
  slots,
  isLoadingSlots,
  isDeletingSlot,
  isTogglingEnabled,
  loadSlots,
  deleteSlot,
  toggleEnabled,
} = useGuestSpot();

const isEnabled = ref(false);

onMounted(async () => {
  if (user.value?.documentId) {
    // Check if guest spot is enabled for this shop
    // This would come from user.guestSpotEnabled in the future
    isEnabled.value = true; // Default for now

    if (user.value.documentId) {
      await loadSlots({ shopDocumentId: user.value.documentId, enabled: true });
    }
  }
});

const handleToggleEnabled = async (enabled: boolean) => {
  if (!user.value?.documentId) return;

  const success = await toggleEnabled(user.value.documentId, enabled);
  if (success) {
    isEnabled.value = enabled;
    if (enabled) {
      const shopDocumentId = user.value.documentId;
      if (shopDocumentId) {
        await loadSlots({ shopDocumentId, enabled: true });
      }
    }
  }
};

const handleDeleteSlot = (documentId: string) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this slot?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      const success = await deleteSlot(documentId);
      if (success) {
        const shopDocumentId = user.value?.documentId;
        if (shopDocumentId) {
          await loadSlots({ shopDocumentId, enabled: true });
        }
      }
    })();
  });
};
</script>

<style scoped lang="scss">
.guest-spot-tab {
  width: 100%;
}

.toggle-section {
  width: 100%;
}

.slots-section {
  width: 100%;
}

.section-header {
  width: 100%;
}

.slots-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slot-card {
  width: 100%;
}

.pricing-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
