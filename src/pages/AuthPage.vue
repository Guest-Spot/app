<template>
  <q-page class="auth-page flex flex-center">
    <div class="container text-center">
      <div class="welcome-section q-mb-xl">
        <h2 class="text-h3 text-weight-bold q-mb-md">Welcome to GuestSpot</h2>
        <p class="text-h6 text-grey-7">
          Your ultimate destination for tattoo artistry and shop discovery
        </p>
      </div>

      <div class="auth-buttons q-gutter-y-md">
        <q-btn
          size="lg"
          color="primary"
          class="auth-btn full-width"
          @click="navigateToLogin('shop')"
        >
          <q-icon name="store" class="q-mr-sm" />
          Login as a Shop
        </q-btn>

        <q-btn
          size="lg"
          color="secondary"
          class="auth-btn full-width"
          @click="navigateToLogin('artist')"
        >
          <q-icon name="brush" class="q-mr-sm" />
          Login as an Artist
        </q-btn>

        <q-btn
          size="lg"
          outline
          color="grey-7"
          class="auth-btn full-width"
          @click="continueAsGuest"
        >
          <q-icon name="person" class="q-mr-sm" />
          Continue as Guest
        </q-btn>
      </div>

      <div class="info-section q-mt-xl">
        <p class="text-caption text-grey-6">
          Shops can manage their services and bookings<br>
          Artists can showcase their portfolio and skills<br>
          Guests can browse and discover without registration
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToLogin = (type: 'shop' | 'artist') => {
  void router.push(`/login/${type}`);
};

const continueAsGuest = () => {
  void router.push('/');
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
}

.auth-btn {
  height: 56px;
  border-radius: 28px;
  font-weight: 600;
  text-transform: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.info-section {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1.5rem;
}
</style>
