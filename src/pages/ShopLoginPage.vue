<template>
  <q-page class="login-page flex flex-center">
    <div class="container text-center">
      <div class="welcome-section q-mb-xl">
        <q-icon name="store" size="80px" color="primary" class="q-mb-md" />
        <h2 class="text-h3 text-weight-bold q-mb-md">Welcome, Shop Owner!</h2>
        <p class="text-h6 text-grey-7">
          Manage your tattoo studio, services, and artist team
        </p>
      </div>

      <q-form @submit="handleLogin" class="login-form q-gutter-y-md">
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

        <q-btn
          type="submit"
          size="lg"
          color="primary"
          class="login-btn full-width"
          :loading="loading"
        >
          <q-icon name="login" class="q-mr-sm" />
          Login
        </q-btn>
      </q-form>

      <div class="actions-section q-mt-lg">
        <q-btn
          flat
          color="grey-7"
          @click="goBack"
          class="q-mb-sm"
        >
          <q-icon name="arrow_back" class="q-mr-sm" />
          Back to Auth
        </q-btn>
        
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
      message: 'Login successful! Redirecting to dashboard...',
      position: 'top'
    });
    
    // TODO: Redirect to shop dashboard
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

.login-form .q-input {
  margin-bottom: 1rem;
}

.login-btn {
  height: 56px;
  border-radius: 28px;
  font-weight: 600;
  text-transform: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.actions-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1.5rem;
}
</style>
