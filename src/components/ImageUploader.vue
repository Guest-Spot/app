<template>
  <div
    class="image-uploader border-radius-lg q-pa-sm bg-block"
    :class="{
      'image-uploader--sm': size === 'sm',
      'image-uploader--circle': circle,
    }"
  >
    <template v-if="hasImages">
      <!-- Multiple images preview -->
      <div v-if="multiple" class="image-list q-pa-xs">
        <div
          v-for="(src, idx) in imagesSrc"
          :key="idx"
          class="image-item border-radius-md"
          :class="{ 'image-item--primary': idx === 0 }"
          @click="zoomImage(src)"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragover.prevent
          @drop="onDrop(idx)"
          @dragend="onDragEnd"
        >
          <q-img
            :src="src"
            height="100%"
            width="100%"
            fit="cover"
            spinner-size="md"
            spinner-color="grey"
            class="absolute-top-left full-width full-height"
          />
          <q-btn
            round
            dense
            size="sm"
            icon="close"
            class="image-item__remove bg-block"
            text-color="negative"
            @click.stop="removeAt(idx)"
          />
        </div>
        <div
          class="image-item__add border-radius-md cursor-pointer"
          v-ripple
          @click.stop="openGallery"
        >
          <q-icon name="add_photo_alternate" size="24px" color="grey-6" />
          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            :multiple="multiple"
            @change="onGallerySelected"
            style="display: none;"
          />
        </div>
      </div>

      <!-- Single image preview -->
      <div v-else class="image-preview-wrapper border-radius-md">
        <q-img
          :src="imageSrc || undefined"
          @click="zoomImage(imageSrc || '')"
          height="100%"
          fit="cover"
          spinner-size="md"
          spinner-color="grey"
          class="cursor-pointer absolute-top-left full-width full-height"
        />
        <div class="zoom-indicator">
          <q-icon name="zoom_in" size="20px" color="white" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="full-width full-height" v-ripple>
        <q-file
          outlined
          :model-value="null"
          :hint="hint || undefined"
          :rules="rules"
          @update:model-value="onChangeImage"
          :multiple="multiple"
          accept="image/*"
        >
          <span class="flex column items-center justify-center full-width full-height">
            <q-icon :name="placeholderIcon" size="48px" color="grey-6" />
            <p class="text-grey-6 q-mt-sm">{{ placeholder }}</p>
          </span>
        </q-file>
      </div>

      <!-- Hidden camera input -->
      <input
        ref="cameraInput"
        type="file"
        accept="image/*"
        capture="environment"
        @change="onCameraSelected"
        style="display: none;"
      />

      <!-- Open camera button (mobile only) -->
      <q-btn
        v-if="isMobile"
        round
        size="sm"
        icon="camera_alt"
        text-color="primary"
        unelevated
        class="absolute-bottom-right q-mr-lg q-mb-lg bg-block"
        @click.stop="openCamera"
      />
    </template>

    <div
      v-if="hasImages && !multiple"
      class="flex column absolute-bottom-right q-mr-md q-mb-md"
    >
      <q-btn
        round
        size="sm"
        unelevated
        class="bg-block"
        text-color="primary"
        icon="delete_forever"
        @click="clear"
      />
    </div>

    <!-- Dialog -->
    <ImagePreviewDialog v-model="dialog" :image-src="previewDialogSrc" />

    <!-- Loader -->
    <q-inner-loading
      :showing="isLoading"
      size="sm"
      style="z-index: 10;"
    />
  </div>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'
import useImage from '../modules/useImage'
import { useQuasar, type ValidationRule } from 'quasar'
import { ref, toRefs, watch, computed, defineAsyncComponent, type PropType } from 'vue'

const MAX_SIZE = 4096

defineOptions({
  name: 'ImageUploader',
})

const emit = defineEmits(['on-change', 'clear'])

const props = defineProps({
  image: {
    type: [File, null] as PropType<File | null>,
    default: null,
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
    default: () => []
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
})

const $q = useQuasar()
const { image, multiple } = toRefs(props)
const { formatFileToBase64 } = useImage()

const imagePreview = ref<File | string | null>(image.value)
const imagesPreview = ref<string[]>([])
const selectedFiles = ref<File[]>([])
const isLoading = ref(false)
const dialog = ref(false)
const cameraInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const isMobile = $q.platform.is.mobile
const previewDialogSrc = ref<string | null>(null)
const dragIndex = ref<number | null>(null)

// Lazy-load dialog to avoid TS default export issues and reduce initial bundle
const ImagePreviewDialog = defineAsyncComponent(() => import('src/components/Dialogs/ImagePreviewDialog.vue'))

// Computed property for image source
const imageSrc = computed<string | null>(() => {
  if (typeof imagePreview.value === 'string') {
    return imagePreview.value
  }
  return null
})

const imagesSrc = computed(() => imagesPreview.value)

const hasImages = computed(() => {
  return multiple.value ? imagesPreview.value.length > 0 : !!imageSrc.value
})

// ---------- Methods ---------- //
function zoomImage(src?: string) {
  previewDialogSrc.value = src || imageSrc.value
  dialog.value = true
}

function clear() {
  if (multiple.value) {
    imagesPreview.value = []
    selectedFiles.value = []
  } else {
    imagePreview.value = null
  }
  emit('clear')
}

async function compressAndPrepare(file: File) {
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  }
  const compressedImage = await imageCompression(file, options)
  const fileSize = compressedImage.size / 1000
  if (fileSize >= MAX_SIZE) {
    console.error('File size is too large')
    return null
  }
  const base64 = await formatFileToBase64(compressedImage)
  return { file: compressedImage, base64 }
}

