<template>
  <q-page class="auth-page q-py-md flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container flex no-wrap items-center justify-center q-mb-md">
        <q-img src="~/assets/logo-dark.png" class="logo" width="150px" />
      </div>
      <div class="container">
        <div class="content text-center full-width">
          <div class="container flex column items-center justify-start q-gap-md">
            <h2 class="text-h5 q-my-none">Welcome to <span class="text-primary">GuestSpot</span></h2>
            <div class="welcome-section">
              <p class="text-subtitle1 text-grey-7 q-mb-lg">
                Your ultimate destination for tattoo artistry and shop discovery
              </p>
            </div>
          </div>

          <div class="flex column q-gap-md">
            <div class="button-group">
              <q-btn
                color="dark"
                class="auth-btn full-width"
                @click="navigateToLogin('shop')"
                rounded
                unelevated
              >
                <q-icon name="store" class="q-mr-sm" size="24px" />
                Login as a Shop
              </q-btn>
            </div>

            <div class="button-group">
              <q-btn
                color="dark"
                class="auth-btn full-width"
                @click="navigateToLogin('artist')"
                rounded
                unelevated
              >
                <q-icon name="brush" class="q-mr-sm" size="24px" />
                Login as an Artist
              </q-btn>
            </div>

            <div class="flex no-wrap items-center justify-center q-gap-md">
              <div class="q-mx-sm" style="width: 40%; border-bottom: 1px solid var(--divider-light);" />
              <span class="text-subtitle1 text-grey-7">or</span>
              <div class="q-mx-sm" style="width: 40%; border-bottom: 1px solid var(--divider-light);" />
            </div>

            <div class="button-group">
              <q-btn
                outline
                color="grey-7"
                class="guest-btn full-width"
                @click="continueAsGuest"
                rounded
              >
                <q-icon name="person" class="q-mr-sm" size="24px" />
                Continue as Guest
              </q-btn>
            </div>
          </div>
        </div>
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

.content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
  padding: 20px;
}

.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.auth-btn {
  background: var(--brand-dark);
  color: white;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.6px;
  height: 56px;
  text-transform: none;
  transition: all 0.3s ease;
}

.guest-btn {
  height: 56px;
  font-weight: 600;
  font-size: 18px;
  text-transform: none;
  transition: all 0.3s ease;
}

.info-section {
  border-top: 1px solid var(--shadow-light);
  padding-top: 1.5rem;
}
</style>
