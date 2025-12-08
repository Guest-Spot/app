<template>
  <q-page class="page q-py-lg flex column items-center q-gap-md">
    <div class="container flex no-wrap items-start justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="goBack" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <div class="flex column items-start">
        <h2 class="text-h5 q-my-none">Sign In <span class="text-primary">to your account</span></h2>
        <p class="text-grey-6 q-mt-sm q-mb-none">
          Enter your email and password to continue
        </p>
      </div>
    </div>

    <div class="q-my-auto full-width">
      <div class="container flex column items-center q-gap-lg">
        <div class="auth-card full-width bg-block border-radius-lg q-pa-lg flex column q-gap-md">
          <q-form @submit="handleLogin" class="email-form flex column q-gap-md">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Enter your email</label>
              <q-input
                v-model="form.login"
                type="email"
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

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Enter your password</label>
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                outlined
                rounded
                size="lg"
                hint="Required and must be at least 3 characters"
                :rules="[
                  (val) => !!val || 'Password is required',
                  (val) => val.length >= 3 || 'Password must be at least 3 characters',
                ]"
                class="full-width"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    flat
                    dense
                    :icon="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                    color="grey-6"
                  />
                </template>
              </q-input>
            </div>

            <div class="button-group full-width q-mt-sm">
              <q-btn
                type="submit"
                class="login-btn bg-block full-width"
                :loading="loading"
                rounded
                unelevated
                flat
                color="primary"
              >
                Sign in
              </q-btn>
            </div>
            <div class="flex justify-end items-center full-width q-mt-md">
              <q-btn
                flat
                dense
                no-caps
                rounded
                icon="lock_reset"
                color="grey-6"
                :label="cooldownTime > 0 ? `Next try in ${formattedCooldown}` : 'Forgot password?'"
                class="text-caption"
                :loading="forgotPasswordLoading"
                :disable="forgotPasswordLoading || cooldownTime > 0"
                @click="handleForgotPassword"
              >
                <template v-slot:loading>
                  <div class="flex items-center q-gap-sm">
                    <q-spinner color="grey-6" size="16px" />
                    <span class="text-caption">Sending...</span>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { FORGOT_PASSWORD_MUTATION } from 'src/apollo/types/user';
import useUser from 'src/modules/useUser';
import useNotify from 'src/modules/useNotify';

const { showError, showSuccess } = useNotify();
const router = useRouter();
const { login, isAuthenticated, fetchMe } = useUser();

const loading = ref(false);
const forgotPasswordLoading = ref(false);
const showPassword = ref(false);
const form = ref({
  login: '',
  password: '',
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
  if (!form.value.login) {
    showError('Please enter your email address first');
    return;
  }

  forgotPasswordLoading.value = true;
  try {
    const res = await forgotPassword({ email: form.value.login });
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

const handleLogin = async () => {
  loading.value = true;

  try {
    const result = await login(form.value.login, form.value.password);

    if (result.success && isAuthenticated.value) {
      void fetchMe();
      showSuccess('Login successful');
      setTimeout(() => {
        void router.push('/profile');
      }, 500);
    } else {
      showError(result?.error || 'Invalid login credentials');
    }
  } catch (error) {
    console.log(error);
    showError('Invalid login credentials');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped lang="scss">
.auth-card {
  max-width: 400px;
}

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
