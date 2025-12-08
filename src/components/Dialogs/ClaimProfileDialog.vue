<template>
  <q-dialog v-model="isVisible" position="bottom" no-route-dismiss>
    <q-card class="claim-profile-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Verify Ownership</div>
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
          We'll send a confirmation link to <span class="text-primary text-weight-bold">{{ email }}</span>.
        </p>
        <p class="text-grey-6">
          Please check your inbox (and spam folder) to verify that you own this profile.
        </p>
        <p v-if="timeLeft > 0" class="text-caption text-negative q-mt-sm">
          You can request another email in {{ formattedTime }}.
        </p>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          label="Cancel"
          color="grey-9"
          rounded
          unelevated
          class="bg-block"
          v-close-popup
        />
        <q-btn
          color="primary"
          rounded
          unelevated
          :loading="loading"
          :disable="loading || timeLeft > 0"
          @click="onConfirm"
        >
          <div class="q-px-md">
            <span class="text-body2">{{ timeLeft > 0 ? formattedTime : 'Send' }}</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';

interface Props {
  modelValue: boolean;
  email: string;
  loading?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);

const timeLeft = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const COOLDOWN_DURATION = 60 * 60 * 1000; // 1 hour

const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60000);
  const seconds = Math.floor((timeLeft.value % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

const getStorageKey = () => `claim_profile_last_submit_${props.email}`;

const updateTimer = () => {
  const lastSubmit = localStorage.getItem(getStorageKey());
  if (!lastSubmit) {
    timeLeft.value = 0;
    return;
  }

  const elapsed = Date.now() - parseInt(lastSubmit, 10);
  if (elapsed < COOLDOWN_DURATION) {
    timeLeft.value = COOLDOWN_DURATION - elapsed;
  } else {
    timeLeft.value = 0;
    stopTimer();
  }
};

const startTimer = () => {
  updateTimer(); // Initial check
  if (timeLeft.value > 0 && !timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);
  }
};

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  stopTimer();
});

const onConfirm = () => {
  emit('confirm');
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Dialog opened
      startTimer();
    } else if (props.loading) {
      // Dialog closed while loading -> Success
      localStorage.setItem(getStorageKey(), Date.now().toString());
      startTimer();
    }
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style scoped lang="scss">
.claim-profile-dialog {
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
  .claim-profile-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
