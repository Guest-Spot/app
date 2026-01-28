<template>
  <div class="pending-approval-banner bg-block border-radius-lg q-pa-md">
    <div class="banner-content">
      <div class="banner-icon">
        <q-icon name="pending_actions" color="warning" size="24px" />
      </div>
      <div class="banner-text">
        <h4 class="text-subtitle1 q-ma-none text-weight-medium">{{ title }}</h4>
        <div class="text-body2">{{ text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  text: string;
}>();
</script>

<style scoped>
.pending-approval-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 255, 255, 0.02));
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.banner-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 193, 7, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
}
</style>
