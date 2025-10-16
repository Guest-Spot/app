<template>
  <div
    class="image-uploader border-radius-lg q-pa-sm q-gap-sm bg-block flex no-wrap items-stretch"
    :class="{
      'image-uploader--round': round,
    }"
    :style="{
      width: width ? `${width}px` : '',
      height: height ? `${height}px` : '',
    }"
  >
    <PreviewImages
      v-if="hasImages"
      :images="imagesPreview"
      :multiple="multiple"
      @open-zoom-dialog="(src, index) => zoomImage(src, index)"
      @on-remove="onRemoveImage"
    />

    <UploadForm
      v-if="(!hasImages && !multiple) || multiple"
      :multiple="multiple"
      :hint="hint"
      :rules="rules"
      :placeholder="placeholder"
      :placeholderIcon="placeholderIcon"
      :has-images="hasImages"
      @on-change="onChangeImage"
    />

    <!-- Dialog -->
    <ImagePreviewDialog
      v-model="dialog"
      :image-src="previewDialogSrc"
      :allow-cropping="allowCropping"
      @loading="isLoading = $event"
      @cropped="onImageCropped"
    />

    <!-- Loader -->
    <q-inner-loading :showing="isLoading" size="sm" style="z-index: 10" />
  </div>
</template>

<script setup lang="ts">
import useImage from 'src/modules/useImage';
import { type ValidationRule, uid } from 'quasar';
import { ref, watch, computed, type PropType } from 'vue';
import imageCompression from 'browser-image-compression';
import PreviewImages from './PreviewImages.vue';
import UploadForm from './UploadForm.vue';
import type { IPicture } from 'src/interfaces/common';

defineOptions({
  name: 'ImageUploader',
});

const emit = defineEmits(['on-upload', 'on-remove', 'on-update']);

const props = defineProps({
  images: {
    type: Array as PropType<IPicture[]>,
    default: () => [],
  },
  hint: {
    type: String,
    default: null,
  },
  round: {
    type: Boolean,
    default: false,
  },
  width: {
    type: Number,
    default: null,
  },
  height: {
    type: Number,
    default: null,
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
  allowCropping: {
    type: Boolean,
    default: true,
  },
});

const MAX_SIZE = 4096;

const { formatFileToBase64 } = useImage();

const imagesPreview = ref<IPicture[]>([]);
const isLoading = ref(false);
const dialog = ref(false);
const previewDialogSrc = ref<string | null>(null);
const currentImageIndex = ref<number | null>(null);
const imagesIdsForRemove = ref<string[]>([]);
const filesForUpload = ref<{ file: File | null; id: string }[]>([]);
const filesForUpdate = ref<{ file: File | null; id: string }[]>([]);

// Import dialog component statically
import { ImagePreviewDialog } from 'src/components/Dialogs';

const hasImages = computed(() => imagesPreview.value.length > 0);

// ---------- Methods ---------- //
function zoomImage(src: string, index?: number) {
  previewDialogSrc.value = src;
  currentImageIndex.value = index ?? null;
  dialog.value = true;
}

async function compressAndPrepare(file: File): Promise<{ file: File; base64: string } | null> {
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
  const base64 = await formatFileToBase64(compressedImage);
  return { file: compressedImage, base64 };
}

async function onChangeImage(input: File | File[]) {
  const files = Array.isArray(input) ? input : [input];
  const results = await Promise.all(files.map((f) => compressAndPrepare(f)));
  const newPreviewsList = [];
  const newFilesList = [];
  for (const [index, result] of results.entries()) {
    const id = uid();
    const newPreview = {
      url: result?.base64 || '',
      id: id,
      index: imagesPreview.value.length + index,
    };
    const newFile = {
      file: result?.file || null,
      id: id,
    };
    newPreviewsList.push(newPreview);
    newFilesList.push(newFile);
  }
  imagesPreview.value = [...imagesPreview.value, ...newPreviewsList];
  filesForUpload.value = [...filesForUpload.value, ...newFilesList];
  emit(
    'on-upload',
    filesForUpload.value.map((f) => f.file),
  );
}

function onRemoveImage(index: number) {
  const itemByIndex = imagesPreview.value.find((v) => v.index === index);
  imagesIdsForRemove.value = [...imagesIdsForRemove.value, itemByIndex?.id || ''].filter(
    (id) => !filesForUpload.value.some((f) => f.id === id),
  );
  filesForUpload.value = filesForUpload.value.filter((f) => f.id !== itemByIndex?.id);
  imagesPreview.value = imagesPreview.value.filter((v) => v.index !== index);
  emit('on-remove', imagesIdsForRemove.value);
  emit(
    'on-upload',
    filesForUpload.value.map((f) => f.file),
  );
}

function onImageCropped({ file, base64 }: { file: File; base64: string }) {
  if (currentImageIndex.value === null) return;

  // Find the image to replace
  const imageToReplace = imagesPreview.value.find((img) => img.index === currentImageIndex.value);
  if (!imageToReplace) return;

  // Update preview
  const updatedImage = { ...imageToReplace, url: base64 };

  const imageIndex = imagesPreview.value.findIndex((img) => img.index === currentImageIndex.value);
  if (imageIndex !== -1) {
    imagesPreview.value[imageIndex] = updatedImage;
  }

  // Update file for upload
  const fileIndex = filesForUpload.value.findIndex((f) => f.id === imageToReplace.id);
  if (fileIndex !== -1) {
    filesForUpload.value[fileIndex] = { file, id: filesForUpload.value[fileIndex]?.id || '' };
    emit(
      'on-upload',
      filesForUpload.value.map((f) => f.file),
    );
  } else {
    filesForUpdate.value.push({ file, id: imageToReplace.id });
    emit('on-update', filesForUpdate.value);
  }
}

watch(
  () => props.images,
  (newValue, oldValue) => {
    if (!newValue || JSON.stringify(newValue) === JSON.stringify(oldValue)) return;
    imagesPreview.value = [];
    imagesPreview.value = [...imagesPreview.value, ...newValue];
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.image-uploader {
  text-align: center;
  position: relative;
  width: 100%;
  height: 200px;
  min-height: 200px;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: stretch;

  &--zoom {
    cursor: pointer;
  }

  &--round {
    border-radius: 100%;
  }
}

.body--dark {
  .image-uploader {
    .q-field__control {
      &::before,
      &::after {
        border: 2px dashed rgba(255, 255, 255, 0.1);
      }
    }
  }
}
</style>
