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
      <q-card-section class="q-pt-none image-container">
        <div class="full-width full-height flex justify-center items-center">
          <q-img
            v-if="imageSrc"
            :src="imageSrc"
            fit="contain"
            spinner-size="lg"
            spinner-color="dark"
            class="full-width full-height preview-image"
            :class="{ zoomed: isZoomed }"
            @click="toggleZoom"
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

const dialogModel = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// Methods
function toggleZoom() {
  isZoomed.value = !isZoomed.value;
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

// Reset zoom when dialog closes
watch(dialogModel, (newValue) => {
  if (!newValue) {
    isZoomed.value = false;
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
        transform: scale(1.5);
        cursor: grab;

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
