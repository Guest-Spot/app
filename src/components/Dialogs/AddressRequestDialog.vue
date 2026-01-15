<template>
  <q-dialog
    v-model="isVisible"
    no-route-dismiss
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="address-request-dialog">
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
            <q-icon name="place" class="location-icon" />
          </div>
          <div class="pulse-ring"></div>
          <div class="pulse-ring pulse-ring-2"></div>
        </div>

        <h3 class="text-h5 text-bold q-mb-sm">Add your location</h3>
        <p class="text-body1 text-grey-6 q-mb-none">
          Help clients find you easier by adding your address to your profile
        </p>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn
          label="Maybe later"
          flat
          rounded
          text-color="grey-7"
          class="later-btn"
          @click="handleDismiss"
        />
        <q-btn
          label="Add address"
          color="primary"
          rounded
          unelevated
          class="fill-btn"
          icon="add_location_alt"
          @click="handleFillAddress"
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
  (e: 'fill-address'): void;
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

const handleFillAddress = () => {
  emit('fill-address');
  handleDismiss();
};
</script>

<style scoped lang="scss">
.address-request-dialog {
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

  .location-icon {
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

    .later-btn {
      min-width: 120px;
    }

    .fill-btn {
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
