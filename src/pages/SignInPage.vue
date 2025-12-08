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
                hint="Required field"
                :rules="[
                  (val) => !!val || 'Password is required',
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
                label="Forgot password?"
                class="text-caption"
                :to="{ path: '/forgot-password', query: form.login ? { email: form.login } : {} }"
              />
            </div>
          </q-form>
        </div>
      </div>
    </div>

    <EmailConfirmationDialog
      v-model="showEmailConfirmationDialog"
      :email="emailConfirmationEmail"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUser from 'src/modules/useUser';
import useNotify from 'src/modules/useNotify';
import { EmailConfirmationDialog } from 'src/components/Dialogs';

const { showError, showSuccess } = useNotify();
const router = useRouter();
const route = useRoute();
const { login, isAuthenticated, fetchMe } = useUser();

const loading = ref(false);
const showPassword = ref(false);
const showEmailConfirmationDialog = ref(false);
const form = ref({
  login: '',
  password: '',
});

const emailConfirmationEmail = computed(() => {
  const emailFromQuery = route.query.email as string | undefined;
  return emailFromQuery || form.value.login || '';
});

const goBack = () => {
  void router.back();
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

onMounted(() => {
  if (route.query.emailConfirmation) {
    showEmailConfirmationDialog.value = true;
    // Set email from query if available
    if (route.query.email && typeof route.query.email === 'string') {
      form.value.login = route.query.email;
    }
  }
});
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
