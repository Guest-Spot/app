<template>
  <div class="shop-card bg-block border-radius-md" @click="$emit('click', shop)">
    <div class="shop-image">
      <ImageCarousel :pictures="shop.pictures" />
    </div>
    <div class="shop-details">
      <div class="flex justify-between items-center no-wrap q-gap-md">
        <h4 class="shop-title">{{ shop.title }}</h4>
        <q-btn
          round
          flat
          dense
          :icon="isFavorite ? 'favorite' : 'favorite_border'"
          :color="isFavorite ? 'red' : 'grey-6'"
          @click.stop="toggleFavorite"
        />
      </div>
      <div class="shop-info">
        <div class="shop-location text-grey-6">
          <q-icon name="location_on" size="16px" />
          <span>{{ shop.location }}</span>
        </div>
        <div class="shop-hours text-grey-6">
          <q-icon name="schedule" size="16px" />
          <span>{{ workingHoursText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFavorites } from 'src/modules/useFavorites';
import useDate from 'src/modules/useDate';
import type { IShop } from 'src/interfaces/shop';
import ImageCarousel from 'src/components/ImageCarousel.vue';

interface Props {
  shop: IShop;
}

interface Emits {
  (e: 'click', shop: IShop): void;
  (e: 'favorite', shopUuid: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isShopFavorite, toggleShopFavorite } = useFavorites();
const { formatTime } = useDate();

const isFavorite = computed(() => isShopFavorite(props.shop.uuid));

const workingHoursText = computed(() => {
  if (props.shop.workingHoursStart && props.shop.workingHoursEnd) {
    return `${formatTime(props.shop.workingHoursStart)} - ${formatTime(props.shop.workingHoursEnd)}`;
  }
  return '9:00 - 18:00';
});

const toggleFavorite = () => {
  const shopData = {
    uuid: props.shop.uuid,
    username: props.shop.username,
    title: props.shop.title,
    location: props.shop.location,
    description: props.shop.description,
    pictures: props.shop.pictures,
    ...(props.shop.phone && { phone: props.shop.phone }),
    ...(props.shop.email && { email: props.shop.email }),
    ...(props.shop.dateOpened && { dateOpened: props.shop.dateOpened }),
    ...(props.shop.workingHoursStart && { workingHoursStart: props.shop.workingHoursStart }),
    ...(props.shop.workingHoursEnd && { workingHoursEnd: props.shop.workingHoursEnd }),
    ...(props.shop.pricing && { pricing: props.shop.pricing }),
    ...(props.shop.instagram && { instagram: props.shop.instagram }),
    ...(props.shop.facebook && { facebook: props.shop.facebook })
  };
  toggleShopFavorite(shopData);
  emit('favorite', props.shop.uuid);
};
</script>

<style scoped lang="scss">
.shop-card {
  overflow: hidden;
  cursor: pointer;
}

.shop-image {
  position: relative;
}

.shop-details {
  padding: 16px;
}

.shop-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shop-location,
.shop-hours {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.shop-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
