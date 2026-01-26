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

        <h3 class="text-h5 text-bold q-mb-md">Payment Setup Complete</h3>
        <div class="options-list q-mb-md">
          <div
            class="option-item cursor-pointer"
            @click="navigateToDeposit"
          >
            <div class="option-content">
              <q-icon name="savings" size="24px" color="primary" class="option-icon" />
              <span class="option-text">Collect secure deposits when clients book with you</span>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-6" />
          </div>
          <div
            class="option-item cursor-pointer"
            @click="navigateToTips"
          >
            <div class="option-content">
              <q-icon name="volunteer_activism" size="24px" color="primary" class="option-icon" />
              <span class="option-text">Accept tips and let your fans show their appreciation</span>
            </div>
            <q-icon name="chevron_right" size="20px" color="grey-6" />
          </div>
        </div>
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
import { useRouter } from 'vue-router';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'dismiss'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const router = useRouter();

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

const navigateToDeposit = () => {
  handleDismiss();
  void router.push('/profile/booking-deposit');
};

const navigateToTips = () => {
  handleDismiss();
  void router.push('/profile/accept-tips');
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

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 12px;
      background-color: rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(0, 0, 0, 0.08);
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
        border-color: var(--q-primary);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &:active {
        transform: translateY(0);
      }

      .option-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }

      .option-icon {
        flex-shrink: 0;
      }

      .option-text {
        font-size: 14px;
        line-height: 1.4;
        text-align: left;
      }
    }
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

.body--dark {
  .payment-setup-success-dialog {
    .option-item {
      border-color: rgba(255, 255, 255, 0.08);
    }
  }
}
</style>
