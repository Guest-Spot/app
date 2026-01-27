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

    <div class="container full-width">
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
              label="Create Slot"
              @click="handleCreateSlot"
              unelevated
              rounded
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
                      icon="edit"
                      size="sm"
                      @click="handleEditSlot(slot)"
                      :loading="isUpdatingSlot"
                    />
                    <q-btn
                      flat
                      icon="delete"
                      size="sm"
                      color="negative"
                      @click="handleDeleteSlot(slot.documentId)"
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
        <q-dialog v-model="showSlotForm">
          <q-card style="min-width: 500px; max-width: 800px">
            <q-card-section>
              <div class="text-h6">{{ editingSlot ? 'Edit Slot' : 'Create Slot' }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <GuestSpotSlotForm
                :slot-data="editingSlot"
                :loading="isCreatingSlot || isUpdatingSlot"
                @submit="handleSlotSubmit"
                @cancel="showSlotForm = false"
              />
            </q-card-section>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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
import { LoadingState, NoResult } from 'src/components';
import GuestSpotSlotForm from 'src/components/ShopProfile/GuestSpotTab/GuestSpotSlotForm.vue';

const $q = useQuasar();
const router = useRouter();
const { user } = useUser();

const {
  slots,
  isLoadingSlots,
  isCreatingSlot,
  isUpdatingSlot,
  isDeletingSlot,
  isTogglingEnabled,
  loadSlots,
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
    const slot = await updateSlot(editingSlot.value.documentId, data);
    if (slot) {
      showSlotForm.value = false;
      editingSlot.value = null;
      const shopDocumentId = user.value?.documentId;
      if (shopDocumentId) {
        // Reload slots after update
        await loadSlots({ shopDocumentId });
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
    cancel: true,
    persistent: true,
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

.slot-card {
  width: 100%;
}

.pricing-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
