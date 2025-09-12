<template>
  <div
    class="image-uploader border-radius-lg q-pa-sm q-gap-sm bg-block flex no-wrap items-stretch"
    :class="{
      'image-uploader--sm': size === 'sm',
      'image-uploader--circle': circle,
    }"
  >
    <PreviewImages
      v-if="hasImages"
      :images="imagesPreview"
      :multiple="multiple"
      @open-zoom-dialog="zoomImage"
    />

    <UploadForm
      :multiple="multiple"
      :hint="hint"
      :rules="rules"
      :placeholder="placeholder"
      :placeholderIcon="placeholderIcon"
      :has-images="hasImages"
      @on-change="onChangeImage"
    />

    <!-- Dialog -->
    <ImagePreviewDialog v-model="dialog" :image-src="previewDialogSrc" @loading="isLoading = $event" />

    <!-- Loader -->
    <q-inner-loading :showing="isLoading" size="sm" style="z-index: 10" />
  </div>
</template>

<script setup lang="ts">
import useImage from 'src/modules/useImage';
import { type ValidationRule } from 'quasar';
import { ref, watch, computed, type PropType } from 'vue';
import imageCompression from 'browser-image-compression';
import PreviewImages from 'src/components/ImageUploader/PreviewImages.vue';
import UploadForm from 'src/components/ImageUploader/UploadForm.vue';

defineOptions({
  name: 'ImageUploader',
});

defineEmits(['clear', 'on-change']);

const props = defineProps({
  images: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
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
});

const MAX_SIZE = 4096;
type ImagePreviewItem = { src: string; index: number };

const { formatFileToBase64 } = useImage();

const imagesPreview = ref<ImagePreviewItem[]>([]);
const isLoading = ref(false);
const dialog = ref(false);
const previewDialogSrc = ref<string | null>(null);
const newFiles = ref<File[]>([]);

// Import dialog component statically
import { ImagePreviewDialog } from 'src/components/Dialogs';

const hasImages = computed(() => imagesPreview.value.length > 0);

// ---------- Methods ---------- //
function zoomImage(src: string) {
  previewDialogSrc.value = src;
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
  const newPreviews = results.map((v, index) => ({
    src: v?.base64 || '',
    index: imagesPreview.value.length + index,
  }));

  imagesPreview.value = [...imagesPreview.value, ...newPreviews];
  newFiles.value = [
    ...newFiles.value,
    ...results.map((v) => v?.file || null),
  ].filter((v): v is File => v !== null);
}

watch(
  () => props.images,
  (newValue, oldValue) => {
    if (!newValue || newValue === oldValue) return;
    const newImagePreviews = newValue.map((src, index) => ({
      src: src || '',
      index: imagesPreview.value.length + index
    }));
    imagesPreview.value = [...imagesPreview.value, ...newImagePreviews];
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
  height: 100%;
  min-height: 200px;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: stretch;

  &--sm {
    width: 30px;
    min-width: 30px;
    height: 30px;
    min-height: 30px;
    border-radius: var(--border-radius-xs);

    span {
      font-size: 16px;
      line-height: normal;
    }
  }

  &--zoom {
    cursor: pointer;
  }

  &--circle {
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
