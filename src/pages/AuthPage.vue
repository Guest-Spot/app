<template>
  <q-page class="page q-py-lg flex column items-center q-gap-md">
    <div class="container flex no-wrap items-start justify-start q-gap-md">
      <q-btn round unelevated text-color="grey-6" @click="goBack" class="bg-block">
        <q-icon name="arrow_back" />
      </q-btn>
      <div class="flex column items-start">
        <h2 class="text-h5 q-my-none">Welcome to <span class="text-primary">GuestSpot</span></h2>
        <p class="text-grey-6 q-mt-sm q-mb-none">
          Sign in to discover tattoo artists and book sessions
        </p>
      </div>
    </div>

    <div class="q-my-auto full-width">
      <div class="container flex column items-center q-gap-lg">
        <!-- Main auth card -->
        <div class="auth-card full-width bg-block border-radius-lg q-pa-lg flex column q-gap-md">
          <template v-if="!showEmailForm">
            <!-- Artist and Shop cards -->
            <div class="business-cards flex column q-gap-md">
              <q-card
                class="business-card"
                flat
                clickable
                @click="goToSignUp('artist')"
              >
                <div class="flex no-wrap items-center q-gap-md">
                  <div class="business-icon">
                    <q-icon name="brush" color="primary" size="md" />
                  </div>
                  <div class="flex-grow">
                    <div class="text-subtitle1 text-weight-medium">Become an Artist</div>
                    <div class="text-caption text-grey-5">
                      Showcase your work and accept appointments
                    </div>
                  </div>
                  <q-icon name="chevron_right" color="grey-9" size="sm" />
                </div>
              </q-card>

              <q-card
                class="business-card"
                flat
                clickable
                @click="goToSignUp('shop')"
              >
                <div class="flex no-wrap items-center q-gap-md">
                  <div class="business-icon">
                    <q-icon name="storefront" color="primary" size="md" />
                  </div>
                  <div class="flex-grow">
                    <div class="text-subtitle1 text-weight-medium">Open a Shop</div>
                    <div class="text-caption text-grey-5">
                      Promote your shop and manage bookings
                    </div>
                  </div>
                  <q-icon name="chevron_right" color="grey-9" size="sm" />
                </div>
              </q-card>
            </div>

            <!-- Social login buttons -->
            <div class="social-login flex column items-center q-gap-md">
              <q-btn
                class="social-btn full-width"
                unelevated
                rounded
                :loading="googleLoading"
                @click="handleGoogleSignIn"
              >
                <div class="flex items-center justify-center q-gap-sm">
                  <GoogleIcon width="20px" height="20px" />
                  <span>Continue with Google</span>
                </div>
              </q-btn>

              <q-btn
                v-if="isIos"
                class="social-btn full-width"
                unelevated
                rounded
                :loading="appleLoading"
                @click="signInWithApple"
              >
                <div class="flex items-center justify-center q-gap-sm">
                  <AppleIcon width="20px" height="20px" />
                  <span>Continue with Apple</span>
                </div>
              </q-btn>
            </div>

            <!-- Divider -->
            <div class="divider flex items-center q-gap-md">
              <div class="divider-line"></div>
              <span class="text-grey-6 text-caption">or</span>
              <div class="divider-line"></div>
            </div>

            <!-- Email login toggle -->
            <div v-if="!showEmailForm" class="text-center">
              <q-btn
                flat
                dense
                color="primary"
                label="Sign in with email"
                @click="showEmailForm = true"
              />
            </div>
          </template>
          <!-- Email login form -->
          <q-form v-else @submit="handleLogin" class="email-form flex column q-gap-sm">
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
                  flat
                  color="primary"
                >
                  Sign in
                </q-btn>
              </div>

            <q-btn
              flat
              dense
              color="grey-6"
              label="Hide email form"
              class="q-mt-xs"
              @click="showEmailForm = false"
            />
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import useUser from 'src/modules/useUser';
import GoogleIcon from 'src/components/Icons/GoogleIcon.vue';
import AppleIcon from 'src/components/Icons/AppleIcon.vue';
import useNotify from 'src/modules/useNotify';
import useGoogleAuth from 'src/modules/auth/useGoogleAuth';
import {
  SignInWithApple,
  type SignInWithAppleOptions,
} from '@capacitor-community/apple-sign-in';

const { showError, showSuccess } = useNotify();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { login, isAuthenticated, fetchMe } = useUser();

const loading = ref(false);
const googleLoading = ref(false);
const appleLoading = ref(false);
const showPassword = ref(false);
const showEmailForm = ref(false);
const form = ref({
  login: '',
  password: '',
});

const { initializeGoogleAuth, handleGoogleSignIn } = useGoogleAuth({
  loadingRef: googleLoading,
});

const isIos = computed(() => $q.platform.is.ios);

const goBack = () => {
  void router.push('/');
};

const goToSignUp = (type: 'artist' | 'shop') => {
  void router.push({ path: '/sign-up', query: { type } });
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

async function signInWithApple() {
  appleLoading.value = true;

  const options: SignInWithAppleOptions = {
    clientId: 'com.guestspot.service',
    redirectURI: `${location.origin}/connect/apple`,
    scopes: 'email name',
    nonce: Math.random().toString(36).substring(2),
  };

  try {
    const res = await SignInWithApple.authorize(options);
    void router.push(`/connect/apple?access_token=${res?.response?.identityToken}&provider=apple`);
  } catch (error) {
    console.error(error);
    showError('Apple sign-in failed. Please try again later.');
  } finally {
    appleLoading.value = false;
  }
}

onMounted(() => {
  void initializeGoogleAuth();
  if (route.query.emailConfirmation) {
    showSuccess('Email confirmation successful');
  }
});
</script>

<style scoped lang="scss">
.auth-header {
  margin-top: 24px;
}

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

.divider-line {
  width: 100%;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
}

.divider-text {
  white-space: nowrap;
}

.social-btn {
  height: 48px;
  font-size: 15px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.2s ease;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

.login-btn {
  height: 44px;
  font-weight: 600;
  font-size: 15px;
  color: white;
}

.business-section {
  max-width: 400px;
}

.business-card {
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s ease;
}

.business-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--q-primary);
}

.business-icon {
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--red-accent-rgb), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>

