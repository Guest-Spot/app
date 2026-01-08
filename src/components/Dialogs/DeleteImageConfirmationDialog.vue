<template>
  <q-dialog v-model="isVisible" position="bottom" no-route-dismiss>
    <q-card class="delete-image-confirmation-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Delete image</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <p class="text-body1 q-mb-md">
          Are you sure you want to delete this image?
        </p>
        <q-checkbox
          v-model="skipConfirmation"
          label="Don't show this confirmation again"
          color="primary"
          class="q-mt-sm"
        />
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          color="grey-9"
          rounded
          unelevated
          class="bg-block"
          v-close-popup
        >
          <div class="q-px-md">
            <span class="text-body2">Cancel</span>
          </div>
        </q-btn>
        <q-btn
          color="negative"
          rounded
          unelevated
          @click="handleConfirm"
        >
          <div class="q-px-md">
            <span class="text-body2">Delete</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', skipConfirmation: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);
const skipConfirmation = ref(false);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
    if (!newValue) {
      skipConfirmation.value = false;
    }
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

function handleConfirm() {
  emit('confirm', skipConfirmation.value);
  isVisible.value = false;
}
</script>

<style scoped lang="scss">
.delete-image-confirmation-dialog {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}

.body--dark {
  .delete-image-confirmation-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>

