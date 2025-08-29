<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <!-- Contacts -->
    <div class="info-card bg-block border-radius-md">
      <div class="card-header q-px-md q-py-sm bg-block">
        <q-icon name="location_on" size="18px" />
        <h3 class="card-title text-subtitle1">Contacts</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="text-grey-6">{{ shopData.location || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="text-grey-6">{{ shopData.phone || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="text-grey-6">{{ shopData.email || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Working Hours -->
    <div class="info-card bg-block border-radius-md">
      <div class="card-header q-px-md q-py-sm bg-block">
        <q-icon name="schedule" size="18px" />
        <h3 class="card-title text-subtitle1">Working Hours</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Start:</span>
          <span class="text-grey-6">{{ workingHours.start || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">End:</span>
          <span class="text-grey-6">{{ workingHours.end || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="info-card bg-block border-radius-md">
      <div class="card-header q-px-md q-py-sm bg-block">
        <q-icon name="add_circle" size="18px" />
        <h3 class="card-title text-subtitle1">Additional Info</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Date Opened:</span>
          <span class="text-grey-6">{{ shopData.dateOpened || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Links -->
    <div class="info-card bg-block border-radius-md" v-if="shopData.instagram || shopData.facebook">
      <div class="card-header q-px-md q-py-sm bg-block">
        <q-icon name="link" size="18px" />
        <h3 class="card-title text-subtitle1">Links</h3>
      </div>
      <div class="card-content">
        <div class="info-row" v-if="shopData.instagram">
          <span class="info-label">Instagram:</span>
          <a :href="shopData.instagram" target="_blank" class="info-link">{{ shopData.instagram }}</a>
        </div>
        <div class="info-row" v-if="shopData.facebook">
          <span class="info-label">Facebook:</span>
          <a :href="shopData.facebook" target="_blank" class="info-link">{{ shopData.facebook }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ShopData {
  title: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  dateOpened: string;
  instagram: string;
  facebook: string;
}

interface WorkingHours {
  start: string;
  end: string;
}

interface Props {
  shopData: ShopData;
  workingHours: WorkingHours;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.info-card {
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-weight: 600;
  min-width: 70px;
  flex-shrink: 0;
}

.info-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}
</style>
