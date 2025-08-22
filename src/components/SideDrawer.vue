<template>
  <q-drawer v-model="drawerOpen" show-if-above bordered>
    <div class="drawer-content">
      <q-list>
        <q-item-label header> Navigation </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
      
      <!-- Logout button at the very bottom -->
      <div class="logout-section">
        <q-separator />
        <q-item clickable @click="handleLogout">
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
            <q-item-label caption>Sign out of your account</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EssentialLink from './EssentialLink.vue';
import type { EssentialLinkProps } from './EssentialLink.vue';
import { useRouter } from 'vue-router';

export interface SideDrawerProps {
  modelValue: boolean;
}

const props = defineProps<SideDrawerProps>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const router = useRouter();

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

const handleLogout = () => {
  void router.push('/auth');
};

// Export component for TypeScript
defineOptions({
  name: 'SideDrawer'
});
</script>

<style scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logout-section {
  margin-top: auto;
}
</style>
