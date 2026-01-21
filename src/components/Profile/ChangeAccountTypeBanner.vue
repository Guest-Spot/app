<template>
  <div
    class="change-account-banner bg-block border-radius-lg q-pa-md"
    role="button"
    tabindex="0"
    v-ripple
    @click="handleClick"
    @keyup.enter="handleClick"
    @keyup.space="handleClick"
  >
    <div class="banner-content">
      <div class="banner-icon">
        <q-icon name="switch_account" color="primary" size="24px" />
      </div>
      <div class="banner-text">
        <div class="text-subtitle1 text-weight-medium">Upgrade your account</div>
        <div class="text-body2 text-grey-6">Switch to artist or shop to unlock more tools.</div>
      </div>
    </div>
    <q-icon name="chevron_right" size="22px" color="grey-6" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const handleClick = () => {
  void router.push('/profile/change-account-type');
};
</script>

<style scoped>
.change-account-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(var(--red-accent-rgb), 0.14), rgba(255, 255, 255, 0.02));
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  overflow: hidden;
}

.change-account-banner:focus-visible {
  outline: 2px solid var(--q-primary);
  outline-offset: 2px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.banner-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(var(--red-accent-rgb), 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

@media (hover: hover) {
  .change-account-banner:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.16);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
}
</style>
