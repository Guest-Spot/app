<template>
  <div
    class="image-uploader border-radius-lg q-pa-sm q-gap-sm bg-block flex no-wrap items-stretch"
    :class="{
      'image-uploader--sm': size === 'sm',
      'image-uploader--circle': circle,
    }"
  >
    <template v-if="hasImages">
      <PreviewImages
        v-if="hasImages"
        :images="imagesPreview"
        :multiple="multiple"
        @open-zoom-dialog="zoomImage"
      />
    </template>

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
import { ref, toRefs, watch, computed, type PropType } from 'vue';
import PreviewImages from 'src/components/ImageUploader/PreviewImages.vue';
import UploadForm from 'src/components/ImageUploader/UploadForm.vue';

defineOptions({
  name: 'ImageUploader',
});

defineEmits(['clear', 'on-change']);

const props = defineProps({
  image: {
    type: [File, String],
    default: null,
  },
  images: {
    type: Array as PropType<(File | string)[]>,
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

const { image, images, multiple } = toRefs(props);
const { formatFileToBase64 } = useImage();

const isUrlString = (value: unknown): value is string => {
  return typeof value === 'string';
};

const imagePreview = ref<string>('');
type ImagePreviewItem = { src: string; index: number };
const imagesPreview = ref<ImagePreviewItem[]>([]);
const isLoading = ref(false);
const dialog = ref(false);
const previewDialogSrc = ref<string | null>(null);

// Import dialog component statically
import { ImagePreviewDialog } from 'src/components/Dialogs';

const hasImages = computed(() => {
  return multiple.value ? imagesPreview.value.length > 0 : !!imagePreview.value;
});

// ---------- Methods ---------- //
function zoomImage(src?: string) {
  previewDialogSrc.value = src || imagePreview.value;
  dialog.value = true;
}

function onChangeImage(input: File | File[]) {
  console.log(input);
}

watch(
  image,
  async (newValue, oldValue) => {
    if (!newValue || newValue === oldValue) return;
    if (isUrlString(newValue)) {
      imagePreview.value = newValue;
    } else if (newValue instanceof File) {
      imagePreview.value = await formatFileToBase64(newValue);
    }
  },
  {
    immediate: true,
  },
);

watch(
  images,
  async (newValue, oldValue) => {
    if (!newValue || newValue === oldValue) return;
    imagesPreview.value = await Promise.all(
      [...imagesPreview.value, ...newValue].map(async (v, index) => {
        const src = isUrlString(v) ? v : await formatFileToBase64(v as File);
        return { src, index };
      }),
    );
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
