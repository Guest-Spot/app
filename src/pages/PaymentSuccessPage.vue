<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="success-icon-wrapper">
          <q-icon name="check_circle" color="positive" />
        </div>

        <div class="flex column items-center">
          <h3 class="text-h5 text-bold q-my-sm">Payment Successful</h3>
          <p class="text-positive text-center q-mb-md q-pa-md text-subtitle2 bg-block border-radius-lg">
            Your payment has been processed successfully.
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
import { WEB_FALLBACK } from 'src/config/constants';

onMounted(() => {
  setTimeout(() => {
    window.location.href = `${WEB_FALLBACK}/#/close-browser`;
  }, 500);
});
</script>

<style scoped lang="scss">
.success-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(var(--q-positive-rgb), 0.1);

  .q-icon {
    font-size: 80px;
  }
}
</style>

