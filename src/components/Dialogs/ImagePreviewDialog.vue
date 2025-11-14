<template>
  <q-dialog v-model="dialogModel" maximized no-route-dismiss>
    <q-card class="full-width full-height image-preview-dialog flex column justify-between">
      <!-- Header -->
      <q-card-section class="row items-center dialog-header bg-block">
        <div class="text-h6">{{ 'Image Preview' }}</div>
        <q-space />
        <q-btn
          icon="close"
          round
          dense
          text-color="primary"
          class="bg-block"
          unelevated
          v-close-popup
        />
      </q-card-section>

      <!-- Image Container -->
      <q-card-section class="q-pt-none image-container" ref="imageContainer">
        <div class="full-width full-height flex justify-center items-center">
          <!-- Normal Preview Mode -->
          <Cropper
            v-if="isCropMode && imageSrc"
            ref="cropperRef"
            :src="imageSrc"
            auto-zoom
            :default-boundaries="defaultBoundaries"
            image-restriction="fit-area"
            class="cropper-component"
          />
          <q-img
            v-else-if="imagePreview"
            ref="imageRef"
            :src="imagePreview"
            fit="contain"
            spinner-size="lg"
            spinner-color="dark"
            class="full-width full-height preview-image"
            :class="{ zoomed: isZoomed }"
            :style="imageStyle"
            @click="!isZoomed ? toggleZoom() : void 0"
            v-touch-pan.prevent.mouse="isZoomed ? onPan : undefined"
          />
          <div v-else class="text-grey-6 text-center">
            <q-icon name="image_not_supported" size="64px" />
            <p class="q-mt-md">{{ 'No image to display' }}</p>
          </div>
        </div>
      </q-card-section>

      <!-- Footer Actions -->
      <q-card-section class="dialog-footer q-mt-auto bg-block">
        <!-- Crop Mode Actions -->
        <div v-if="isCropMode" class="row justify-between q-gap-sm q-pb-md">
          <q-btn label="Cancel" class="bg-block" unelevated rounded @click="cancelCrop" />
          <q-btn label="Apply Crop" color="primary" unelevated rounded @click="applyCrop" />
        </div>
        <!-- Normal Mode Actions -->
        <div v-else class="row justify-center q-gap-sm q-pb-md">
          <q-btn
            v-if="allowCropping && imagePreview"
            icon="crop"
            class="bg-block"
            unelevated
            round
            @click="toggleCropMode"
          />
          <q-btn
            :icon="isZoomed ? 'zoom_out' : 'zoom_in'"
            class="bg-block"
            unelevated
            round
            @click="toggleZoom"
          />
          <q-btn
            icon="download"
            class="bg-block hidden"
            unelevated
            round
            @click="downloadImage"
            v-if="imagePreview"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import useImage from 'src/modules/useImage';

type ElementRef = HTMLElement | { $el: HTMLElement } | null;

defineOptions({
  name: 'ImagePreviewDialog',
});

interface Props {
  modelValue: boolean;
  imageSrc?: string | null;
  allowCropping?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'cropped', value: { file: File; base64: string }): void;
  (e: 'loading', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { formatFileToBase64 } = useImage();

const isZoomed = ref(false);
const imageRef = ref<ElementRef>(null);
const translateX = ref(0);
const translateY = ref(0);
const imageContainer = ref<ElementRef>(null);
const isCropMode = ref(false);
const cropperRef = ref<{
  getResult: () => { canvas: HTMLCanvasElement; coordinates: unknown };
} | null>(null);
const imagePreview = ref<string | null>(null);

// Computed style for image transform
const imageStyle = computed(() => {
  if (!isZoomed.value) return {};

  return {
    transform: `scale(1.5) translate(${translateX.value}px, ${translateY.value}px)`,
  };
});

// Cropper boundaries function to fit within screen
const defaultBoundaries = () => {
  const containerElement = imageContainer.value;
  if (!containerElement) return { width: 800, height: 600 };

  // Handle both HTMLElement and Vue component reference
  const element =
    'getBoundingClientRect' in containerElement
      ? containerElement
      : (containerElement as { $el: HTMLElement }).$el;

  const containerRect = element.getBoundingClientRect();
  const maxWidth = Math.min(containerRect.width, window.innerWidth * 0.95);
  const maxHeight = Math.min(containerRect.height, window.innerHeight * 0.7);

  return {
    width: maxWidth,
    height: maxHeight,
  };
};

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// Methods
function toggleZoom() {
  isZoomed.value = !isZoomed.value;
  if (!isZoomed.value) {
    resetPosition();
  }
}

function resetPosition() {
  translateX.value = 0;
  translateY.value = 0;
}

function downloadImage() {
  if (!imagePreview.value) return;

  const link = document.createElement('a');
  link.href = imagePreview.value;
  link.download = `image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function toggleCropMode() {
  isCropMode.value = !isCropMode.value;
  isZoomed.value = false;
  if (!isCropMode.value) {
    resetPosition();
  }
}

async function applyCrop() {
  if (!cropperRef.value) return;

  try {
    emit('loading', true);

    const { canvas } = cropperRef.value.getResult();
    if (!canvas) return;

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9);
    });

    if (!blob) return;

    // Create file from blob
    const file = new File([blob], `cropped-image-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    // Convert to base64 for preview
    const base64 = await formatFileToBase64(file);

    imagePreview.value = base64;

    emit('cropped', { file, base64 });
    isZoomed.value = false;
    isCropMode.value = false;
  } catch (error) {
    console.error('Error processing cropped image:', error);
  } finally {
    emit('loading', false);
  }
}

