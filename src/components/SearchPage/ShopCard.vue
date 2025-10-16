<template>
  <div class="shop-card bg-block border-radius-md" @click="$emit('click', shop)">
    <div class="shop-image">
      <ImageCarousel v-if="shopPictures.length" :pictures="shopPictures" />
      <div v-else class="bg-block border-radius-md shop-image-placeholder">
        <q-icon name="no_photography" size="48px" color="grey-9" class="absolute-center" />
      </div>
    </div>
    <div class="shop-details">
      <div class="flex justify-between items-center no-wrap q-gap-md">
        <h4 class="shop-title">{{ shop.name }}</h4>
        <q-btn
          round
          flat
          dense
          :icon="isFavorite ? 'bookmark' : 'bookmark_border'"
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
          <span>{{ openingHourText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFavorites } from 'src/modules/useFavorites';
import useDate from 'src/modules/useDate';
import type { IUser } from 'src/interfaces/user';
import ImageCarousel from 'src/components/ImageCarousel.vue';
import { OpeningHoursIndexDays } from 'src/interfaces/enums';

interface Props {
  shop: IUser;
}

interface Emits {
  (e: 'click', shop: IUser): void;
  (e: 'favorite', shopDocumentId: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isShopFavorite, toggleShopFavorite } = useFavorites();
const { formatTime } = useDate();

const isFavorite = computed(() => isShopFavorite(props.shop.documentId));
const shopPictures = computed(() => props.shop.pictures?.map((picture) => picture.url) || []);

const openingHourText = computed(() => {
  const dayIndex = new Date().getDay();
  const todayKey = Object.entries(OpeningHoursIndexDays).find(
    ([, value]) => Number(value) === dayIndex,
  )?.[0] as keyof typeof OpeningHoursIndexDays | undefined;
  const todayTime = props.shop.openingHours?.find((time) => time.day === todayKey);
  if (todayTime?.start && todayTime?.end) {
    return `${formatTime(todayTime.start)} - ${formatTime(todayTime.end)}`;
  }
  return 'Closed';
});

const toggleFavorite = () => {
  const shopData = {
    documentId: props.shop.documentId,
    createdAt: props.shop.createdAt,
    updatedAt: props.shop.updatedAt,
    name: props.shop.name,
    city: props.shop.city,
    address: props.shop.address,
    link: props.shop.link,
    description: props.shop.description,
    pictures: props.shop.pictures,
    ...(props.shop.phone && { phone: props.shop.phone }),
    ...(props.shop.email && { email: props.shop.email }),
    ...(props.shop.openingHours && { openingHours: props.shop.openingHours }),
    ...(props.shop.link && { link: props.shop.link }),
  };
  toggleShopFavorite(shopData);
  emit('favorite', props.shop.documentId);
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

.shop-image-placeholder {
  width: 100%;
  height: 200px;
  background-color: var(--bg-block);
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
