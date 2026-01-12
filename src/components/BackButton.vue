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
  // Check if user came from within the app (same origin referrer)
  const referrer = document.referrer;
  const currentOrigin = window.location.origin;
  const hasValidReferrer = referrer && referrer.startsWith(currentOrigin);

  // Also check if there's actual navigation history
  // In SPA, history.length can be misleading, so we check referrer first
  if (hasValidReferrer && window.history.length > 1) {
    router.back();
  } else {
    // If no valid referrer (direct link), navigate to home page
    void router.push('/');
  }
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

