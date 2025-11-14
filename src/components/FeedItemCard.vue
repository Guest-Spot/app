<template>
  <div
    class="feed-item-card bg-block border-radius-md"
    :class="{ 'single-view': viewMode === 'single', 'tile-view': viewMode === 'tile' }"
    @click="handleClick"
  >
    <div class="feed-item-image">
      <ImageCarousel
        :pictures="pictures"
        :height="viewMode === 'single' ? '400px' : '200px'"
      />
    </div>
    <div v-if="viewMode === 'single'" class="feed-item-details">
      <div class="feed-item-info">
        <div class="flex items-center q-gap-sm">
          <div class="owner-info" @click.stop="navigateToOwner">
            <q-avatar v-if="item.owner?.avatar?.url" size="24px" class="q-mr-xs">
              <q-img :src="item.owner.avatar.url" fit="cover" ratio="0.85" />
            </q-avatar>
            <span class="owner-name text-weight-medium">
              {{ item.owner?.name || 'Unknown' }}
              <VerifiedBadge v-if="item.owner?.verified" :size="12" />
            </span>
          </div>
          <div v-if="item.owner?.city" class="location text-grey-6">
            <span class="text-grey-6">•</span>
            <q-icon name="location_on" size="14px" />
            <span>{{ item.owner.city }}</span>
          </div>
          <div v-if="item.createdAt" class="date text-grey-6">
            <span class="text-grey-6">•</span>
            <q-icon name="schedule" size="14px" />
            <span>{{ formattedDate }}</span>
          </div>
        </div>
      </div>
      <div v-if="viewMode === 'single' && item.title" class="portfolio-title hidden">
        {{ item.title }}
      </div>
      <ExpandableText
        collapsible
        :text="item.description"
        class="portfolio-description"
      />
      <div v-if="viewMode === 'single' && item.tags?.length" class="portfolio-tags">
        <q-chip
          v-for="(tag, index) in item.tags"
          :key="`tag-${index}`"
          :label="tag.name"
          class="portfolio-tag bg-block"
        />
      </div>
    </div>
    <div v-if="editable" class="flex justify-between items-start full-width full-height q-z-2 q-pa-sm">
      <q-btn
        round
        color="negative"
        icon="delete"
        size="xs"
        flat
        class="bg-block"
        @click.stop="$emit('delete', item.documentId)"
      />
      <q-btn round icon="edit" size="xs" flat class="bg-block" @click.stop="$emit('edit', item.documentId)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ImageCarousel from 'src/components/ImageCarousel.vue';
import VerifiedBadge from 'src/components/VerifiedBadge.vue';
import ExpandableText from 'src/components/ExpandableText.vue';
import type { IPortfolio } from 'src/interfaces/portfolio';
import { UserType } from 'src/interfaces/enums';

interface Props {
  item: IPortfolio;
  viewMode?: 'tile' | 'single';
  editable?: boolean;
}

interface Emits {
  (e: 'click', item: IPortfolio): void;
  (e: 'edit', documentId: string): void;
  (e: 'delete', documentId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'tile',
  editable: false,
});

const emit = defineEmits<Emits>();
const router = useRouter();

const pictures = computed(() => props.item.pictures.map((picture) => picture.url));

const formattedDate = computed(() => {
  if (!props.item.createdAt) return '';
  const date = new Date(props.item.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
});

const handleClick = () => {
  emit('click', props.item);
};

const navigateToOwner = () => {
  if (!props.item.owner) return;

  const ownerType = props.item.owner.type;
  const path = ownerType === UserType.Artist
    ? `/artist/${props.item.owner.documentId}`
    : `/shop/${props.item.owner.documentId}`;

  void router.push(path);
};
</script>

<style scoped lang="scss">
.feed-item-card {
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.tile-view {
    .feed-item-details {
      padding: 12px;
    }

    .feed-item-info {
      gap: 6px;
    }
  }

  &.single-view {
    display: flex;
    flex-direction: column;

    .feed-item-details {
      padding: 16px;
    }

    .feed-item-info {
      gap: 8px;
    }
  }
}

.feed-item-image {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.feed-item-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feed-item-info {
  display: flex;
  flex-direction: column;
  font-size: 12px;
}

.owner-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--q-primary);
  }
}

.owner-name {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.location,
.date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.portfolio-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  margin-top: 4px;
}

.portfolio-description {
  font-size: 13px;
  line-height: 1.4;
}

.portfolio-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}

.portfolio-tag {
  font-size: 11px;
  font-weight: 600;
}
</style>
