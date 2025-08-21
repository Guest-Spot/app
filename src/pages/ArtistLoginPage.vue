<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn
        round
        @click="goBack"
        class="back-btn"
        text-color="grey-7"
      >
        <q-icon name="arrow_back" />
      </q-btn>
      <h2 class="text-h5 q-my-none">Welcome, <span class="text-primary">Artist!</span></h2>
    </div>

    <div class="q-my-auto full-width">
      <div class="container">
        <div class="content text-center full-width">
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
                type="password"
                placeholder="**************"
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
              </q-input>
            </div>
    
            <div class="button-group q-mt-md">
              <q-btn
                type="submit"
                color="dark"
                class="login-btn full-width"
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

const router = useRouter();
const $q = useQuasar();

const loading = ref(false);
const form = ref({
  login: '',
  password: ''
});

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
.content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 20px;
}

.input-label {
  display: block;
  text-align: left;
  color: var(--text-dark);
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
  background: var(--brand-dark);
  color: white;
  font-weight: 700;
  font-size: 18.8px;
  letter-spacing: 0.6px;
  height: 32px;
  text-transform: none;
}
</style>
