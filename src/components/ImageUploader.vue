<template>
  <div
    class="image-uploader border-radius-md"
    :class="{
      'image-uploader--sm': size === 'sm',
      'image-uploader--circle': circle,
    }"
  >
    <template v-if="imageSrc">
      <div class="image-preview-wrapper">
        <q-img
          :src="imageSrc"
          @click="zoomImage"
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
        >
          <span class="flex column items-center justify-center full-width full-height">
            <q-icon name="image" size="48px" color="grey-5" />
            <p class="text-grey-6 q-mt-sm">Upload image</p>
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
        push
        icon="camera_alt"
        class="absolute-bottom-right image-uploader_camera-button"
        @click.stop="openCamera"
      />
    </template>

    <div
      v-if="imageSrc"
      class="flex column absolute-bottom-right q-mr-sm q-mb-sm"
    >
      <q-btn
        round
        push
        color="deep-orange"
        @click="clear"
      >
        <q-icon
          name="delete_forever"
          color="white"
        />
      </q-btn>
    </div>

    <!-- Dialog -->
    <ImagePreviewDialog
      v-model="dialog"
      :image-src="imageSrc"
    />

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
import ImagePreviewDialog from './ImagePreviewDialog.vue'
import { useQuasar, type ValidationRule } from 'quasar'
import {
  ref,
  toRefs,
  watch,
  computed,
  type PropType
} from 'vue'

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
  }
})

const $q = useQuasar()
const { image } = toRefs(props)
const {
  formatFileToBase64
} = useImage()

const imagePreview = ref<File | string | null>(image.value)
const isLoading = ref(false)
const dialog = ref(false)
const cameraInput = ref<HTMLInputElement | null>(null)
const isMobile = $q.platform.is.mobile

// Computed property for image source
const imageSrc = computed(() => {
  if (typeof imagePreview.value === 'string') {
    return imagePreview.value
  }
  return null
})

// ---------- Methods ---------- //
function zoomImage() {
  dialog.value = true
}

function clear() {
  imagePreview.value = null
  emit('clear')
}

async function onChangeImage(image: File) {
  isLoading.value = true
  const options = {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 1024,
    useWebWorker: true
  }
  try {
    const compressedImage = await imageCompression(image, options)
    const fileSize = (compressedImage.size / 1000)
    if (fileSize >= MAX_SIZE) {
      console.error('File size is too large')
      return
    }
    imagePreview.value = await formatFileToBase64(compressedImage)
    emit('on-change', compressedImage)
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

async function onCameraSelected(event: Event) {
  const fileList = (event.target as HTMLInputElement)?.files
  const file = fileList && fileList[0]
  if (file) {
    await onChangeImage(file)
  }
  (event.target as HTMLInputElement).value = ''
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
    overflow: hidden;
    text-align: center;
    position: relative;
    overflow: hidden;

    &_camera-button {
      bottom: 16px;
      right: 16px;
      z-index: 10;
    }

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
          border: 2px dashed var(--border-light);
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

      &:hover .zoom-indicator {
        opacity: 1;
      }
    }
  }
</style>