async function onChangeImage(input: File | File[]) {
  isLoading.value = true
  try {
    if (multiple.value) {
      const files = Array.isArray(input) ? input : [input]
      const results = await Promise.all(files.map((f) => compressAndPrepare(f)))
      const valid = results.filter((r): r is { file: File; base64: string } => !!r)
      imagesPreview.value.push(...valid.map((v) => v.base64))
      selectedFiles.value.push(...valid.map((v) => v.file))
      emit('on-change', selectedFiles.value)
    } else {
      const file = Array.isArray(input) ? input[0] : input
      if (!file) {
        isLoading.value = false
        return
      }
      const result = await compressAndPrepare(file)
      if (!result) return
      imagePreview.value = result.base64
      emit('on-change', result.file)
    }
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function openCamera() {
  if (cameraInput.value) {
    cameraInput.value.click()
  }
}

function openGallery() {
  galleryInput.value?.click()
}

async function onCameraSelected(event: Event) {
  const fileList = (event.target as HTMLInputElement | null)?.files
  if (!fileList || fileList.length === 0) return
  if (multiple.value) {
    await onChangeImage(Array.from(fileList))
  } else {
    const file = fileList.item(0)
    if (!file) return
    await onChangeImage(file)
  }
  (event.target as HTMLInputElement).value = ''
}

async function onGallerySelected(event: Event) {
  const fileList = (event.target as HTMLInputElement | null)?.files
  if (!fileList || fileList.length === 0) return
  if (multiple.value) {
    await onChangeImage(Array.from(fileList))
  } else {
    const file = fileList.item(0)
    if (!file) return
    await onChangeImage(file)
  }
  (event.target as HTMLInputElement).value = ''
}

function removeAt(index: number) {
  if (!multiple.value) return
  imagesPreview.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
  emit('on-change', selectedFiles.value)
}

function onDragStart(index: number) {
  if (!multiple.value) return
  dragIndex.value = index
}

function onDragEnd() {
  dragIndex.value = null
}

function onDrop(dropIndex: number) {
  if (!multiple.value) return
  if (dragIndex.value === null || dragIndex.value === dropIndex) return

  const from = dragIndex.value
  const to = dropIndex

  const move = (arr: unknown[], fromIdx: number, toIdx: number) => {
    const item = arr.splice(fromIdx, 1)[0]
    arr.splice(toIdx, 0, item)
  }

  move(imagesPreview.value, from, to)
  move(selectedFiles.value, from, to)
  dragIndex.value = null
  emit('on-change', selectedFiles.value)
}

watch(image, async (newValue) => {
  if (!newValue) return
  if (typeof newValue === 'string') {
    imagePreview.value = newValue
  } else {
    imagePreview.value = await formatFileToBase64(newValue)
  }
}, {
  immediate: true
})
</script>

<style lang="scss">
.image-uploader {
  width: 100%;
  height: 210px;
  text-align: center;
  position: relative;
  overflow: hidden;

  .q-file {
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

    span {
      font-size: 16px;
      font-weight: bold;
      opacity: 0.5;
      display: flex;
      align-items: center;
      pointer-events: none;
      user-select: none;
      color: var(--text-black);
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

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

  .image-preview-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;

    .zoom-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }
  }

  .image-list {
    display: flex;
    align-items: stretch;
    gap: 8px;
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    border-radius: var(--border-radius-lg);
  }

  .image-item {
    position: relative;
    flex: 0 0 200px;
    height: 100%;
    overflow: hidden;
  }

  .image-item--primary {
    border: 2px solid var(--q-primary);
  }

  .image-item__remove {
    position: absolute;
    top: 6px;
    right: 6px;
    z-index: 2;
  }

  .image-item__add {
    width: 100%;
    min-width: 100px;
    position: relative;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-md);
    border: 2px dashed rgba(var(--bg-block-rgb), 1);
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
