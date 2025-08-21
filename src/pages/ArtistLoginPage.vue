<template>
  <q-page class="login-page flex flex-center">
    <div class="container text-center">
      <div class="welcome-section q-mb-xl">
        <h2 class="text-h4 text-weight-bold q-mb-md">Welcome, <span class="text-primary">Artist!</span></h2>
        <p class="text-h6 text-grey-7">
          Showcase your portfolio and connect with clients
        </p>
      </div>

      <q-form @submit="handleLogin" class="login-form q-gutter-y-sm">
        <q-input
          v-model="form.email"
          type="email"
          label="Email Address"
          outlined
          rounded
          size="lg"
          :rules="[val => !!val || 'Email is required', val => validateEmail(val) || 'Invalid email format']"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="email" />
          </template>
        </q-input>

        <q-input
          v-model="form.password"
          type="password"
          label="Password"
          outlined
          rounded
          size="lg"
          :rules="[val => !!val || 'Password is required', val => val.length >= 6 || 'Password must be at least 6 characters']"
          class="full-width"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
        </q-input>

        <div class="flex justify-between no-wrap">
          <q-btn
            round
            color="grey-6"
            @click="goBack"
            size="lg"
            class="q-mr-sm"
          >
            <q-icon name="arrow_back" />
          </q-btn>
          <q-btn
            type="submit"
            size="lg"
            color="primary"
            class="login-btn full-width"
            :loading="loading"
            rounded
          >
            <q-icon name="login" class="q-mr-sm" size="24px" />
            Login
          </q-btn>
        </div>
      </q-form>

      <div class="actions-section q-mt-lg">    
        <div class="text-caption text-grey-6">
          Don't have an account? 
          <q-btn flat dense color="primary" label="Contact Support" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const form = ref({
  email: '',
  password: ''
});

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleLogin = async () => {
  loading.value = true;
  
  try {
    // TODO: Implement actual login logic here
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    $q.notify({
      type: 'positive',
      message: 'Login successful! Redirecting to portfolio...',
      position: 'top'
    });
    
    // TODO: Redirect to artist portfolio/dashboard
    setTimeout(() => {
      void router.push('/');
    }, 1500);
    
  } catch (error) {
    console.error('Login error:', error);
    $q.notify({
      type: 'negative',
      message: 'Login failed. Please check your credentials.',
      position: 'top'
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
.login-page {
  min-height: 100vh;
}
</style>
