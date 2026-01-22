<template>
  <q-dialog v-model="isVisible" no-route-dismiss transition-show="scale" transition-hide="scale">
    <q-card class="tip-dialog">
      <q-btn
        icon="close"
        class="close-btn"
        text-color="grey-6"
        flat
        round
        dense
        @click="handleDismiss"
      />

      <q-card-section class="dialog-content text-center">
        <div class="icon-wrapper q-mb-lg">
          <q-icon name="volunteer_activism" size="42px" color="primary" />
        </div>
        <h3 class="text-h5 q-mb-sm">
          Tip
          <span v-if="artistName" class="text-primary">{{ artistName }}</span>
          <span v-else>the artist</span>
        </h3>
        <p class="text-body1 text-grey-6 q-mb-xs">
          Support your favorite artist and keep them inspired to create more work you love.
        </p>
        <p class="text-caption text-grey-5">
          Tap the button below to open the tip page and complete your support directly.
        </p>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn label="Maybe later" flat rounded text-color="grey-7" class="later-btn" @click="handleDismiss" />
        <q-btn
          label="Tip artist"
          color="primary"
          rounded
          unelevated
          class="tip-btn"
          icon="volunteer_activism"
          @click="handleTip"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: boolean;
  artistName?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'dismiss'): void;
  (e: 'tip'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const handleDismiss = () => {
  emit('dismiss');
  isVisible.value = false;
};

const handleTip = () => {
  emit('tip');
  handleDismiss();
};
</script>

<style scoped lang="scss">
.tip-dialog {
  width: min(90vw, 360px);
  border-radius: 18px;
  padding: 16px;
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}

.dialog-content {
  padding: 24px 16px 12px;
}

.icon-wrapper {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  border: 2px dashed var(--q-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.dialog-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 16px;
  flex-wrap: wrap;
}

.later-btn {
  min-width: 120px;
}

.tip-btn {
  min-width: 140px;
  font-weight: 600;
}
</style>
