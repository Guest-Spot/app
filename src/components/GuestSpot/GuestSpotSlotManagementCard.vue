<template>
  <div @click="handleEdit" class="slot-card bg-block border-radius-lg flex column q-gap-md q-pa-md">
    <!-- Header: Icon + Title + Status + Actions -->
    <div class="slot-header flex items-center justify-between">
      <div class="slot-header-left flex items-center q-gap-md">
        <!-- Icon Container -->
        <div class="slot-icon-container">
          <q-icon name="chair" class="slot-icon" />
        </div>

        <!-- Title and Status -->
        <div class="slot-title-section flex column">
          <div class="slot-title-main text-subtitle1 text-weight-bold">
            {{ slotData.title && slotData.title.trim() ? slotData.title : `Slot ${index}` }}
          </div>
          <div class="slot-status flex items-center q-gap-xs">
            <q-icon name="circle" size="8px" color="positive" />
            <span class="status-text text-caption text-weight-medium text-positive">AVAILABLE NOW</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="slot-actions flex q-gap-xs">
        <q-btn
          flat
          round
          icon="edit"
          color="grey-7"
          size="sm"
          class="bg-block"
          @click="handleEdit"
          :loading="isUpdating"
        />
        <q-btn
          flat
          round
          icon="delete"
          color="negative"
          size="sm"
          class="bg-block"
          @click.stop="handleDelete"
          :loading="isDeleting"
        />
      </div>
    </div>

    <!-- Info Blocks: Horizontal Layout -->
    <div class="info-blocks flex q-gap-sm">
      <!-- Pricing Block -->
      <div class="info-block bg-block border-radius-md q-pa-md">
        <div class="info-label text-caption text-weight-medium text-grey-6">PRICING</div>
        <div class="info-value flex items-end no-wrap q-gap-xs q-mt-xs">
          <span class="value-amount text-body1 text-weight-bold">{{ formattedPrice }}</span>
          <span class="value-unit text-caption text-grey-6">{{ priceUnit }}</span>
        </div>
      </div>

      <!-- Spaces Block -->
      <div class="info-block bg-block border-radius-md q-pa-md">
        <div class="info-label text-caption text-weight-medium text-grey-6">SPACES</div>
        <div class="info-value flex items-center q-gap-xs q-mt-xs">
          <span class="value-amount text-body1 text-weight-bold">{{ formattedSpaces }}</span>
        </div>
      </div>

      <!-- Deposit Block -->
      <div class="info-block bg-block border-radius-md q-pa-md">
        <div class="info-label text-caption text-weight-medium text-grey-6">DEPOSIT</div>
        <div class="info-value q-mt-xs">
          <span class="value-amount text-body1 text-weight-bold">{{ formattedDeposit }}</span>
        </div>
      </div>
    </div>

    <!-- Description Section -->
    <div v-if="slotData.description" class="description-section flex column q-gap-sm">
      <div class="section-header flex items-center q-gap-xs">
        <q-icon name="description" size="18px" />
        <span class="text-weight-medium">Description</span>
      </div>
      <p class="description-text text-body2 text-grey-6">
        {{ slotData.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { IGuestSpotSlot } from 'src/interfaces/guestSpot';
import { EGuestSpotPricingType } from 'src/interfaces/enums';

interface Props {
  slotData: IGuestSpotSlot;
  isUpdating?: boolean;
  isDeleting?: boolean;
  index: number;
}

interface Emits {
  (e: 'edit', slot: IGuestSpotSlot): void;
  (e: 'delete', documentId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleEdit = () => {
  emit('edit', props.slotData);
};

const handleDelete = () => {
  emit('delete', props.slotData.documentId);
};

// Get Daily price or first available price
const displayPrice = computed(() => {
  const dailyPrice = props.slotData.pricingOptions.find(
    (option) => option.type === EGuestSpotPricingType.Daily
  );

  if (dailyPrice) {
    return {
      amount: dailyPrice.amount,
      type: dailyPrice.type,
    };
  }

  // If no daily price, use first available
  if (props.slotData.pricingOptions.length > 0 && props.slotData.pricingOptions[0]) {
    const firstOption = props.slotData.pricingOptions[0];
    return {
      amount: firstOption.amount,
      type: firstOption.type,
    };
  }

  return null;
});

const formattedPrice = computed(() => {
  if (!displayPrice.value) return '$0';
  return `$${(displayPrice.value.amount / 100).toFixed(0)}`;
});

const priceUnit = computed(() => {
  if (!displayPrice.value) return '';
  const type = displayPrice.value.type;
  if (type === EGuestSpotPricingType.Daily) return '/day';
  if (type === EGuestSpotPricingType.Hourly) return '/hour';
  return '';
});

const formattedSpaces = computed(() => {
  return props.slotData.spaces.toString().padStart(2, '0');
});

const formattedDeposit = computed(() => {
  return `$${(props.slotData.depositAmount / 100).toFixed(0)}`;
});
</script>

<style scoped lang="scss">
.slot-card {
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.slot-header {
  width: 100%;

  .slot-header-left {
    flex: 1;
  }

  .slot-icon-container {
    position: relative;
    width: 48px;
    height: 48px;
    border-radius: var(--border-radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.1;
      background-color: var(--q-primary);
      border: 1px solid var(--q-primary);
    }

    .slot-icon {
      color: white;
      font-size: 24px;
    }
  }

  .slot-title-section {
    flex: 1;
  }

  .slot-actions {
    flex-shrink: 0;
  }
}

.info-blocks {
  width: 100%;

  .info-block {
    flex: 1;
    min-width: 0;
  }
}

.description-section {
  width: 100%;

  .description-text {
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 0;
  }
}
</style>
