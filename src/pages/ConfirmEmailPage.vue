<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Confirm your <span class="text-primary">email</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="email-card bg-block border-radius-lg flex column items-center q-gap-md text-center q-pa-md">
          <div class="flex column items-center q-gap-sm">
            <div class="bg-block border-radius-md full-width q-pa-md">
              <div class="icon-wrapper">
                <q-icon name="inbox" size="48px" color="primary" />
              </div>
              <h3 class="text-h5 text-bold q-mb-none q-mt-sm">Check your inbox</h3>
              <p class="text-subtitle2 q-px-md q-mt-sm text-grey-6">
                We sent you an email with a link to confirm your email address
                <span class="email text-primary">{{ displayEmail }}</span>.
              </p>
            </div>
          </div>
        </div>
        <div v-if="email" class="resend-block flex column items-center q-gap-xs q-my-md">
          <p class="text-caption text-grey-6 q-mb-none">Didn't receive the email?</p>
          <q-btn
            label="Resend confirmation email"
            color="primary"
            dense
            flat
            rounded
            unelevated
            class="q-px-md bg-block"
            :disable="isCooldown"
            @click="handleResend"
          />
          <p v-if="isCooldown" class="text-caption text-grey-6 q-mt-xs q-mb-none">
            {{ cooldownLabel }}
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useRoute } from 'vue-router';
import { resendConfirmationEmail } from 'src/api';
import useNotify from 'src/modules/useNotify';
import type { AxiosError } from 'axios';

const route = useRoute();
const { showError } = useNotify();

const normalizeValue = (value: string | null | (string | null)[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
};

const email = computed(() => normalizeValue(route.query.email));

const displayEmail = computed(() => email.value || 'specified email address');
const isCooldown = ref(false);
const cooldownSeconds = ref(0);
let cooldownTimer: number | undefined;

const clearCooldownTimer = () => {
  if (cooldownTimer !== undefined) {
    window.clearInterval(cooldownTimer);
    cooldownTimer = undefined;
  }
};

const startCooldown = () => {
  clearCooldownTimer();
  isCooldown.value = true;
  cooldownSeconds.value = 60;
  cooldownTimer = window.setInterval(() => {
    cooldownSeconds.value -= 1;
    if (cooldownSeconds.value <= 0) {
      clearCooldownTimer();
      isCooldown.value = false;
    }
  }, 1000);
};

const cooldownLabel = computed(() => {
  const minutes = Math.floor(cooldownSeconds.value / 60);
  const seconds = cooldownSeconds.value % 60;
  const formattedSeconds = String(seconds).padStart(2, '0');
  return `Resend in ${minutes}:${formattedSeconds}`;
});

const handleResend = async () => {
  if (isCooldown.value || !email.value) {
    return;
  }
  startCooldown();

  try {
    await resendConfirmationEmail(email.value);
    console.log('Email confirmation resent successfully');
  } catch (error) {
    console.error('Error resending email confirmation:', error);
    // show axios error
    showError((error as AxiosError<{ error: { message: string } }>).response?.data?.error?.message || 'Failed to resend confirmation email');
  }
};

onBeforeUnmount(() => {
  clearCooldownTimer();
});
</script>

<style scoped lang="scss">
.email-card {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
}

.icon-wrapper {
  border-radius: 50%;
  border: 1px solid rgba(var(--q-dark34-rgb), 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

.email {
  font-weight: 600;
}
.resend-block {
  width: 100%;
}
</style>
