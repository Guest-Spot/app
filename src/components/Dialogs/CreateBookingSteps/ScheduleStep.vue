<template>
  <div class="step-content">
    <q-form ref="formRef" class="schedule-form flex column q-gap-lg">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">Day</label>
          <q-input
            v-model="dayModel"
            outlined
            dense
            rounded
            placeholder="Select a day"
            readonly
            :rules="[rules.required('Day')]"
            @click.stop="dateProxy?.show()"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" @click.stop="dateProxy?.show()" />
            </template>
            <q-popup-proxy ref="dateProxy" cover transition-show="scale" transition-hide="scale">
              <q-date
                v-model="dayModel"
                mask="YYYY-MM-DD"
                class="bg-block"
                @update:model-value="() => dateProxy?.hide()"
              />
            </q-popup-proxy>
          </q-input>
        </div>

        <div class="input-group">
          <label class="input-label">Start Time</label>
          <q-input
            v-model="startTimeModel"
            outlined
            dense
            rounded
            placeholder="Select start time"
            readonly
            :rules="[rules.required('Start time')]"
            @click.stop="startTimeProxy?.show()"
          >
            <template #append>
              <q-icon name="schedule" class="cursor-pointer" @click.stop="startTimeProxy?.show()" />
            </template>
            <q-popup-proxy
              ref="startTimeProxy"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time
                v-model="startTimeModel"
                format24h
                class="bg-block"
                @update:model-value="() => startTimeProxy?.hide()"
              />
            </q-popup-proxy>
          </q-input>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import type { QForm } from 'quasar';

type Rules = {
  required: (field: string) => (val: string | null | undefined) => true | string;
};

const props = defineProps({
  day: {
    type: String,
    default: '',
  },
  startTime: {
    type: String,
    default: '',
  },
  rules: {
    type: Object as PropType<Rules>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'update:day', value: string): void;
  (e: 'update:startTime', value: string): void;
}>();

const formRef = ref<QForm | null>(null);
const dateProxy = ref();
const startTimeProxy = ref();

const dayModel = computed({
  get: () => props.day,
  set: (val: string) => emit('update:day', val),
});

const startTimeModel = computed({
  get: () => props.startTime,
  set: (val: string) => emit('update:startTime', val),
});

const validateForm = () => formRef.value?.validate();
const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
  dateProxy.value?.hide?.();
  startTimeProxy.value?.hide?.();
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

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
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
