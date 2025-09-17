<template>
  <q-dialog v-model="dialogModel" maximized>
    <q-card class="full-width full-height image-preview-dialog flex column justify-between">
      <!-- Header -->
      <q-card-section class="row items-center dialog-header bg-block">
        <div class="text-h6">{{ 'Image Preview' }}</div>
        <q-space />
        <q-btn
          icon="close"
          round
          dense
          size="sm"
          text-color="primary"
          class="bg-block"
          unelevated
          v-close-popup
        />
      </q-card-section>

      <!-- Image Container -->
      <q-card-section class="q-pt-none image-container" ref="imageContainer">
        <div class="full-width full-height flex justify-center items-center">
          <q-img
            v-if="imageSrc"
            ref="imageRef"
            :src="imageSrc"
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
        <div class="row justify-center q-gap-sm">
          <q-btn
            :icon="isZoomed ? 'zoom_out' : 'zoom_in'"
            :label="isZoomed ? 'Zoom Out' : 'Zoom In'"
            class="bg-block"
            unelevated
            rounded
            @click="toggleZoom"
          />
          <q-btn
            icon="download"
            label="Download"
            class="bg-block"
            unelevated
            rounded
            @click="downloadImage"
            v-if="imageSrc"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type ElementRef = HTMLElement | { $el: HTMLElement } | null;

defineOptions({
  name: 'ImagePreviewDialog',
});

interface Props {
  modelValue: boolean;
  imageSrc?: string | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isZoomed = ref(false);
const translateX = ref(0);
const translateY = ref(0);
const imageContainer = ref<ElementRef>(null);
const imageRef = ref<ElementRef>(null);

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// Computed style for image transform
const imageStyle = computed(() => {
  if (!isZoomed.value) return {};

  return {
    transform: `scale(1.5) translate(${translateX.value}px, ${translateY.value}px)`,
  };
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

function getElement(elementRef: ElementRef): HTMLElement | null {
  if (!elementRef) return null;
  return (elementRef as { $el: HTMLElement }).$el || elementRef as HTMLElement;
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

function downloadImage() {
  if (!props.imageSrc) return;

  const link = document.createElement('a');
  link.href = props.imageSrc;
  link.download = `image-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Reset zoom and position when dialog closes
watch(dialogModel, (newValue) => {
  if (!newValue) {
    isZoomed.value = false;
    resetPosition();
  }
});
</script>

<style lang="scss" scoped>
.image-preview-dialog {
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
}
</style>
