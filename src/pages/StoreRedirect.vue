<template>
  <q-page class="page q-py-md flex column items-center justify-center">
    <div class="container">
      <div class="flex column items-center q-gap-md text-center">
        <div class="flex column items-center">
          <h1 class="text-h5 text-bold q-my-sm">Store Redirect</h1>
          <p class="text-grey-6 text-center q-px-xl">
            Please wait while we redirect you to the store...
          </p>
        </div>
        <q-btn
          :href="IOS_STORE_URL"
          label="iOS Store"
          icon="apple"
          class="bg-block q-px-lg back-btn min-w-170px"
          rounded
          target="_blank"
          unelevated
        />
        <q-btn
          :href="ANDROID_STORE_URL"
          label="Android Store"
          icon="android"
          class="bg-block q-px-lg back-btn min-w-170px"
          rounded
          target="_blank"
          unelevated
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { IOS_STORE_URL, ANDROID_STORE_URL } from 'src/config/constants';
</script>

<style scoped lang="scss">
.back-btn {
  min-height: 40px;
}

.min-w-170px {
  min-width: 170px;
}
</style>
