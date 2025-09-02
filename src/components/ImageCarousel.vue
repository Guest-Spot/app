<template>
  <div class="image-carousel" :style="{ height: height }">
    <Carousel
      v-if="pictures && pictures.length > 0"
      :enabled="pictures && pictures.length > 1"
      v-bind="carouselConfig"
    >
      <Slide v-for="(picture, index) in pictures" :key="`key-${picture}-${index}`">
        <div class="carousel-slide">
          <q-img
            :src="picture"
            :ratio="16/9"
            class="carousel-img"
            spinner-color="dark"
            spinner-size="32px"
          />
        </div>
      </Slide>

      <template #addons>
        <Pagination v-if="pictures && pictures.length > 1" />
      </template>
    </Carousel>

    <!-- Fallback image if no pictures -->
    <div v-else class="fallback-container">
      <q-img
        :src="fallbackImage"
        :ratio="16/9"
        class="carousel-img"
        spinner-color="dark"
        spinner-size="32px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import 'vue3-carousel/carousel.css';
import { Carousel, Slide, Pagination } from 'vue3-carousel';

interface Props {
  pictures?: string[];
  height?: string;
  fallbackImage?: string;
}

withDefaults(defineProps<Props>(), {
  pictures: () => [],
  height: '200px',
  fallbackImage: 'https://via.placeholder.com/300x200'
});

const carouselConfig = computed(() => ({
  itemsToShow: 1,
  wrapAround: true,
  snapAlign: 'center' as const,
  transition: 500
}));
</script>

<style scoped lang="scss">
.image-carousel {
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  position: relative;
  touch-action: pan-y;
}

.carousel-slide {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .carousel-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
  }
}

.fallback-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Vue3-carousel navigation styles
:deep(.carousel__navigation) {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;

  &.carousel__navigation--prev {
    left: 10px;
  }

  &.carousel__navigation--next {
    right: 10px;
  }

  .carousel__navigation-button {
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
}

// Vue3-carousel pagination styles
:deep(.carousel__pagination) {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;

  .carousel__pagination-button {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &--active {
      background: var(--q-primary);
    }
  }
}
</style>
