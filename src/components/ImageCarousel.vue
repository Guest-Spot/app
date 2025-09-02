<template>
  <q-carousel
    v-model="slide"
    animated
    :navigation="!!(pictures?.length && pictures.length > 1)"
    infinite
    swipeable
    transition-prev="slide-right"
    transition-next="slide-left"
    class="image-carousel"
    :height="height"
    @click.stop
  >
    <template v-slot:navigation-icon="{ active, onClick }">
      <q-btn
        size="xs"
        flat round dense @click="onClick"
        class="q-ma-none"
      >
        <div class="carousel-dot" :class="{ 'carousel-dot--active': active }" />
      </q-btn>
    </template>

    <q-carousel-slide
      v-for="(picture, index) in pictures"
      :key="index"
      :name="index"
      class="column no-wrap q-pa-none"
    >
      <q-img
        :src="picture"
        :ratio="16/9"
        class="carousel-img"
        spinner-color="dark"
        spinner-size="32px"
      />
    </q-carousel-slide>

    <!-- Fallback image if no pictures -->
    <q-carousel-slide
      v-if="!pictures || pictures.length === 0"
      name="0"
      class="column no-wrap"
    >
      <q-img
        :src="fallbackImage"
        :ratio="16/9"
        class="carousel-img"
        spinner-color="dark"
        spinner-size="32px"
      />
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  pictures?: string[];
  height?: string;
  fallbackImage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  pictures: () => [],
  height: '200px',
  fallbackImage: 'https://via.placeholder.com/300x200'
});

const slide = ref(0);

watch(() => props.pictures, () => {
  if (props.pictures.length > 0) {
    slide.value = 0;
  }
}, { immediate: true });
</script>

<style scoped lang="scss">
.image-carousel {
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

.carousel-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

:deep(.q-carousel__navigation-inner) {
  flex: none;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: var(--box-shadow);
  margin: 0 auto;
  border-radius: var(--border-radius-lg);
  padding: 0 2px;

  .q-btn {
    margin: 0;
    font-size: 6px !important;
  }
}

:deep(.carousel-dot) {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.carousel-dot--active) {
  background: var(--q-primary);
}

:deep(.q-carousel__navigation--bottom) {
  bottom: 4px;
}
</style>
