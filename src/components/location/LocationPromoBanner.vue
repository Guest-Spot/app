<template>
  <div class="location-promo">
    <div class="location-promo__icon">
      <q-icon name="place" />
    </div>
    <div class="location-promo__text">
      <div class="text-subtitle2 text-bold">{{ title }}</div>
      <div class="text-caption text-grey-6">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isGuest: boolean;
}>();

const title = computed(() => (props.isGuest ? 'Add your address' : 'Add your business address'));
const description = computed(() =>
  props.isGuest
    ? 'We use it to find nearby tattoo artists and shops'
    : 'Help guests find you faster and understand how far you are from them.',
);
</script>

<style scoped>
.location-promo {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.06) 100%);
}

.location-promo__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary);
  flex: 0 0 auto;
}

.location-promo__text {
  flex: 1 1 180px;
  min-width: 180px;
}

.body--dark .location-promo {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.08) 100%);
}

.body--dark .location-promo__icon {
  background: rgba(255, 255, 255, 0.08);
}
</style>
