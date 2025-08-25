<template>
  <q-drawer v-model="drawerOpen" show-if-above bordered>
    <div class="drawer-content">
      <q-list>
        <q-item-label header class="drawer-header flex justify-between">
          <span>Navigation</span>
          <q-btn round dense icon="close" color="dark" size="sm" @click="drawerOpen = false" />
        </q-item-label>

        <EssentialLink v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
      
      <!-- Logout button at the very bottom -->
      <div class="logout-section">
        <q-separator class="divider" />
        <q-item clickable @click="handleLogout" class="logout-item">
          <q-item-section avatar>
            <q-icon name="logout" class="logout-icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="logout-label">Logout</q-item-label>
            <q-item-label caption class="logout-caption">Sign out of your account</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EssentialLink from 'src/components/EssentialLink.vue';
import type { EssentialLinkProps } from 'src/components/EssentialLink.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from 'src/stores/user-store';

export interface SideDrawerProps {
  modelValue: boolean;
}

const props = defineProps<SideDrawerProps>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const router = useRouter();
const userStore = useUserStore();

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
  // Logout user from store (this will clear localStorage)
  userStore.logout();
  
  // Redirect to appropriate login page based on user type
  if (userStore.type === 'shop') {
    void router.push('/login/shop');
  } else if (userStore.type === 'artist') {
    void router.push('/login/artist');
  } else {
    // Default to auth page
    void router.push('/auth');
  }
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
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
}

.drawer-header {
  color: var(--text-dark);
  font-weight: 600;
  padding: 16px 16px 8px;
}

.logout-section {
  margin-top: auto;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.divider {
  background: var(--divider-light);
  margin: 0;
}

.logout-item {
  padding: 16px;
  transition: background-color 0.2s ease;
}

.logout-item:hover {
  background: var(--background-light);
}

.logout-icon {
  color: var(--text-secondary);
  font-size: 20px;
}

.logout-label {
  color: var(--text-dark);
  font-weight: 500;
  font-size: 16px;
}

.logout-caption {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 2px;
}

/* Используем общие классы для отступов */
.q-list {
  padding: 0;
}

.q-item {
  border-radius: var(--border-radius-sm, 8px);
}
</style>
