<template>
  <div class="step-content">
    <q-form ref="formRef" class="date-form flex column q-gap-lg">
      <div class="input-group">
        <label class="input-label">Date</label>
        <q-input
          v-model="dateModel"
          outlined
          dense
          rounded
          placeholder="Select a date"
          readonly
          :rules="[rules.required('Date')]"
          @click.stop="dateProxy?.show()"
        >
          <template #append>
            <q-icon name="event" class="cursor-pointer" @click.stop="dateProxy?.show()" />
          </template>
          <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
            <q-date
              v-model="dateModel"
              mask="YYYY-MM-DD"
              class="bg-block"
              :options="isDateAllowed"
              @update:model-value="() => dateProxy?.hide()"
            />
          </q-popup-proxy>
        </q-input>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import type { QForm } from 'quasar';
import type { IOpeningHours } from 'src/interfaces/common';

type Rules = {
  required: (field: string) => (val: string | null | undefined) => true | string;
};

const props = defineProps({
  date: {
    type: String,
    default: '',
  },
  openingHours: {
    type: Array as PropType<IOpeningHours[]>,
    default: () => [],
  },
  rules: {
    type: Object as PropType<Rules>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:date', value: string): void;
}>();

const formRef = ref<QForm | null>(null);
const dateProxy = ref();

const dateModel = computed({
  get: () => props.date,
  set: (val: string) => emit('update:date', val),
});

const isDateAllowed = (date: string) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  
  // Only allow future dates
  if (selected < today) {
    return false;
  }

  // If opening hours are provided, check if the selected day has available hours
  if (props.openingHours.length > 0) {
    const dayOfWeek = selected.getDay();
    const dayKeys: Record<number, IOpeningHours['day']> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat',
    };
    const dayKey = dayKeys[dayOfWeek];
    const dayHours = props.openingHours.find((h) => h.day === dayKey);
    
    // If no opening hours for this day, allow it (shop might be flexible)
    if (!dayHours) return true;
    
    // If opening hours exist but no start/end, don't allow
    if (!dayHours.start || !dayHours.end) return false;
    
    return true;
  }

  return true;
};

const validateForm = async () => {
  return await formRef.value?.validate();
};

const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
  dateProxy.value?.hide?.();
};

defineExpose({
  validateForm,
  resetForm,
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
