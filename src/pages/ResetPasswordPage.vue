<template>
  <q-page class="page q-py-lg flex column items-center q-gap-md">
    <div class="container flex no-wrap items-start justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" to="/auth" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <div class="flex column items-start">
        <h2 class="text-h5 q-my-none">Reset Password</h2>
        <p class="text-grey-6 q-mt-sm q-mb-none">
          Enter your new password
        </p>
      </div>
    </div>

    <div class="q-my-auto full-width">
      <div class="container flex column items-center q-gap-lg">
        <div class="auth-card full-width bg-block border-radius-lg q-pa-lg flex column q-gap-md">
          <q-form @submit="handleResetPassword" class="flex column q-gap-sm">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">New Password</label>
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="New Password"
                outlined
                rounded
                size="lg"
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

            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Confirm Password</label>
              <q-input
                v-model="form.passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                placeholder="Confirm Password"
                outlined
                rounded
                size="lg"
                :rules="[
                  (val) => !!val || 'Confirmation is required',
                  (val) => val === form.password || 'Passwords must match'
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
                    :icon="showPasswordConfirmation ? 'visibility_off' : 'visibility'"
                    @click="showPasswordConfirmation = !showPasswordConfirmation"
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
                Reset Password
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import { RESET_PASSWORD_MUTATION } from 'src/apollo/types/user';
import useNotify from 'src/modules/useNotify';
import { useTokens } from 'src/modules/useTokens';
import useUser from 'src/modules/useUser';

const router = useRouter();
const route = useRoute();
const { showError, showSuccess } = useNotify();
const { storeTokens } = useTokens();
const { fetchMe } = useUser();

const loading = ref(false);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);
const form = ref({
  password: '',
  passwordConfirmation: ''
});

const { mutate: resetPassword } = useMutation(RESET_PASSWORD_MUTATION);

onMounted(() => {
  if (!route.query.code) {
    showError('Invalid reset link');
    void router.push('/auth');
  }
});

const handleResetPassword = async () => {
  const code = route.query.code;
  if (!code || typeof code !== 'string') {
     showError('Missing or invalid reset code');
     return;
  }

  loading.value = true;
  try {
    const res = await resetPassword({
      password: form.value.password,
      passwordConfirmation: form.value.passwordConfirmation,
      code: code
    });

    if (res?.data?.resetPassword?.jwt) {
      const { jwt } = res.data.resetPassword;
      // Store tokens
      storeTokens({ accessToken: jwt, refreshToken: '' });

      // Fetch user data
      await fetchMe();

      showSuccess('Password reset successful');
      void router.push('/sign-in');
    } else {
       showError('Failed to reset password');
    }
  } catch (error) {
    console.error(error);
    showError('Failed to reset password');
  } finally {
    loading.value = false;
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
