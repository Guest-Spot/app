<template>
  <q-dialog v-model="isVisible" no-route-dismiss transition-show="scale" transition-hide="scale">
    <q-card class="accept-tips-dialog">
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
          <q-icon name="volunteer_activism" size="42px" color="secondary" />
        </div>
        <h3 class="text-h5 q-mb-sm">Accept Tips & Support</h3>
        <p class="text-body1 text-grey-6 q-mb-xs">
          Let your fans show appreciation and help you keep creating. Accept tips securely through Stripe Connect.
        </p>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn label="Maybe later" flat rounded text-color="grey-7" class="later-btn" @click="handleDismiss" />
        <q-btn
          label="Setup tips"
          color="secondary"
          rounded
          unelevated
          class="fill-btn"
          icon="settings"
          @click="handleSetup"
        />
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
  (e: 'dismiss'): void;
  (e: 'setup'): void;
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

const handleSetup = () => {
  emit('setup');
  handleDismiss();
};
</script>

<style scoped lang="scss">
.accept-tips-dialog {
  width: min(90vw, 360px);
  border-radius: 18px;
  padding: 16px;
  position: relative;
  text-align: center;
  box-shadow: none;

  .dialog-actions {
    padding: 8px 16px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .later-btn {
      min-width: 120px;
    }

    .fill-btn {
      min-width: 160px;
      font-weight: 600;
    }
  }
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
  border: 2px dashed var(--q-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}
</style>
