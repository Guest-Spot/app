<template>
  <div class="guest-spot-banner bg-block border-radius-lg q-pa-md cursor-pointer" @click="handleClick">
    <div class="guest-spot-banner__content flex items-center q-gap-md">
      <div class="guest-spot-banner__icon">
        <q-icon name="event_available" size="24px" />
      </div>
      <div class="guest-spot-banner__text flex-1">
        <div class="text-subtitle2 text-bold">Guest Spot Management</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          Manage your guest spot slots and bookings
        </div>
      </div>
      <q-icon name="arrow_forward_ios" size="16px" color="grey-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

defineOptions({
  name: 'GuestSpotBanner',
});

const router = useRouter();

const handleClick = () => {
  void router.push('/profile/guest-spot');
};
</script>

<style scoped lang="scss">
.guest-spot-banner {
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.06) 100%);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }
}

.guest-spot-banner__content {
  width: 100%;
}

.guest-spot-banner__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--q-primary);
  flex: 0 0 auto;
}

.guest-spot-banner__text {
  flex: 1;
  min-width: 0;
}

.body--dark {
  .guest-spot-banner {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.08) 100%);
  }

  .guest-spot-banner__icon {
    background: rgba(255, 255, 255, 0.08);
  }
}
</style>
