<template>
  <q-btn
    round
    flat
    @click="handleBack"
    class="bg-block absolute-top-left q-z-2 back-btn"
  >
    <q-icon name="chevron_left" size="24px" />
  </q-btn>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({
  name: 'BackButton',
});

const router = useRouter();

const handleBack = () => {
  // Prefer going back if there is navigation history recorded in the SPA.
  if (window.history.length > 1) {
    router.back();
    return;
  }

  // Otherwise fall back to a safe home route.
  void router.push('/');
};
</script>

<style scoped lang="scss">
.back-btn {
  top: 16px;
  left: 16px;
}

.q-ios-padding {
  .back-btn {
    top: 70px;
  }
}
</style>
