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

    <div class="container">
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

        <div class="content-wrapper full-width">
          <GuestSpotSlotForm
            ref="slotFormRef"
            :slot-data="slotFormData"
            :loading="isSavingSlot"
            :disabled="!isEnabled"
            @submit="handleSlotSubmit"
          />
        </div>
      </div>
    </div>
    <SaveButton
      :has-changes="isEnabled && hasChanges"
      :loading="isSavingSlot"
      @save="handleSaveClick"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'GuestSpotManagementPage',
});

import type { IGuestSpotSlot, IGuestSpotSlotForm } from 'src/interfaces/guestSpot';
import SaveButton from 'src/components/SaveButton.vue';
import GuestSpotSlotForm from 'src/components/ShopProfile/GuestSpotTab/GuestSpotSlotForm.vue';
import useGuestSpot from 'src/composables/useGuestSpot';
import useUser from 'src/modules/useUser';

const { user } = useUser();

const {
  slots,
  isCreatingSlot,
  isUpdatingSlot,
  isTogglingEnabled,
  loadSlots,
  createSlot,
  updateSlot,
  toggleEnabled,
} = useGuestSpot();

const slotFormRef = ref<InstanceType<typeof GuestSpotSlotForm> | null>(null);
const slotFormData = ref<IGuestSpotSlotForm | null>(null);
const currentSlot = ref<IGuestSpotSlot | null>(null);
const initialFormSnapshot = ref<IGuestSpotSlotForm | null>(null);
const isEnabled = ref(false);

const isSavingSlot = computed(() => isCreatingSlot.value || isUpdatingSlot.value);

const loadUserSlots = async () => {
  const shopDocumentId = user.value?.documentId;
  if (!shopDocumentId) {
    return;
  }

  await loadSlots({ shopDocumentId, enabled: true });
};

const cloneFormData = (value: IGuestSpotSlotForm | null): IGuestSpotSlotForm | null =>
  value ? JSON.parse(JSON.stringify(value)) : null;

const captureInitialSnapshot = async () => {
  await nextTick();
  if (!slotFormRef.value) {
    await nextTick();
  }

  if (slotFormRef.value) {
    initialFormSnapshot.value = cloneFormData(slotFormRef.value.formData.value);
  } else {
    initialFormSnapshot.value = null;
  }
};

const mapSlotToFormData = (slot: IGuestSpotSlot | null): IGuestSpotSlotForm | null => {
  if (!slot) {
    return null;
  }

  return {
    title: slot.title ?? '',
    description: slot.description,
    pricingOptions: slot.pricingOptions.map((option) => ({
      type: option.type,
      amount: option.amount,
      description: option.description ?? null,
    })),
    depositAmount: slot.depositAmount,
    spaces: slot.spaces,
    openingHours: slot.openingHours.map((hour) => ({
      id: hour.id,
      day: hour.day,
      start: hour.start,
      end: hour.end,
    })),
  };
};

const initializeFormFromSlot = async (slot: IGuestSpotSlot | null) => {
  currentSlot.value = slot;
  slotFormData.value = mapSlotToFormData(slot);
  await captureInitialSnapshot();
};

const handleSlotSubmit = async (data: IGuestSpotSlotForm) => {
  if (!user.value?.documentId) {
    return;
  }

  const slotDocumentId = currentSlot.value?.documentId;
  let savedSlot: IGuestSpotSlot | null = null;

  if (slotDocumentId) {
    savedSlot = await updateSlot(slotDocumentId, data);
  } else {
    savedSlot = await createSlot(data);
  }

  if (savedSlot) {
    await initializeFormFromSlot(savedSlot);
  }
};

const handleSaveClick = () => {
  slotFormRef.value?.submit();
};

const normalizePricingOptions = (options: IGuestSpotSlotForm['pricingOptions']) =>
  [...options]
    .map((option) => ({
      type: option.type,
      amount: option.amount,
      description: option.description ?? '',
    }))
    .sort((a, b) => a.type.localeCompare(b.type));

const normalizeOpeningHours = (hours: IGuestSpotSlotForm['openingHours']) =>
  [...hours]
    .map((hour) => ({
      day: hour.day,
      start: hour.start ?? '',
      end: hour.end ?? '',
    }))
    .sort((a, b) =>
      a.day.localeCompare(b.day) ||
      a.start.localeCompare(b.start) ||
      a.end.localeCompare(b.end),
    );

const normalizeFormForComparison = (form: IGuestSpotSlotForm) => ({
  title: form.title ?? '',
  description: form.description,
  depositAmount: form.depositAmount,
  spaces: form.spaces,
  pricingOptions: normalizePricingOptions(form.pricingOptions),
  openingHours: normalizeOpeningHours(form.openingHours),
});

const areFormsEqual = (a: IGuestSpotSlotForm, b: IGuestSpotSlotForm) =>
  JSON.stringify(normalizeFormForComparison(a)) === JSON.stringify(normalizeFormForComparison(b));

const handleToggleEnabled = async (enabled: boolean) => {
  if (!user.value?.documentId) {
    return;
  }

  const success = await toggleEnabled(user.value.documentId, enabled);
  if (success) {
    isEnabled.value = user.value.guestSpotEnabled ?? enabled;
    if (enabled) {
      await loadUserSlots();
    }
  }
};

const hasChanges = computed(() => {
  const formInstance = slotFormRef.value;
  if (!formInstance || !initialFormSnapshot.value) {
    return false;
  }

  return !areFormsEqual(formInstance.formData.value, initialFormSnapshot.value);
});

watch(
  () => user.value?.guestSpotEnabled,
  (guestSpotEnabled) => {
    if (guestSpotEnabled !== undefined) {
      isEnabled.value = guestSpotEnabled;
      if (guestSpotEnabled) {
        void loadUserSlots();
      }
    }
  },
  { immediate: true },
);

watch(
  () => user.value?.documentId,
  async (documentId) => {
    if (documentId) {
      await loadUserSlots();
    }
  },
  { immediate: true },
);

watch(
  slots,
  (newSlots) => {
    const firstSlot = newSlots?.[0] ?? null;
    void initializeFormFromSlot(firstSlot);
  },
  { immediate: true },
);

onMounted(async () => {
  if (user.value?.documentId) {
    isEnabled.value = user.value.guestSpotEnabled ?? false;
    await loadUserSlots();
  }
});
</script>

<style scoped lang="scss">
.guest-spot-management {
  width: 100%;
}

.toggle-section {
  width: 100%;
}

.content-wrapper {
  padding-bottom: 100px;
}
</style>
