<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn
        round
        unelevated
        text-color="grey-6"
        @click="goBack"
        class="bg-block"
      >
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Welcome, <span class="text-primary">Artist!</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <q-form @submit="handleLogin" class="login-form">
            <div class="input-group">
              <label class="input-label">Enter your login</label>
              <q-input
                v-model="form.login"
                type="text"
                placeholder="Login"
                outlined
                rounded
                size="lg"
                :rules="[val => !!val || 'Login is required']"
                class="full-width custom-input"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="grey-7" />
                </template>
              </q-input>
            </div>

            <div class="input-group">
              <label class="input-label">Enter your password</label>
              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Password"
                outlined
                rounded
                size="lg"
                :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']"
                class="full-width custom-input"
                bg-color="transparent"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-7" />
                </template>
                <template v-slot:append>
                  <q-btn
                    round
                    flat
                    dense
                    :icon="showPassword ? 'visibility_off' : 'visibility'"
                    @click="showPassword = !showPassword"
                    color="grey-7"
                  />
                </template>
              </q-input>
            </div>

            <div class="button-group q-mt-md">
              <q-btn
                type="submit"
                class="login-btn bg-block full-width"
                :loading="loading"
                rounded
                unelevated
              >
                Login
              </q-btn>
            </div>
          </q-form>
        </div>

        <!-- TODO: Add actions section -->
        <div class="actions-section q-mt-xl">
          <div class="text-subtitle1 flex column items-center justify-center q-gap-sm">
            <span>Don't have an account?</span>
            <q-btn flat dense color="primary" rounded label="Contact Support" />
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

const router = useRouter();
const $q = useQuasar();
const { login, isAuthenticated } = useUser();

const loading = ref(false);
const showPassword = ref(false);
const form = ref({
  login: '',
  password: ''
});

const handleLogin = async () => {
  loading.value = true;

  try {
    await login(form.value.login, form.value.password);

    if (isAuthenticated.value) {
      $q.notify({
        type: 'primary',
        message: 'Login successful!',
        position: 'top',
        timeout: 1500,
        color: 'dark',
        progress: true,
        actions: [
          {
            icon: 'close',
            color: 'white',
          }
        ]
      });

      // Redirect to artist profile
      setTimeout(() => {
        void router.push('/profile');
      }, 500);
    } else {
      throw new Error('Invalid credentials');
    }

  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      type: 'negative',
      message: 'Login failed. Please check your credentials.',
      position: 'top',
      timeout: 1500,
      color: 'negative',
      progress: true,
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    });
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  void router.push('/auth');
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
  margin-bottom: 4px;
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
</style>
