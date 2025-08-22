<template>
  <div class="shop-card" @click="$emit('click', shop)">
    <div class="shop-image">
      <q-img
        :src="shop.image || 'https://via.placeholder.com/300x200'"
        :ratio="16/9"
        class="shop-img"
        spinner-color="dark"
        spinner-size="32px"
      />
    </div>
    <div class="shop-details">
      <h4 class="shop-title">{{ shop.name }}</h4>
      <p class="shop-location">{{ shop.location }}</p>
      <p class="shop-description">{{ shop.description }}</p>
      <div class="shop-actions">
        <q-btn
          round
          flat
          dense
          :icon="isFavorite ? 'favorite' : 'favorite_border'"
          :color="isFavorite ? 'red' : 'grey-6'"
          @click.stop="toggleFavorite"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useFavorites } from '../../modules/useFavorites';

interface Shop {
  id: number;
  name: string;
  location: string;
  description: string;
  image?: string;
  addedAt?: number; // Optional for backward compatibility
}

interface Props {
  shop: Shop;
}

interface Emits {
  (e: 'click', shop: Shop): void;
  (e: 'favorite', shopId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { isShopFavorite, toggleShopFavorite } = useFavorites();

const isFavorite = computed(() => isShopFavorite(props.shop.id));

const toggleFavorite = () => {
  toggleShopFavorite(props.shop);
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
  padding: 20px;
}

.shop-title {
  margin: 0 0 8px 0;
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
}

.shop-location {
  margin: 0 0 10px 0;
  color: var(--primary);
  font-size: 14px;
  font-weight: 500;
}

.shop-description {
  margin: 0 0 15px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.shop-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
