<template>
  <div class="guest-spot-slot-form">
    <q-form @submit="handleSubmit" class="flex column items-start q-gap-sm full-width">
      <!-- Description -->
      <div class="flex column items-start q-gap-xs full-width">
        <label class="input-label">Description</label>
        <q-input
          v-model="formData.description"
          type="textarea"
          placeholder="Enter slot description"
          outlined
          rounded
          size="lg"
          rows="4"
          autogrow
          :rules="[(val) => !!val || 'Description is required']"
          class="full-width"
          bg-color="transparent"
        >
          <template v-slot:prepend>
            <q-icon name="description" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Spaces -->
      <div class="flex column items-start q-gap-xs full-width">
        <label class="input-label">Available Spaces</label>
        <q-input
          v-model.number="formData.spaces"
          type="number"
          placeholder="Enter number of available spaces"
          outlined
          rounded
          size="lg"
          min="1"
          :rules="[(val) => val > 0 || 'Spaces must be greater than 0']"
          class="full-width"
          bg-color="transparent"
        >
          <template v-slot:prepend>
            <q-icon name="people" color="grey-6" />
          </template>
        </q-input>
      </div>

      <!-- Pricing Options -->
      <div class="flex column items-start q-gap-xs full-width">
        <label class="input-label">Pricing</label>

        <div class="flex q-gap-md column full-width">

          <!-- Pricing Type Selector -->
          <q-select
            v-model="pricingType"
            :options="pricingTypeOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            outlined
            rounded
            size="lg"
            placeholder="Select pricing type"
            class="full-width"
            bg-color="transparent"
          >
            <template v-slot:prepend>
              <q-icon name="attach_money" color="grey-6" />
            </template>
          </q-select>

          <!-- Price Input (shown only when Hourly or Daily is selected) -->
          <div v-if="pricingType && pricingType !== 'free'" class="flex column items-start q-gap-xs full-width">
            <q-input
              v-model.number="price"
              type="number"
              :placeholder="pricingType === 'hourly' ? 'Price per hour ($)' : 'Price per day ($)'"
              outlined
              rounded
              size="lg"
              step="0.01"
              min="0"
              :rules="priceRules"
              class="full-width"
              bg-color="transparent"
            >
              <template v-slot:prepend>
                <q-icon :name="pricingType === 'hourly' ? 'schedule' : 'event'" color="grey-6" />
              </template>
            </q-input>
          </div>

          <p v-if="pricingError" class="text-negative text-caption q-mt-xs">
            {{ pricingError }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex q-gap-sm justify-end full-width q-mt-md">
        <q-btn
          flat
          label="Cancel"
          rounded
          unelevated
          class="bg-block"
          @click="$emit('cancel')"
        />
        <q-btn
          type="submit"
          color="primary"
          :label="isEditing ? 'Update Slot' : 'Create Slot'"
          :loading="loading"
          rounded
          unelevated
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IGuestSpotSlotForm } from 'src/interfaces/guestSpot';
import { EGuestSpotPricingType } from 'src/interfaces/enums';

defineOptions({
  name: 'GuestSpotSlotForm',
});

interface Props {
  slotData?: IGuestSpotSlotForm | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  slotData: null,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: IGuestSpotSlotForm];
  cancel: [];
}>();

const formData = ref<IGuestSpotSlotForm>({
  description: '',
  pricingOptions: [],
  depositAmount: 0,
  spaces: 1,
  openingHours: [],
});

const pricingType = ref<string | null>(null);
const price = ref<number | null>(null);
const pricingError = ref('');

const pricingTypeOptions = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Free', value: 'free' },
];

const priceRules = [
  (val: number | null) => {
    if (pricingType.value && pricingType.value !== 'free') {
      return (val !== null && val !== undefined && val > 0) || 'Price must be greater than 0';
    }
    return true;
  },
];

const isEditing = computed(() => !!props.slotData);

// Initialize form data from slotData if editing
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

      // Extract pricing type and price
      const hourlyOption = slot.pricingOptions.find((opt) => opt.type === EGuestSpotPricingType.Hourly);
      const dailyOption = slot.pricingOptions.find((opt) => opt.type === EGuestSpotPricingType.Daily);

      if (hourlyOption) {
        pricingType.value = 'hourly';
        price.value = hourlyOption.amount / 100;
      } else if (dailyOption) {
        pricingType.value = 'daily';
        price.value = dailyOption.amount / 100;
      } else if (slot.pricingOptions.length === 0) {
        pricingType.value = 'free';
        price.value = null;
      } else {
        pricingType.value = null;
        price.value = null;
      }
    } else {
      formData.value = {
        description: '',
        pricingOptions: [],
        depositAmount: 0,
        spaces: 1,
        openingHours: [],
      };
      pricingType.value = null;
      price.value = null;
    }
  },
  { immediate: true },
);

// Reset price when pricing type changes
watch(pricingType, (newType) => {
  if (newType === 'free') {
    price.value = null;
    pricingError.value = '';
  } else if (newType) {
    price.value = null;
    pricingError.value = '';
  }
});

const handleSubmit = () => {
  // Validate pricing
  if (!pricingType.value) {
    pricingError.value = 'Please select a pricing type';
    return;
  }

  if (pricingType.value !== 'free' && (!price.value || price.value <= 0)) {
    pricingError.value = 'Please enter a valid price';
    return;
  }

  pricingError.value = '';

  // Build pricing options
  const pricingOptions: IGuestSpotSlotForm['pricingOptions'] = [];

  if (pricingType.value === 'hourly' && price.value && price.value > 0) {
    pricingOptions.push({
      type: EGuestSpotPricingType.Hourly,
      amount: Math.round(price.value * 100), // Convert dollars to cents
      description: null,
    });
  } else if (pricingType.value === 'daily' && price.value && price.value > 0) {
    pricingOptions.push({
      type: EGuestSpotPricingType.Daily,
      amount: Math.round(price.value * 100), // Convert dollars to cents
      description: null,
    });
  }
  // If 'free', pricingOptions remains empty array

  const data: IGuestSpotSlotForm = {
    description: formData.value.description,
    pricingOptions,
    depositAmount: 0, // Set to 0 as per requirements
    spaces: formData.value.spaces,
    openingHours: [], // Empty array as per requirements
  };

  emit('submit', data);
};

// Expose component for Vetur type checking
defineExpose({});
</script>

<style scoped lang="scss">
.guest-spot-slot-form {
  width: 100%;
}

.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}
</style>
