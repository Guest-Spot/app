<template>
  <q-page class="login-page q-py-md flex column items-start q-gap-md">
    <div class="container flex no-wrap items-center justify-start q-gap-md">
      <q-btn
        round
        color="grey-6"
        @click="goBack"
        class="back-btn"
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
              <label class="input-label">Enter your Email</label>
              <q-input
                v-model="form.email"
                type="text"
                placeholder="Enter your login"
                outlined
                rounded
                size="lg"
                :rules="[val => !!val || 'Login is required']"
                class="full-width custom-input"
                bg-color="white"
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
                bg-color="white"
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
  email: '',
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
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  width: 100%;
  background: white;
  border-radius: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.input-label {
  display: block;
  text-align: left;
  color: #2A2A2A;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
}

.custom-input {
  background: #FDFDFD !important;
}

.custom-input :deep(.q-field__control) {
  border: 1.17px solid #D1D1D1 !important;
  border-radius: 17.6px !important;
  background: #FDFDFD !important;
}

.custom-input :deep(.q-field__control:hover) {
  border-color: #B0B0B0 !important;
}

.custom-input :deep(.q-field__control--focused) {
  border-color: #151515 !important;
  box-shadow: 0 0 0 2px rgba(21, 21, 21, 0.1) !important;
}

.custom-input :deep(.q-field__native) {
  color: #696969 !important;
  font-size: 16.4px !important;
  font-weight: 500 !important;
}

.custom-input :deep(.q-field__native::placeholder) {
  color: #696969 !important;
  opacity: 0.8;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.back-btn {
  background: #F0F0F0 !important;
  color: #696969 !important;
  border: 1px solid #D1D1D1 !important;
}

.login-btn {
  background: #151515 !important;
  color: white !important;
  font-weight: 700 !important;
  font-size: 18.8px !important;
  letter-spacing: 0.6px !important;
  border-radius: 17.6px !important;
  height: 32px !important;
  text-transform: none !important;
}
</style>
