<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">
        Guest Spot <span class="text-primary">Management</span>
      </h2>
    </div>

    <div class="container ">
      <div class="guest-spot-management">
        <!-- Enable/Disable Toggle -->
        <div class="toggle-section bg-block border-radius-lg q-pa-md q-mb-md">
          <div class="flex items-center justify-between">
            <div class="flex items-center justify-between full-width">
              <h3 class="text-subtitle1 text-bold q-my-none">Guest Spot Availability</h3>
              <q-toggle
                v-model="isEnabled"
                dense
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
            <q-btn
              color="primary"
              icon="add"
              @click="handleCreateSlot"
              unelevated
              round
              size="sm"
            />
          </div>

          <LoadingState
            v-if="isLoadingSlots && !slots.length"
            :is-loading="isLoadingSlots"
            title="Loading slots..."
            description="Please wait while we fetch the slots"
            spinner-name="dots"
          />

          <div v-else-if="slots.length" class="slots-list">
            <GuestSpotSlotManagementCard
              v-for="(slotItem, index) in slots"
              :key="slotItem.documentId"
              :slot-data="slotItem"
              :index="index + 1"
              :is-updating="isUpdatingSlot"
              :is-deleting="isDeletingSlot"
              @edit="handleEditSlot"
              @delete="handleDeleteSlot"
            />
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
        <GuestSpotSlotDialog
          v-model="showSlotForm"
          :slot-data="editingSlot"
          :loading="isUpdatingSlot"
          @submit="handleSlotSubmit"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'GuestSpotManagementPage',
});

import type {
  IGuestSpotSlot,
  IGuestSpotSlotForm,
} from 'src/interfaces/guestSpot';
import useGuestSpot from 'src/composables/useGuestSpot';
import useUser from 'src/modules/useUser';
import {
  LoadingState,
  NoResult,
  GuestSpotSlotManagementCard,
} from 'src/components';
import { GuestSpotSlotDialog } from 'src/components/Dialogs';

const $q = useQuasar();
const router = useRouter();
const { user } = useUser();

const {
  slots,
  isLoadingSlots,
  isUpdatingSlot,
  isDeletingSlot,
  isTogglingEnabled,
  loadSlots,
  refetchSlots,
  updateSlot,
  deleteSlot,
  toggleEnabled,
} = useGuestSpot();

const isEnabled = ref(false);
const showSlotForm = ref(false);
const editingSlot = ref<(IGuestSpotSlotForm & { documentId?: string }) | null>(null);

// Function to load slots for current user
const loadUserSlots = async () => {
  const shopDocumentId = user.value?.documentId;
  if (shopDocumentId) {
    // Load all slots for this shop (without enabled filter)
    await loadSlots({ shopDocumentId });
  }
};

// Watch for user data changes to update isEnabled
watch(
  () => user.value?.guestSpotEnabled,
  (guestSpotEnabled) => {
    if (guestSpotEnabled !== undefined) {
      isEnabled.value = guestSpotEnabled;
    }
  },
  { immediate: true },
);

// Watch for user documentId to load slots when user is available
watch(
  () => user.value?.documentId,
  async (documentId) => {
    if (documentId) {
      // Update isEnabled from user data
      isEnabled.value = user.value?.guestSpotEnabled ?? false;

      // Load all slots for this shop
      await loadUserSlots();
    }
  },
  { immediate: true },
);

onMounted(async () => {
  // Ensure slots are loaded if user is already available
  if (user.value?.documentId) {
    isEnabled.value = user.value.guestSpotEnabled ?? false;
    await loadUserSlots();
  }
});

const handleToggleEnabled = async (enabled: boolean) => {
  if (!user.value?.documentId) return;

  const success = await toggleEnabled(user.value.documentId, enabled);
  if (success) {
    // Update isEnabled from user data (which was updated by toggleEnabled)
    isEnabled.value = user.value.guestSpotEnabled ?? enabled;
    if (enabled) {
      const shopDocumentId = user.value.documentId;
      if (shopDocumentId) {
        // Reload all slots for this shop
        await loadSlots({ shopDocumentId });
      }
    }
  }
};

const handleCreateSlot = () => {
  void router.push('/create-guest-spot-slot');
};

const handleSlotSubmit = async (data: IGuestSpotSlotForm) => {
  if (!user.value?.documentId) return;

  // Only handle updates here (editing), creation is handled on separate page
  if (editingSlot.value?.documentId) {
    await updateSlot(editingSlot.value.documentId, data);

    // Close dialog first
    showSlotForm.value = false;
    editingSlot.value = null;

    // Wait for next tick to ensure dialog is closed and mutation is complete
    await nextTick();

    // Refetch all slots after update to ensure data is up to date
    const shopDocumentId = user.value?.documentId;
    if (shopDocumentId) {
      // Use refetchSlots with the same variables to bypass cache
      try {
        const variables: Record<string, unknown> = {
          filters: {
            shop: { documentId: { eq: shopDocumentId } },
          },
        };
        await refetchSlots(variables);
      } catch (error) {
        // Fallback to loadSlots if refetch fails (e.g., query not loaded yet)
        console.warn('Refetch failed, using loadSlots:', error);
        await loadUserSlots();
      }
    }
  }
};

const handleEditSlot = (slot: IGuestSpotSlot) => {
  editingSlot.value = {
    documentId: slot.documentId,
    description: slot.description,
    pricingOptions: slot.pricingOptions,
    depositAmount: slot.depositAmount,
    spaces: slot.spaces,
    openingHours: slot.openingHours,
  } as unknown as IGuestSpotSlotForm;
  showSlotForm.value = true;
};

const handleDeleteSlot = (documentId: string) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: 'Are you sure you want to delete this slot?',
    persistent: true,
    cancel: {
      color: 'grey-9',
      rounded: true,
      label: 'No, Keep It',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Yes, Delete',
    },
  }).onOk(() => {
    void (async () => {
      const success = await deleteSlot(documentId);
      if (success) {
        const shopDocumentId = user.value?.documentId;
        if (shopDocumentId) {
          // Reload slots after delete
          await loadSlots({ shopDocumentId });
        }
      }
    })();
  });
};
</script>

<style scoped lang="scss">
.guest-spot-management {
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
</style>
