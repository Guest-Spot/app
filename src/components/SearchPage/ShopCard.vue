<template>
  <div class="shop-card bg-block border-radius-md" @click="$emit('click', shop)">
    <div class="shop-image">
      <ImageCarousel :pictures="shop.pictures" />
    </div>
    <div class="shop-details">
      <div class="flex justify-between items-center no-wrap q-gap-md">
        <h4 class="shop-title">{{ shop.name }}</h4>
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
          <span>{{ shop.city }} {{ shop.address }}</span>
        </div>
        <div class="shop-hours text-grey-6">
          <q-icon name="schedule" size="16px" />
          <span>{{ openingTimeText }}</span>
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
import { OpeningTimesIndexDays } from 'src/interfaces/enums';

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

const openingTimeText = computed(() => {
  const dayIndex = new Date().getDay();
  const todayKey = Object.entries(OpeningTimesIndexDays).find(
    ([, value]) => Number(value) === dayIndex
  )?.[0] as keyof typeof OpeningTimesIndexDays | undefined;
  const todayTime = props.shop.openingTimes?.find(time => time.day === todayKey);
  if (todayTime?.start && todayTime?.end) {
    return `${formatTime(todayTime.start)} - ${formatTime(todayTime.end)}`;
  }
  return 'Closed';
});

const toggleFavorite = () => {
  const shopData = {
    uuid: props.shop.uuid,
    username: props.shop.username,
    name: props.shop.name,
    city: props.shop.city,
    address: props.shop.address,
    description: props.shop.description,
    pictures: props.shop.pictures,
    lat: props.shop.lat,
    lng: props.shop.lng,
    ...(props.shop.phone && { phone: props.shop.phone }),
    ...(props.shop.email && { email: props.shop.email }),
    ...(props.shop.dateOpened && { dateOpened: props.shop.dateOpened }),
    ...(props.shop.openingTimes && { openingTimes: props.shop.openingTimes }),
    ...(props.shop.pricing && { pricing: props.shop.pricing }),
    ...(props.shop.instagram && { instagram: props.shop.instagram })
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