function cancelCrop() {
  isCropMode.value = false;
  isZoomed.value = false;
}

function getElement(elementRef: ElementRef): HTMLElement | null {
  if (!elementRef) return null;
  return (elementRef as { $el: HTMLElement }).$el || (elementRef as HTMLElement);
}

function calculateBoundaries() {
  if (!imageContainer.value || !imageRef.value) return { maxX: 0, maxY: 0, minX: 0, minY: 0 };

  try {
    const containerEl = getElement(imageContainer.value);
    const imageEl = getElement(imageRef.value);

    if (!containerEl?.getBoundingClientRect || !imageEl?.getBoundingClientRect) {
      return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
    }

    const containerRect = containerEl.getBoundingClientRect();
    const imageRect = imageEl.getBoundingClientRect();
    const scale = 1.5;

    // Calculate the boundaries based on the scaled image size vs container size
    const scaledImageWidth = imageRect.width * scale;
    const scaledImageHeight = imageRect.height * scale;

    // Calculate max translation values (how far we can move the image)
    const maxX = Math.max(0, (scaledImageWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (scaledImageHeight - containerRect.height) / 2);

    return {
      maxX,
      maxY,
      minX: -maxX,
      minY: -maxY,
    };
  } catch (error) {
    console.warn('Error calculating boundaries:', error);
    return { maxX: 0, maxY: 0, minX: 0, minY: 0 };
  }
}

function onPan(evt: { delta?: { x?: number; y?: number } }) {
  if (!isZoomed.value || !evt.delta) return;

  const { maxX, maxY, minX, minY } = calculateBoundaries();

  // Apply movement with boundaries
  const deltaX = evt.delta.x || 0;
  const deltaY = evt.delta.y || 0;

  const newX = translateX.value + deltaX;
  const newY = translateY.value + deltaY;

  translateX.value = Math.max(minX, Math.min(maxX, newX));
  translateY.value = Math.max(minY, Math.min(maxY, newY));
}

// Reset zoom and position when dialog closes
watch(dialogModel, (newValue) => {
  imagePreview.value = props.imageSrc || null;
  if (!newValue) {
    isCropMode.value = false;
    isZoomed.value = false;
    resetPosition();
    imagePreview.value = null;
  }
});
</script>

<style lang="scss" scoped>
.image-preview-dialog {
  box-shadow: none;
  min-height: calc(100vh - env(safe-area-inset-top));

  .dialog-header {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .image-container {
    padding: 0;
    overflow: hidden;
    flex: 1;

    .preview-image {
      cursor: pointer;
      transition: transform 0.3s ease;

      &.zoomed {
        cursor: grab;
        transition: none; // Disable transition during panning

        &:active {
          cursor: grabbing;
        }
      }
    }
  }

  .dialog-footer {
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  .cropper-component {
    max-width: 100vw;
    max-height: 70vh;
    width: 100%;
    height: 100%;

    // Ensure cropper doesn't overflow
    :deep(.vue-advanced-cropper__foreground),
    :deep(.vue-advanced-cropper__background) {
      background: transparent;
    }
  }
}
</style>
