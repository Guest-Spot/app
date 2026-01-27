<template>
  <div class="guest-spot-slot-form">
    <q-form @submit="handleSubmit" class="q-gap-md">
      <!-- Description -->
      <q-input
        v-model="formData.description"
        label="Description"
        type="textarea"
        rows="4"
        :rules="[(val) => !!val || 'Description is required']"
        outlined
        class="q-mb-md"
      />

      <!-- Pricing Options -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Pricing Options</div>
        <div v-for="(option, index) in formData.pricingOptions" :key="index" class="q-mb-md">
          <q-card class="bg-block">
            <q-card-section>
              <div class="row q-gap-md">
                <q-select
                  v-model="option.type"
                  :options="pricingTypeOptions"
                  label="Type"
                  outlined
                  dense
                  class="col"
                />
                <q-input
                  v-model.number="option.amount"
                  label="Amount ($)"
                  type="number"
                  step="0.01"
                  min="0"
                  outlined
                  dense
                  class="col"
                  :rules="[(val) => val > 0 || 'Amount must be greater than 0']"
                />
              </div>
              <q-input
                v-model="option.description"
                label="Description (optional)"
                outlined
                dense
                class="q-mt-sm"
              />
              <q-btn
                flat
                color="negative"
                icon="delete"
                size="sm"
                @click="removePricingOption(index)"
                class="q-mt-sm"
              >
                Remove
              </q-btn>
            </q-card-section>
          </q-card>
        </div>
        <q-btn
          outline
          color="primary"
          icon="add"
          label="Add Pricing Option"
          @click="addPricingOption"
          class="q-mt-sm"
        />
      </div>

      <!-- Deposit Amount -->
      <q-input
        v-model.number="formData.depositAmount"
        label="Deposit Amount ($)"
        type="number"
        step="0.01"
        min="0"
        :rules="[(val) => val > 0 || 'Deposit amount must be greater than 0']"
        outlined
        class="q-mb-md"
      />

      <!-- Spaces -->
      <q-input
        v-model.number="formData.spaces"
        label="Available Spaces"
        type="number"
        min="1"
        :rules="[(val) => val > 0 || 'Spaces must be greater than 0']"
        outlined
        class="q-mb-md"
      />

      <!-- Opening Hours -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">Opening Hours</div>
        <WorkingHoursEditor v-model="formData.openingHours" />
      </div>

      <!-- Actions -->
      <div class="flex q-gap-sm justify-end">
        <q-btn flat label="Cancel" @click="$emit('cancel')" />
        <q-btn
          type="submit"
          color="primary"
          :label="isEditing ? 'Update Slot' : 'Create Slot'"
          :loading="loading"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IGuestSpotSlotForm, IOpeningHours } from 'src/interfaces/guestSpot';
import { EGuestSpotPricingType } from 'src/interfaces/enums';
import WorkingHoursEditor from 'src/components/Profile/WorkingHoursEditor.vue';

interface Props {
  slotData?: IGuestSpotSlotForm | null;
  loading?: boolean;
  originalOpeningHours?: IOpeningHours[];
}

const props = withDefaults(defineProps<Props>(), {
  slot: null,
  loading: false,
  originalOpeningHours: () => [],
});

const emit = defineEmits<{
  submit: [data: IGuestSpotSlotForm];
  cancel: [];
}>();

const pricingTypeOptions = [
  { label: 'Hourly', value: EGuestSpotPricingType.Hourly },
  { label: 'Daily', value: EGuestSpotPricingType.Daily },
  { label: 'Flat', value: EGuestSpotPricingType.Flat },
];

const formData = ref<IGuestSpotSlotForm>({
  description: '',
  pricingOptions: [],
  depositAmount: 0,
  spaces: 1,
  openingHours: [],
});

const isEditing = computed(() => !!props.slotData);

watch(
  () => props.slotData,
  (slot) => {
    if (slot) {
      formData.value = {
        description: slot.description,
        pricingOptions: slot.pricingOptions.map((opt) => ({
          ...opt,
          amount: opt.amount / 100, // Convert cents to dollars
        })),
        depositAmount: slot.depositAmount / 100, // Convert cents to dollars
        spaces: slot.spaces,
        openingHours: slot.openingHours,
      };
    } else {
      formData.value = {
        description: '',
        pricingOptions: [],
        depositAmount: 0,
        spaces: 1,
        openingHours: [],
      };
    }
  },
  { immediate: true },
);

const addPricingOption = () => {
  formData.value.pricingOptions.push({
    type: EGuestSpotPricingType.Flat,
    amount: 0,
    description: '',
  });
};

const removePricingOption = (index: number) => {
  formData.value.pricingOptions.splice(index, 1);
};

const handleSubmit = () => {
  const data: IGuestSpotSlotForm = {
    description: formData.value.description,
    pricingOptions: formData.value.pricingOptions.map((opt) => ({
      type: opt.type,
      amount: Math.round(opt.amount * 100), // Convert dollars to cents
      description: opt.description || null,
    })),
    depositAmount: Math.round(formData.value.depositAmount * 100), // Convert dollars to cents
    spaces: formData.value.spaces,
    openingHours: formData.value.openingHours,
  };
  emit('submit', data);
};
</script>

<style scoped lang="scss">
.guest-spot-slot-form {
  width: 100%;
}
</style>
