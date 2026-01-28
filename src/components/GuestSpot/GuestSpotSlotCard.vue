<template>
  <div class="guest-spot-slot-card bg-block border-radius-md cursor-pointer" @click="handleClick">
    <div class="slot-image">
      <ImageCarousel v-if="shopPictures.length" :pictures="shopPictures" />
      <div v-else class="border-radius-md slot-image-placeholder">
        <q-icon name="store" size="48px" color="grey-9" class="absolute-center" />
      </div>
    </div>
    <div class="slot-details q-pa-md">
      <div class="flex justify-between items-start q-mb-sm">
        <div>
          <h4 class="slot-shop-name text-weight-bold q-my-none">
            {{ slotData.shop?.name || 'Unknown shop' }}
          </h4>
          <VerifiedBadge v-if="slotData.shop?.verified" icon-only class="q-mt-xs" />
        </div>
        <q-chip color="primary" text-color="white">
          {{ slotData.spaces }} space{{ slotData.spaces !== 1 ? 's' : '' }}
        </q-chip>
      </div>

      <p class="slot-description text-body2 text-grey-7 q-mb-sm">
        {{ slotData.description }}
      </p>

      <div class="pricing-section q-mb-sm">
        <div class="text-caption text-grey-6 q-mb-xs">Pricing:</div>
        <div class="flex flex-wrap q-gap-xs">
          <q-chip
            v-for="(option, index) in slotData.pricingOptions"
            :key="index"
            :label="`${getPricingTypeLabel(option.type)}: $${(option.amount / 100).toFixed(2)}`"
            color="primary"
            text-color="white"
            dense
          />
        </div>
      </div>

      <div class="deposit-info q-mb-sm">
        <q-icon name="security" size="16px" color="primary" />
        <span class="text-body2 text-weight-medium">
          Deposit: ${{ (slotData.depositAmount / 100).toFixed(2) }}
        </span>
      </div>

      <div v-if="location" class="location-info text-grey-6">
        <q-icon name="location_on" size="16px" />
        <span>{{ location }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import { EGuestSpotPricingType } from 'src/interfaces/enums';
import { ImageCarousel, VerifiedBadge } from 'src/components';

interface Props {
  slotData: IGuestSpotSlot;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  click: [slot: IGuestSpotSlot];
}>();

const shopPictures = computed(() => {
  return (
    props.slotData.shop?.pictures?.map((pic) => ({
      id: pic.id || '',
      url: pic.url,
    })) || []
  );
});

const location = computed(() => {
  const shop = props.slotData.shop;
  if (!shop) return null;
  return [shop.country, shop.state, shop.city, shop.address].filter(Boolean).join(', ');
});

const getPricingTypeLabel = (type: EGuestSpotPricingType): string => {
  const labels: Record<EGuestSpotPricingType, string> = {
    [EGuestSpotPricingType.Hourly]: 'Hourly',
    [EGuestSpotPricingType.Daily]: 'Daily',
    [EGuestSpotPricingType.Flat]: 'Flat',
  };
  return labels[type] || type;
};

const handleClick = () => {
  emit('click', props.slotData);
};
</script>

<style scoped lang="scss">
.guest-spot-slot-card {
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.slot-image {
  position: relative;
  width: 100%;
  height: 200px;
}

.slot-image-placeholder {
  width: 100%;
  height: 200px;
  background-color: var(--bg-block);
  display: flex;
  align-items: center;
  justify-content: center;
}

.slot-details {
  display: flex;
  flex-direction: column;
}

.slot-shop-name {
  font-size: 18px;
}

.slot-description {
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pricing-section {
  display: flex;
  flex-direction: column;
}

.deposit-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.location-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
</style>
