<template>
  <q-dialog
    v-model="isVisible"
    no-route-dismiss
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="payment-setup-success-dialog">
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
          <div class="icon-bg">
            <q-icon name="payment" class="payment-icon" />
          </div>
          <div class="pulse-ring"></div>
          <div class="pulse-ring pulse-ring-2"></div>
        </div>

        <h3 class="text-h5 text-bold q-mb-sm">Payment Setup Complete</h3>
        <ul class="text-grey-6 q-mb-none text-left" style="list-style: none; padding-left: 0;">
          <li class="q-mb-xs">
            <q-icon name="savings" size="20px" color="primary" class="q-mr-xs" />
            Collect secure deposits when clients book with you
          </li>
          <li class="q-mb-none">
            <q-icon name="volunteer_activism" size="20px" color="primary" class="q-mr-xs" />
            Accept tips and let your fans show their appreciation
          </li>
        </ul>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn
          label="Got it"
          color="primary"
          rounded
          unelevated
          class="got-it-btn"
          @click="handleDismiss"
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
</script>

<style scoped lang="scss">
.payment-setup-success-dialog {
  border-radius: 20px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  position: relative;
  overflow: visible;
  padding: 16px;
  box-shadow: none;

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 1;
  }

  .dialog-content {
    padding: 32px 24px 16px;
  }

  .icon-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
  }

  .icon-bg {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--q-primary) 0%, var(--q-primary) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
    animation: scale 2s ease-in-out infinite;
  }

  .payment-icon {
    font-size: 40px;
    color: white;
  }

  .pulse-ring {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 2px solid var(--q-primary);
    opacity: 0;
    animation: pulse 2s ease-out infinite;
  }

  .pulse-ring-2 {
    animation-delay: 1s;
  }

  .dialog-actions {
    padding: 8px 16px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;

    .got-it-btn {
      min-width: 160px;
      font-weight: 600;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.8);
    opacity: 0;
  }
}

@keyframes scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
