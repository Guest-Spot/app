<template>
  <div class="shop-card" @click="$emit('click', shop)">
    <div class="shop-image">
      <q-img
        :src="shop.avatar || 'https://via.placeholder.com/300x200'"
        :ratio="16/9"
        class="shop-img"
        spinner-color="dark"
        spinner-size="32px"
      />
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
        <div class="shop-location">
          <q-icon name="location_on" size="16px" color="primary" />
          <span>{{ shop.location }}</span>
        </div>
        <div class="shop-hours">
          <q-icon name="schedule" size="16px" color="primary" />
          <span>{{ workingHoursText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFavorites } from '../../modules/useFavorites';
import type { IShop } from 'src/interfaces/shop';

interface Props {
  shop: IShop;
}

interface Emits {
  (e: 'click', shop: IShop): void;
  (e: 'favorite', shopId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isShopFavorite, toggleShopFavorite } = useFavorites();

const isFavorite = computed(() => isShopFavorite(props.shop.id));

const workingHoursText = computed(() => {
  if (props.shop.workingHoursStart && props.shop.workingHoursEnd) {
    return `${props.shop.workingHoursStart} - ${props.shop.workingHoursEnd}`;
  }
  return '9:00 - 18:00';
});

const toggleFavorite = () => {
  const shopData = {
    id: props.shop.id,
    username: props.shop.username,
    title: props.shop.title,
    location: props.shop.location,
    description: props.shop.description,
    avatar: props.shop.avatar,
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
  emit('favorite', props.shop.id);
};
</script>

<style scoped lang="scss">
.shop-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
  overflow: hidden;
  cursor: pointer;
}

.shop-image {
  position: relative;
}

.shop-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.shop-details {
  padding: 16px;
}

.shop-title {
  margin: 0;
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
}

.shop-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.shop-location,
.shop-hours {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.shop-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
