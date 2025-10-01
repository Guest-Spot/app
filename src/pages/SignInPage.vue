<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="$router.back()" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Sign in to <span class="text-primary">your account</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit="handleLogin" class="flex column items-start q-gap-sm full-width">
            <div class="flex column items-start q-gap-xs full-width">
              <label class="input-label">Enter your login</label>
              <q-input
                v-model="form.login"
                type="email"
                placeholder="Email"
                outlined
                rounded
                size="lg"
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
              >
                Sign in
              </q-btn>
            </div>

            <!-- Social Auth Section -->
            <div
              class="social-auth-section flex items-center column justify-center q-mt-lg full-width q-gap-md"
            >
              <div class="text-center full-width flex items-center justify-center q-gap-md no-wrap">
                <div class="divider-line"></div>
                <span class="divider-text text-grey-6">or continue with</span>
                <div class="divider-line"></div>
              </div>
              <div class="social-buttons flex row justify-center q-gap-md">
                <q-btn
                  round
                  unelevated
                  outline
                  color="primary"
                  :href="`${API_URL}/api/connect/google`"
                >
                  <div class="flex items-center justify-center q-gap-sm">
                    <GoogleIcon width="16px" height="16px" />
                  </div>
                </q-btn>

                <q-btn round unelevated outline color="primary" disabled>
                  <div class="flex items-center justify-center q-gap-sm">
                    <FacebookIcon width="18px" height="18px" />
                  </div>
                </q-btn>

                <q-btn round unelevated outline color="primary" disabled>
                  <div class="flex items-center justify-center q-gap-sm">
                    <AppleIcon width="18px" height="18px" />
                  </div>
                </q-btn>
              </div>
            </div>
          </q-form>
        </div>

        <!-- Actions section -->
        <div class="actions-section q-mt-lg">
          <div class="text-subtitle1 flex column items-center justify-center q-gap-sm">
            <span>Don't have an account?</span>
            <q-btn flat dense color="primary" rounded label="Contact Support" class="q-px-md" />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import useUser from 'src/modules/useUser';
import { useProfileStore } from 'src/stores/profile';
import GoogleIcon from 'src/components/Icons/GoogleIcon.vue';
import FacebookIcon from 'src/components/Icons/FacebookIcon.vue';
import AppleIcon from 'src/components/Icons/AppleIcon.vue';
import { API_URL } from 'src/config/constants';

const router = useRouter();
const $q = useQuasar();
const { login, isAuthenticated, fetchMe } = useUser();
const profileStore = useProfileStore();

const loading = ref(false);
const showPassword = ref(false);
const form = ref({
  login: '',
  password: '',
});

const handleLogin = async () => {
  loading.value = true;

  try {
    const result = await login(form.value.login, form.value.password);

    if (result.success && isAuthenticated.value) {
      const userData = await fetchMe();
      if (userData) {
        profileStore.setUserProfile(userData);
      }
      $q.notify({
        type: 'primary',
        message: 'Login successful',
        position: 'top',
        timeout: 1500,
        color: 'dark',
        progress: true,
        actions: [
          {
            icon: 'close',
            color: 'white',
          },
        ],
      });

      // Redirect to artist profile
      setTimeout(() => {
        void router.push('/profile');
      }, 500);
    } else {
      throw new Error(result.error || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      type: 'negative',
      message: error instanceof Error ? error.message : 'Invalid login credentials',
      position: 'top',
      timeout: 1500,
      color: 'negative',
      progress: true,
      actions: [
        {
          icon: 'close',
          color: 'white',
        },
      ],
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
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
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 32px;
  text-transform: none;
}

.divider-line {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.divider-text {
  white-space: nowrap;
}
</style>
