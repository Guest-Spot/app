<template>
  <q-item clickable tag="a" :target="isExternalLink ? '_blank' : undefined" :href="link">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string;
  icon?: string;
}

const props = withDefaults(defineProps<EssentialLinkProps>(), {
  caption: '',
  link: '#',
  icon: '',
});

const isExternalLink = computed(() => {
  return props.link?.startsWith('http://') || props.link?.startsWith('https://');
});

// Export component for TypeScript
defineOptions({
  name: 'EssentialLink'
});
</script>
