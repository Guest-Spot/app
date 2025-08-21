<template>
  <q-drawer v-model="drawerOpen" show-if-above bordered>
    <q-list>
      <q-item-label header> Navigation </q-item-label>

      <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
    </q-list>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EssentialLink from './EssentialLink.vue';
import type { EssentialLinkProps } from './EssentialLink.vue';

export interface SideDrawerProps {
  modelValue: boolean;
}

const props = defineProps<SideDrawerProps>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const drawerOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const linksList: EssentialLinkProps[] = [
  {
    title: 'FAQ',
    caption: 'Frequently asked questions',
    icon: 'help',
    link: '/#/faq',
  },
  {
    title: 'Terms of Service',
    caption: 'Terms and conditions',
    icon: 'description',
    link: '/#/tos',
  },
  {
    title: 'Privacy Policy',
    caption: 'Privacy information',
    icon: 'privacy_tip',
    link: '/#/privacy',
  },
];

// Export component for TypeScript
defineOptions({
  name: 'SideDrawer'
});
</script>
