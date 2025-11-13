<template>
  <div @click="$emit('edit', work.documentId)" class="portfolio-item bg-block border-radius-md">
    <div class="portfolio-carousel q-z-1">
      <ImageCarousel :pictures="pictures" height="200px" />
    </div>
    <div v-if="editable" class="portfolio-edit bg-block q-z-2">
      <q-btn round color="dark" icon="edit" size="sm" @click="$emit('edit', work.documentId)" />
      <q-btn
        round
        color="negative"
        icon="delete"
        size="sm"
        @click="$emit('delete', work.documentId)"
      />
    </div>
    <div class="portfolio-details">
      <h4 class="portfolio-title">{{ work.title }}</h4>
      <p class="portfolio-description text-grey-6">{{ work.description }}</p>
      <div class="portfolio-tags">
        <q-chip
          v-for="(tag, index) in work.tags"
          :key="`tag-${index}`"
          :label="tag.name"
          class="portfolio-tag bg-block"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ImageCarousel } from 'src/components';
import type { IPortfolio } from 'src/interfaces/portfolio';

interface Props {
  work: IPortfolio;
  editable?: boolean;
}

interface Emits {
  (e: 'edit', documentId: string): void;
  (e: 'delete', documentId: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const pictures = computed(() => props.work.pictures.map((picture) => picture.url));

// Make component available for import
defineExpose({});
</script>

<style scoped lang="scss">
.portfolio-item {
  overflow: hidden;
}

.portfolio-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.portfolio-details {
  padding: 20px;
}

.portfolio-edit {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 4px;
  transition: opacity 0.3s ease;
  border-radius: 20px;
  padding: 4px;
}

.portfolio-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}

.portfolio-description {
  margin: 0 0 16px 0;
  line-height: 1.4;
  font-size: 14px;
}

.portfolio-tags {
  display: flex;
  flex-wrap: wrap;
}

.portfolio-tag {
  font-size: 12px;
  font-weight: 600;
}
</style>
