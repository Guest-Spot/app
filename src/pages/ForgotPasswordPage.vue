<template>
  <q-page class="page q-py-lg flex column items-center q-gap-md">
    <div class="container flex no-wrap items-start justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="goBack" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <div class="flex column items-start">
        <h2 class="text-h5 q-my-none">Forgot <span class="text-primary">Password</span></h2>
        <p class="text-grey-6 q-mt-sm q-mb-none">
          Enter your email to receive a password reset link
        </p>
      </div>
    </div>

    <div class="q-my-auto full-width">
      <div class="container flex column items-center q-gap-lg">
        <div class="auth-card full-width bg-block border-radius-lg q-pa-lg flex column q-gap-md">
          <q-form @submit="handleForgotPassword" class="email-form flex column q-gap-md">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Enter your email</label>
              <q-input
                v-model="form.email"
                type="email"
                ref="emailInput"
                placeholder="Email"
                outlined
                rounded
                size="lg"
                hint="Required field"
                :rules="[(val) => !!val || 'Email is required']"
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="grey-6" />
                </template>
              </q-input>
            </div>

            <div class="button-group full-width q-mt-sm">
              <q-btn
                type="submit"
                class="login-btn bg-block full-width"
                :loading="forgotPasswordLoading"
                :disable="cooldownTime > 0"
                rounded
                unelevated
                flat
                :color="cooldownTime > 0 ? 'grey-6' : 'primary'"
              >
                {{ cooldownTime > 0 ? `Next try in ${formattedCooldown}` : 'Send reset link' }}
                <template v-slot:loading>
                  <div class="flex items-center q-gap-sm">
                    <q-spinner color="white" size="16px" />
                    <span>Sending...</span>
                  </div>
                </template>
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { FORGOT_PASSWORD_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { QInput } from 'quasar';

const { showError, showSuccess } = useNotify();
const router = useRouter();
const route = useRoute();

const forgotPasswordLoading = ref(false);
const emailInput = ref<QInput | null>(null);
const form = ref({
  email: '',
});

const cooldownTime = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const COOLDOWN_KEY = 'forgot_password_block_until';

const formattedCooldown = computed(() => {
  const m = Math.floor((cooldownTime.value % 3600) / 60);
  const s = cooldownTime.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

const startTimer = (seconds: number) => {
  cooldownTime.value = seconds;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    cooldownTime.value--;
    if (cooldownTime.value <= 0) {
      if (timerInterval) clearInterval(timerInterval);
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }, 1000);
};

const checkCooldown = () => {
  const blockUntil = localStorage.getItem(COOLDOWN_KEY);
  if (blockUntil) {
    const remaining = Math.ceil((parseInt(blockUntil) - Date.now()) / 1000);
    if (remaining > 0) {
      startTimer(remaining);
    } else {
      localStorage.removeItem(COOLDOWN_KEY);
    }
  }
};

// Set email from query parameter
watch(
  () => route.query.email,
  (email) => {
    if (email && typeof email === 'string') {
      form.value.email = email;
    }
  },
  { immediate: true }
);

onMounted(() => {
  checkCooldown();
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const { mutate: forgotPassword } = useMutation(FORGOT_PASSWORD_MUTATION);

const goBack = () => {
  void router.back();
};

const handleForgotPassword = async () => {
  if (!form.value.email) {
    showError('Please enter your email address');
    void emailInput.value?.validate();
    return;
  }

  forgotPasswordLoading.value = true;
  try {
    const res = await forgotPassword({ email: form.value.email });
    if (res?.data?.forgotPassword?.ok) {
      showSuccess('Password reset link sent to your email');
      const blockUntil = Date.now() + 3600 * 1000;
      localStorage.setItem(COOLDOWN_KEY, blockUntil.toString());
      startTimer(3600);
    } else {
      showError('Failed to send reset link');
    }
  } catch (error) {
    console.error(error);
    showError('Failed to send reset link');
  } finally {
    forgotPasswordLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.input-label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.login-btn {
  height: 44px;
  font-weight: 600;
  font-size: 15px;
  color: white;
}
</style>
