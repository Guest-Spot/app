<template>
  <q-dialog
    v-model="isVisible"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="account-type-upgrade-dialog bg-block">
      <q-btn
        icon="close"
        class="bg-block close-btn"
        text-color="grey-6"
        flat
        round
        dense
        @click="handleDismiss"
      />

      <q-card-section class="banner-section">
        <div class="upgrade-banner">
          <div class="banner-top">
            <div class="banner-badge text-caption text-weight-medium">
              {{ content.badge }}
            </div>
            <div class="banner-icon">
              <q-icon :name="content.heroIcon" size="24px" color="primary" />
            </div>
          </div>
          <div class="text-h6 text-weight-bold q-mt-sm">
            {{ content.title }}
          </div>
          <p class="text-body2 text-grey-6 q-mt-xs q-mb-none">
            {{ content.subtitle }}
          </p>
        </div>
      </q-card-section>

      <q-card-section class="features-section">
        <div class="features-grid">
          <div v-for="feature in content.features" :key="feature.title" class="feature-item">
            <div class="feature-icon">
              <q-icon :name="feature.icon" size="20px" color="primary" />
            </div>
            <div class="feature-text">
              <div class="text-subtitle2 text-weight-medium">
                {{ feature.title }}
              </div>
              <div class="text-caption text-grey-6">
                {{ feature.description }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn
          label="Got it"
          color="primary"
          rounded
          unelevated
          class="full-width"
          @click="handleDismiss"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { UserType } from 'src/interfaces/enums';

interface Props {
  modelValue: boolean;
  accountType: UserType.Artist | UserType.Shop;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'dismiss'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);
const hasOpened = ref(isVisible.value);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
  if (newValue) {
    hasOpened.value = true;
    return;
  }
  if (hasOpened.value) {
    emit('dismiss');
    hasOpened.value = false;
  }
});

const content = computed(() => {
  if (props.accountType === UserType.Shop) {
    return {
      badge: 'Shop tools unlocked',
      title: 'Welcome to your shop profile',
      subtitle: 'Showcase your studio, manage artists, and accept bookings.',
      heroIcon: 'storefront',
      features: [
        {
          icon: 'storefront',
          title: 'Studio profile',
          description: 'Highlight your shop, location, and vibe.',
        },
        {
          icon: 'groups',
          title: 'Artist roster',
          description: 'Invite artists and manage your team.',
        },
        {
          icon: 'event_available',
          title: 'Booking management',
          description: 'Handle requests and keep the calendar full.',
        },
      ],
    };
  }

  return {
    badge: 'Artist tools unlocked',
    title: 'Welcome to your artist profile',
    subtitle: 'Showcase your style, take bookings, and manage your schedule.',
    heroIcon: 'brush',
    features: [
      {
        icon: 'brush',
        title: 'Portfolio & styles',
        description: 'Share your work and specialties.',
      },
      {
        icon: 'event',
        title: 'Booking requests',
        description: 'Accept and organize client requests.',
      },
      {
        icon: 'schedule',
        title: 'Availability',
        description: 'Set working hours and stay in sync.',
      },
    ],
  };
});

const handleDismiss = () => {
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
.account-type-upgrade-dialog {
  border-radius: 22px;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.banner-section {
  padding: 24px 20px 12px;
}

.upgrade-banner {
  border-radius: 18px;
  padding: 18px;
  border: 1px solid transparent;
  background: linear-gradient(
    135deg,
    rgba(var(--red-accent-rgb), 0.18) 0%,
    transparent 100%
  );
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    width: 140px;
    height: 140px;
    right: -50px;
    top: -60px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.35) 0%,
      transparent 70%
    );
    opacity: 0.4;
  }
}

.banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.banner-badge {
  padding: 4px 12px;
  border-radius: 999px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  background: rgba(var(--red-accent-rgb), 0.16);
  color: var(--q-primary);
  border: 1px solid rgba(var(--red-accent-rgb), 0.3);
}

.banner-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.features-section {
  padding: 8px 20px 12px;
}

.features-grid {
  display: grid;
  gap: 12px;
}

.feature-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: rgba(var(--red-accent-rgb), 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.feature-text {
  flex: 1;
  min-width: 0;
}

.dialog-actions {
  padding: 8px 20px 20px;

  .q-btn {
    font-weight: 600;
  }
}

.body--dark {
  .upgrade-banner {
    border-color: rgba(255, 255, 255, 0.16);
    background: linear-gradient(
      135deg,
      rgba(var(--red-accent-rgb), 0.22) 0%,
      transparent 100%
    );
  }

  .banner-icon {
    background: rgba(255, 255, 255, 0.16);
  }
}
</style>
