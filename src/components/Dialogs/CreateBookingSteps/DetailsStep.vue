<template>
  <div class="step-content">
    <q-form ref="formRef" class="details-form flex column">
      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">My Name</label>
          <q-input
            v-model="nameModel"
            outlined
            rounded
            placeholder="Enter your name"
            :rules="[rules.required('Name')]"
          />
        </div>
        <div class="input-group">
          <label class="input-label">My Email</label>
          <q-input
            v-model="emailModel"
            outlined
            rounded
            placeholder="Enter your email"
            :rules="[rules.required('Email'), rules.email]"
          />
        </div>
        <div class="input-group">
          <label class="input-label">My Phone</label>
          <q-input
            v-model="phoneModel"
            outlined
            rounded
            placeholder="Enter your phone"
            :rules="[rules.required('Phone')]"
          />
        </div>
        <div class="input-group">
          <label class="input-label">My Location</label>
          <q-input
            v-model="locationModel"
            outlined
            rounded
            placeholder="City, country"
          />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Idea Description</label>
        <q-input
          v-model="descriptionModel"
          outlined
          rounded
          type="textarea"
          rows="4"
          placeholder="Describe your idea"
          :rules="[rules.required('Description')]"
        />
      </div>

      <div class="input-grid">
        <div class="input-group">
          <label class="input-label">Body Placement</label>
          <q-input
            v-model="placementModel"
            outlined
            rounded
            placeholder="Where on your body?"
            :rules="[rules.required('Body placement')]"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Size</label>
          <q-input
            v-model="sizeModel"
            outlined
            rounded
            placeholder="Approximate size"
            :rules="[rules.required('Size')]"
          />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label">Reference Pictures</label>
        <q-file
          v-model="referencesModel"
          outlined
          rounded
          multiple
          use-chips
          counter
          accept="image/*"
          :hint="referenceHint"
          :counter-label="fileCounterLabel"
        >
          <template #prepend>
            <q-icon name="image" />
          </template>
        </q-file>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import type { QForm } from 'quasar';

type Rules = {
  required: (field: string) => (val: string | null | undefined) => true | string;
  email: (val: string | null | undefined) => true | string;
};

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  placement: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: '',
  },
  referenceFiles: {
    type: Array as PropType<File[]>,
    default: () => [],
  },
  rules: {
    type: Object as PropType<Rules>,
    required: true,
  },
  referenceHint: {
    type: String,
    default: 'Add any inspiration images',
  },
});

const emit = defineEmits<{
  (e: 'update:name', value: string): void;
  (e: 'update:email', value: string): void;
  (e: 'update:phone', value: string): void;
  (e: 'update:location', value: string): void;
  (e: 'update:description', value: string): void;
  (e: 'update:placement', value: string): void;
  (e: 'update:size', value: string): void;
  (e: 'update:referenceFiles', value: File[]): void;
}>();

const formRef = ref<QForm | null>(null);

const nameModel = computed({
  get: () => props.name,
  set: (val: string) => emit('update:name', val),
});
const emailModel = computed({
  get: () => props.email,
  set: (val: string) => emit('update:email', val),
});
const phoneModel = computed({
  get: () => props.phone,
  set: (val: string) => emit('update:phone', val),
});
const locationModel = computed({
  get: () => props.location,
  set: (val: string) => emit('update:location', val),
});
const descriptionModel = computed({
  get: () => props.description,
  set: (val: string) => emit('update:description', val),
});
const placementModel = computed({
  get: () => props.placement,
  set: (val: string) => emit('update:placement', val),
});
const sizeModel = computed({
  get: () => props.size,
  set: (val: string) => emit('update:size', val),
});

const referencesModel = computed({
  get: () => (props.referenceFiles.length ? props.referenceFiles : null),
  set: (value: File | File[] | null) => {
    if (!value) {
      emit('update:referenceFiles', []);
    } else if (Array.isArray(value)) {
      emit('update:referenceFiles', value);
    } else {
      emit('update:referenceFiles', [value]);
    }
  },
});

const fileCounterLabel = ({ filesNumber }: { filesNumber: number }) =>
  filesNumber ? `${filesNumber} selected` : '';

const validateForm = () => formRef.value?.validate();
const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
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
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.details-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
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
