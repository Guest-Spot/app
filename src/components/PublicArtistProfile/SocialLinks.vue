<template>
  <div v-if="socialLinks.length" class="social-links flex items-center justify-center q-gap-sm">
    <q-btn
      v-for="link in socialLinks"
      :key="`${link.type}-${link.value}`"
      :href="link.value"
      target="_blank"
      rel="noopener noreferrer"
      round
      unelevated
      flat
      size="md"
      class="social-link-btn"
      :aria-label="`Visit ${link.type} profile`"
    >
      <SocialIcon :type="getIconType(link.type)" class="social-icon-svg" />
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ILink } from 'src/interfaces/common';
import { LinkType } from 'src/interfaces/enums';
import SocialIcon from './SocialIcon.vue';

defineOptions({
  name: 'SocialLinks',
});

interface Props {
  links?: ILink[];
}

const props = defineProps<Props>();

const socialLinks = computed(() => {
  if (!props.links || !Array.isArray(props.links)) {
    return [];
  }

  // Filter out non-social links (Site, Other) and only show social media
  return props.links.filter(
    (link) =>
      link.type !== LinkType.Other &&
      link.value &&
      link.value.trim() !== ''
  );
});

const getIconType = (type: LinkType): LinkType => {
  const iconMap: Record<LinkType, LinkType> = {
    [LinkType.Instagram]: LinkType.Instagram,
    [LinkType.Facebook]: LinkType.Facebook,
    [LinkType.Telegram]: LinkType.Telegram,
    [LinkType.Whatsapp]: LinkType.Whatsapp,
    [LinkType.Tiktok]: LinkType.Tiktok,
    [LinkType.Youtube]: LinkType.Youtube,
    [LinkType.Vk]: LinkType.Vk,
    [LinkType.Other]: LinkType.Other,
  };

  return iconMap[type] || LinkType.Other;
};
</script>

<style scoped lang="scss">
.social-links {
  margin-top: 8px;
  margin-bottom: 4px;
}

.social-link-btn {
  color: var(--q-primary);
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }

  :deep(.q-icon) {
    color: var(--q-primary);
  }
}

.social-icon-svg {
  width: 24px;
  height: 24px;
  color: var(--q-primary);
}
</style>
