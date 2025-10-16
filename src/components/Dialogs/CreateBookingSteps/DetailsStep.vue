<template>
  <div class="step-content">
    <q-form ref="formRef" class="details-form flex column">
      <!-- Reference Pictures Section -->
      <div class="input-group">
        <label class="input-label">Reference Pictures</label>
        <ImageUploader
          :key="uploaderKey"
          placeholder="Attach reference pictures"
          placeholder-icon="image"
          multiple
          @on-upload="onReferenceUpload"
        />
      </div>

      <!-- Contact Information Section -->
      <q-expansion-item
        default-opened
        icon="contact_phone"
        label="Contact Information"
        header-class="expansion-header"
        class="bg-block border-radius-lg"
      >
        <div class="info-section">
          <div class="input-grid">
            <div class="input-group">
              <label class="input-label">Name</label>
              <q-input
                v-model="nameModel"
                outlined
                dense
                rounded
                placeholder="Enter your name"
                :rules="[rules.required('Name')]"
              />
            </div>
            <div class="input-group">
              <label class="input-label">Email</label>
              <q-input
                v-model="emailModel"
                outlined
                dense
                rounded
                placeholder="Enter your email"
                :rules="[rules.required('Email'), rules.email]"
              />
            </div>
            <div class="input-group">
              <label class="input-label">Phone</label>
              <q-input
                v-model="phoneModel"
                outlined
                dense
                rounded
                mask="+(###) ### - ####"
                placeholder="Enter your phone"
                :rules="[rules.required('Phone')]"
              />
            </div>
          </div>
        </div>
      </q-expansion-item>

      <!-- Tattoo Details Section -->
      <q-expansion-item
        default-opened
        icon="palette"
        label="Tattoo Details"
        header-class="expansion-header"
        class="bg-block border-radius-lg"
      >
        <div class="info-section">
          <div class="input-group">
            <label class="input-label">Your idea</label>
            <q-input
              v-model="descriptionModel"
              outlined
              dense
              rounded
              type="textarea"
              rows="4"
              placeholder="Describe your idea"
              :rules="[rules.required('Description')]"
            />
          </div>

          <div class="input-grid">
            <div class="input-group">
              <label class="input-label">Tattoo placement</label>
              <q-input
                v-model="placementModel"
                outlined
                dense
                rounded
                placeholder="Where on your body?"
                :rules="[rules.required('Body placement')]"
              />
            </div>
            <div class="input-group">
              <label class="input-label">Tattoo size</label>
              <q-input
                v-model="sizeModel"
                outlined
                dense
                rounded
                placeholder="Approximate size"
                :rules="[rules.required('Size')]"
              />
            </div>
          </div>
        </div>
      </q-expansion-item>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue';
import type { QForm } from 'quasar';
import ImageUploader from 'src/components/ImageUploader/index.vue';

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
  (e: 'update:description', value: string): void;
  (e: 'update:placement', value: string): void;
  (e: 'update:size', value: string): void;
  (e: 'update:referenceFiles', value: (File | null)[]): void;
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

const uploaderKey = ref(0);

const onReferenceUpload = (files: (File | null)[]) => {
  emit('update:referenceFiles', files);
};

const validateForm = () => formRef.value?.validate();
const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
  uploaderKey.value += 1;
  emit('update:referenceFiles', []);
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

.info-section {
  padding: 16px;
}

.input-group {
  width: 100%;
}

.input-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.input-label {
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}
</style>
