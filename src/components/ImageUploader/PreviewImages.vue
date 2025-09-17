<template>
  <!-- Multiple images preview -->
  <div v-if="multiple" class="image-list flex no-wrap q-gap-sm">
    <VueDraggableNext
      handle=".image-item__move"
      class="flex no-wrap q-gap-sm"
      :list="images"
      :drag="false"
      @contextmenu.prevent
    >
      <div
        v-for="(img, index) in images"
        :key="index"
        class="image-item border-radius-md"
        @click="zoomImage(img.url, img.index || index)"
        draggable="true"
        @dragstart="onDragStart(img.index || index)"
        @dragover.prevent
        @drop="onDrop(img.index || index)"
        @dragend="onDragEnd"
      >
        <q-img
          :src="img.url"
          height="100%"
          width="100%"
          fit="cover"
          spinner-size="md"
          spinner-color="grey"
          class="absolute-top-left full-width full-height"
        />
        <div class="full-height flex column justify-between items-end q-gap-sm q-pa-sm">
          <q-btn
            round
            dense
            size="sm"
            icon="delete_forever"
            class="image-item__remove bg-block"
            text-color="negative"
            @click.stop="removeAt(index)"
          />
          <q-btn
            round
            dense
            size="sm"
            icon="drag_indicator"
            class="image-item__move bg-block"
            @click.stop
          >
            <q-tooltip class="bg-block border-radius-md text-body2">Drag to reorder</q-tooltip>
          </q-btn>
        </div>
      </div>
    </VueDraggableNext>
  </div>

  <!-- Single image preview -->
  <div v-else class="image-preview-wrapper border-radius-md">
    <q-img
      :src="images[0]?.url || undefined"
      @click="zoomImage(images[0]?.url || '', images[0]?.index || 0)"
      height="100%"
      :ratio="1"
      spinner-size="md"
      spinner-color="grey"
      class="full-width full-height"
    />
    <div class="zoom-indicator">
      <q-icon name="zoom_in" size="20px" color="white" />
    </div>

    <div class="flex column absolute-bottom-right q-mr-md q-mb-md">
      <q-btn
        round
        size="sm"
        unelevated
        class="bg-block"
        text-color="primary"
        icon="delete_forever"
        @click="removeAt(0)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue';
import { VueDraggableNext } from 'vue-draggable-next';
import type { IPicture } from 'src/interfaces/common';

defineOptions({
  name: 'PreviewImages',
});

const emit = defineEmits(['open-zoom-dialog', 'on-remove']);

const props = defineProps({
  multiple: {
    type: Boolean,
    default: false,
  },
  images: {
    type: Array as PropType<IPicture[]>,
    default: () => [],
  },
});

const dragIndex = ref<number | null>(null);

function zoomImage(src?: string, index?: number) {
  emit('open-zoom-dialog', src, index);
}

function removeAt(index: number) {
  emit('on-remove', index);
}

function onDragStart(index: number) {
  if (!props.multiple) return;
  dragIndex.value = index;
}

function onDragEnd() {
  dragIndex.value = null;
}

function onDrop(dropIndex: number) {
  if (!props.multiple) return;
  if (dragIndex.value === null || dragIndex.value === dropIndex) return;

  const from = dragIndex.value;
  const to = dropIndex;

  const move = (arr: unknown[], fromIdx: number, toIdx: number) => {
    const item = arr.splice(fromIdx, 1)[0];
    arr.splice(toIdx, 0, item);
  };

  move(props.images, from, to);
  dragIndex.value = null;
}
</script>

<style lang="scss" scoped>
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
  border-radius: var(--border-radius-lg);
}

.image-item {
  position: relative;
  flex: 0 0 auto;
  min-width: 200px;
  height: 100%;
  overflow: hidden;

  &:first-child {
    border: 2px solid var(--q-primary);
  }
}

.image-item__remove {
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
</style>
