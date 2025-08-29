<template>
  <q-page class="page q-py-md flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="flex no-wrap items-center justify-center q-mb-lg">
        <q-img v-if="isDark" src="~/assets/logo.png" class="logo" width="150px" height="150px" />
        <q-img v-else src="~/assets/logo-dark.png" class="logo" width="150px" height="150px" />
      </div>
      <div class="container">
        <div class="text-center full-width bg-block border-radius-lg q-pa-lg">
          <div class="container flex column items-center justify-start q-gap-sm q-mb-md">
            <h2 class="text-h5 q-my-none">Welcome to <span class="text-primary">GuestSpot</span></h2>
            <div class="welcome-section">
              <p class="text-grey-6">
                Your ultimate destination for tattoo artistry and shop discovery
              </p>
            </div>
          </div>

          <div class="flex column q-gap-md">
            <div class="button-group">
              <q-btn
                class="auth-btn bg-block full-width"
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
                class="auth-btn bg-block full-width"
                @click="navigateToLogin('artist')"
                rounded
                unelevated
              >
                <q-icon name="brush" class="q-mr-sm" size="24px" />
                Login as an Artist
              </q-btn>
            </div>

            <div class="flex no-wrap items-center justify-center q-gap-md">
              <div class="q-mx-sm or-line" />
              <span class="text-subtitle1 text-grey-7">or</span>
              <div class="q-mx-sm or-line" />
            </div>

            <div class="button-group">
              <q-btn
                outline
                color="grey-6"
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
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const isDark = inject<boolean>('isDark');

const router = useRouter();

const navigateToLogin = (type: 'shop' | 'artist') => {
  void router.push(`/login/${type}`);
};

const continueAsGuest = () => {
  void router.push('/');
};
</script>

<style scoped lang="scss">
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.auth-btn {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.6px;
  text-transform: none;
  transition: all 0.3s ease;
}

.guest-btn {
  font-weight: 600;
  font-size: 18px;
  text-transform: none;
  transition: all 0.3s ease;
}

.or-line {
  width: 40%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.body--dark {
  .or-line {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
