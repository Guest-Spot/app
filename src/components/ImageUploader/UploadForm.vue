<template>
  <div
    v-ripple
    class="upload-form relative-position"
    :class="{
      'upload-form--round': round,
    }"
  >
    <q-file
      outlined
      :model-value="null"
      :hint="hint || undefined"
      :rules="rules"
      @update:model-value="onChangeImage"
      :multiple="multiple"
      :accept="ALLOWED_FORMATS.join(', ')"
    >
      <div class="upload-form_placeholder">
        <q-icon :name="placeholderIcon" size="42px" color="grey-6" />
        <p v-if="!hasImages" class="text-grey-6 q-mt-sm q-mb-none text-center">{{ placeholder }}</p>
      </div>
    </q-file>

    <div v-if="!hasImages" class="upload-form_hint text-grey-7 text-caption text-center q-mt-sm">
      <b>Max size:</b> {{ MAX_SIZE_MB }}MB, <b>Formats:</b> {{ DISPLAY_ALLOWED_FORMATS.join(', ') }}
    </div>

    <!-- Open camera button (mobile only) -->
    <q-btn
      v-if="isMobile && isNative && ENABLED_FORCE_OPEN_CAMERA"
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
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import imageCompression from 'browser-image-compression';
import useNotify from 'src/modules/useNotify';

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const DISPLAY_ALLOWED_FORMATS = ['JPG', 'PNG', 'WEBP', 'HEIC'];
const MAX_SIZE = 4096;
const MAX_SIZE_MB = Math.round(MAX_SIZE / 1024);
const ENABLED_FORCE_OPEN_CAMERA = false;

defineOptions({
  name: 'UploadForm',
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  size: {
    type: String,
    default: null,
  },
  hint: {
    type: String,
    default: null,
  },
  round: {
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
const { showError } = useNotify();

const isMobile = $q.platform.is.mobile;
const isNative = Capacitor.isNativePlatform();
const uploadedFiles = ref<File[]>([]);

async function compressImage(file: File): Promise<File | null> {
  const fileSize = file.size / 1024;
  if (fileSize >= MAX_SIZE) {
    showError(`File size is too large. Max ${MAX_SIZE_MB}MB`);
    return null;
  }

  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  };
  const compressedImage = await imageCompression(file, options);
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
    showError('Failed to upload image');
  } finally {
    emit('loading', false);
  }
}

// Convert base64 to File object
function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch?.[1] || 'image/jpeg';
  const bstr = atob(arr[1] || '');
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

async function openCamera() {
  try {
    // Request camera permissions and capture photo
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    if (photo.base64String) {
      const base64Image = `data:image/${photo.format};base64,${photo.base64String}`;
      const file = base64ToFile(base64Image, `camera-${Date.now()}.${photo.format}`);
      await onChangeImage(file);
    }
  } catch (error) {
    console.error('Camera error:', error);
    showError('Failed to capture photo');
  }
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
  border-radius: inherit;

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

  &--round {
    border-radius: 100%;
  }

  &_hint {
    font-size: 10px;
  }
}

:deep(.q-file) {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: inherit;

  .q-field__inner {
    border-radius: inherit;
  }

  .q-field__control {
    height: 100%;
    padding-top: 5px;
    padding-bottom: 5px;
    justify-content: center;
    position: relative;
    border-radius: inherit;

    &::before,
    &::after {
      border: 2px dashed rgba(0, 0, 0, 0.1);
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
