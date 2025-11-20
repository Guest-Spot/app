<template>
  <div
    class="feed-item-card bg-block border-radius-md"
    :class="{ 'single-view': viewMode === 'single', 'tile-view': viewMode === 'tile' }"
    @click="handleClick"
  >
    <div class="feed-item-image">
      <template v-if="viewMode === 'single'">
        <ImageCarousel
          :pictures="pictures"
          :height="'400px'"
          :enable-image-preview="enableImagePreview"
        />
      </template>
      <template v-else>
        <q-img
          :src="tileImage"
          ratio="16/9"
          class="tile-image"
          spinner-color="dark"
          spinner-size="32px"
        />
        <NoteStack
          v-if="pictures?.length > 1"
          class="absolute-top-right q-ma-sm bg-block border-radius-md q-pa-xs"
          size="26px"
        />
      </template>
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
    <div v-if="editable" class="flex justify-between items-start absolute-bottom-right q-z-2 q-pa-sm">
      <q-btn
        round
        dense
        icon="more_horiz"
        class="bg-block"
      >
        <q-menu anchor="top right" self="bottom right">
          <q-list>
            <q-item v-ripple clickable @click.stop="$emit('edit')">
              <q-item-section side>
                <q-icon name="edit" size="xs" />
              </q-item-section>
              <q-item-section>
                Edit
              </q-item-section>
            </q-item>
            <q-item v-ripple clickable @click.stop="$emit('delete')">
              <q-item-section side>
                <q-icon name="delete" color="negative" size="xs" />
              </q-item-section>
              <q-item-section class="text-negative">
                Delete
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
import NoteStack from 'src/components/Icons/NoteStack.vue';

interface Props {
  item: IPortfolio;
  viewMode?: 'tile' | 'single';
  editable?: boolean;
  enableImagePreview?: boolean;
}

interface Emits {
  (e: 'click', item: IPortfolio): void;
  (e: 'edit'): void;
  (e: 'delete'): void;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'tile',
  editable: false,
  enableImagePreview: false,
});

const emit = defineEmits<Emits>();
const router = useRouter();

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x225';
const pictures = computed(() => props.item.pictures.map((picture) => picture.url));
const tileImage = computed(() => props.item.pictures?.[0]?.url || FALLBACK_IMAGE);

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
      padding: 16px 48px 16px 16px;
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

.feed-item-card.tile-view .feed-item-image {
  height: 200px;
}

.feed-item-card.single-view .feed-item-image {
  height: 400px;
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.tile-note-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.45);
  border-radius: 50%;
  padding: 6px;
  color: #fff;
  z-index: 2;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
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
