<template>
  <q-chip
    v-if="verified"
    dense
    rounded
    color="primary"
    text-color="white"
    class="verified-badge"
    :class="{ 'verified-badge--icon-only': iconOnly }"
  >
    <q-icon name="verified" size="16px" />
    <span v-if="!iconOnly">Verified</span>
  </q-chip>
</template>

<script setup lang="ts">
defineProps({
  verified: {
    type: Boolean,
    default: false,
  },
  iconOnly: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="scss">
.verified-badge {
  gap: 6px;
  font-size: 0.75rem;
  text-transform: none;
  line-height: 1;
  padding: 0 6px;
}

.verified-badge q-icon {
  margin: 0;
}

.verified-badge--icon-only {
  padding: 1px;
}
</style>
