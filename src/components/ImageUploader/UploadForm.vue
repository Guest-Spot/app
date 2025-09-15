<template>
  <div class="upload-form relative-position" v-ripple>
    <q-file
      outlined
      :model-value="null"
      :hint="hint || undefined"
      :rules="rules"
      @update:model-value="onChangeImage"
      :multiple="multiple"
      accept="image/*"
    >
      <div class="upload-form_placeholder">
        <q-icon :name="placeholderIcon" size="32px" color="grey-6" />
        <p v-if="!hasImages" class="text-grey-6 q-mt-sm">{{ placeholder }}</p>
      </div>
    </q-file>

    <!-- Hidden camera input -->
    <input
      ref="cameraInput"
      type="file"
      accept="image/*"
      capture="environment"
      @change="onCameraSelected"
      style="display: none"
    />

    <!-- Open camera button (mobile only) -->
    <q-btn
      v-if="isMobile"
      round
      size="sm"
      icon="camera_alt"
      text-color="primary"
      unelevated
      class="absolute-bottom-right q-mr-md q-mb-md bg-block"
      @click.stop="openCamera"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { type ValidationRule, useQuasar } from 'quasar';
import imageCompression from 'browser-image-compression';

const MAX_SIZE = 4096;

defineOptions({
  name: 'UploadForm',
});

const props = defineProps({
  size: {
    type: String,
    default: null,
  },
  hint: {
    type: String,
    default: null,
  },
  circle: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array as PropType<ValidationRule[]>,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: 'Upload image',
  },
  placeholderIcon: {
    type: String,
    default: 'image',
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  hasImages: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['on-change', 'loading']);

const $q = useQuasar();

const isMobile = $q.platform.is.mobile;
const cameraInput = ref<HTMLInputElement | null>(null);
const uploadedFiles = ref<File[]>([]);

async function compressImage(file: File): Promise<File | null> {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };
  const compressedImage = await imageCompression(file, options);
  const fileSize = compressedImage.size / 1000;
  if (fileSize >= MAX_SIZE) {
    console.error('File size is too large');
    return null;
  }
  return compressedImage;
}

async function onChangeImage(input: File | File[]) {
  emit('loading', true);
  try {
    const files = Array.isArray(input) ? input : [input];
    const results = await Promise.all(files.map((f) => compressImage(f)));

    uploadedFiles.value = results.filter((f): f is File => f !== null);

    emit('on-change', uploadedFiles.value);
  } catch (error) {
    console.error(error);
  } finally {
    emit('loading', false);
  }
}

function openCamera() {
  if (cameraInput.value) {
    cameraInput.value.click();
  }
}

async function onCameraSelected(event: Event) {
  const fileList = (event.target as HTMLInputElement | null)?.files;
  if (!fileList || fileList.length === 0) return;
  if (props.multiple) {
    await onChangeImage(Array.from(fileList));
  } else {
    const file = fileList.item(0);
    if (!file) return;
    await onChangeImage(file);
  }
  (event.target as HTMLInputElement).value = '';
}
</script>

<style lang="scss" scoped>
.upload-form {
  width: 100%;
  min-width: 120px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 20px;

  :deep(.q-field) {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.q-field__inner) {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(.q-field__control) {
    height: 100%;
    flex: 1;
  }
}

:deep(.q-file) {
  width: 100%;
  height: 100%;
  position: relative;

  .q-field__control {
    height: 100%;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    position: relative;

    &::before,
    &::after {
      border: 2px dashed rgba(0, 0, 0, 0.1);
      border-radius: 20px;
    }

    .q-field__append {
      position: absolute;
      top: 0;
      right: 16px;
    }
  }

  .upload-form_placeholder {
    font-size: 16px;
    font-weight: bold;
    opacity: 0.5;
    display: flex;
    align-items: center;
    flex-direction: column;
    pointer-events: none;
    user-select: none;
    color: var(--text-black);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
