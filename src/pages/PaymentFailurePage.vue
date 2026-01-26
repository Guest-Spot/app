<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="failure-icon-wrapper">
          <q-icon name="error" color="negative" />
        </div>

        <div class="flex column items-center">
          <h3 class="text-h5 text-bold q-my-sm">Payment Failed</h3>
          <p class="text-negative text-center q-mb-md q-pa-md text-subtitle2 bg-block border-radius-lg">
            Your payment could not be processed. Please try again or contact support if the problem persists.
          </p>
          <p class="text-grey-6 text-center q-px-xl text-bold">
            You can safely close this browser window now.
          </p>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  setTimeout(() => {
    // Redirect to deep link - this will be intercepted by the app
    // and trigger appUrlOpen event, which will close the browser
    window.location.href = 'com.guestspot.app://close-browser';
  }, 500);
});
</script>

<style scoped lang="scss">
.failure-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--q-negative-rgb), 0.1);

  .q-icon {
    font-size: 80px;
  }
}
</style>

