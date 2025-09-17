<template>
  <div
    class="image-uploader border-radius-lg q-pa-sm q-gap-sm bg-block flex no-wrap items-stretch"
    :class="{
      'image-uploader--round': round,
    }"
    :style="{
      width: width ? `${width}px` :  '',
      height: height ? `${height}px` : '',
    }"
  >
    <PreviewImages
      v-if="hasImages"
      :images="imagesPreview"
      :multiple="multiple"
      @open-zoom-dialog="zoomImage"
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
      @loading="isLoading = $event"
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
import PreviewImages from 'src/components/ImageUploader/PreviewImages.vue';
import UploadForm from 'src/components/ImageUploader/UploadForm.vue';
import type { IPicture } from 'src/interfaces/common';

defineOptions({
  name: 'ImageUploader',
});

const emit = defineEmits(['on-change', 'on-remove']);

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
});

const MAX_SIZE = 4096;

const { formatFileToBase64 } = useImage();

const imagesPreview = ref<IPicture[]>([]);
const isLoading = ref(false);
const dialog = ref(false);
const previewDialogSrc = ref<string | null>(null);
const imagesIdsForRemove = ref<string[]>([]);
const filesForUpload = ref<{ file: File | null; id: string }[]>([]);

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
    'on-change',
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
}

watch(
  () => props.images,
  (newValue, oldValue) => {
    if (!newValue.length || newValue === oldValue) return;
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
