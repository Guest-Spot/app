<template>
  <q-dialog v-model="isVisible" position="bottom" no-route-dismiss>
    <q-card class="claim-profile-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ (timeLeft > 0) ? 'Request Sent' : 'Verify Ownership' }}</div>
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
        <template v-if="timeLeft > 0">
          <p class="q-mb-md">
            Thank you, your request has been sent. <span class="text-primary text-weight-bold">Our support team will contact you shortly</span>.
          </p>
        </template>
        <template v-else>
          <p class="q-mb-md">
            If you want to verify that this is your account, please send a request. Our support team will contact you shortly to verify your account.
          </p>
        </template>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          :label="(timeLeft > 0) ? 'Close' : 'Cancel'"
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
          :loading="isLoading"
          :disable="isLoading || timeLeft > 0"
          @click="onConfirm"
        >
          <div class="q-px-md">
            <span class="text-body2">{{ timeLeft > 0 ? `Try again in ${formattedTime}` : 'Request' }}</span>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { createMembershipRequest } from 'src/api/membershipRequest';
import useNotify from 'src/modules/useNotify';
import type { UserType } from 'src/interfaces/enums';

interface Props {
  modelValue: boolean;
  email: string;
  type: UserType;
  username: string;
  name: string;
  phone: string;
  link: string;
  documentId: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
}


const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { showSuccess } = useNotify();

const isVisible = ref(props.modelValue);
const isLoading = ref(false);

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

const onConfirm = async () => {
  try {
    isLoading.value = true;
    await createMembershipRequest({
      userId: props.documentId,
      username: props.username,
      email: props.email,
      type: props.type,
      name: props.name,
      phone: props.phone,
      link: props.link,
    });
    localStorage.setItem(getStorageKey(), Date.now().toString());
    startTimer();
    showSuccess('Request sent successfully');
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};


watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      // Dialog opened
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
