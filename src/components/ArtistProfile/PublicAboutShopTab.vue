<template>
  <div class="public-about-shop-tab flex column q-gap-md">
    <!-- Basic Information -->
    <div class="info-card">
      <div class="card-header">
        <q-icon name="info" size="24px" color="dark" />
        <h3 class="card-title">Basic Information</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Title:</span>
          <span class="info-value">{{ shopData.title || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Description:</span>
          <span class="info-value">{{ shopData.description || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Contacts -->
    <div class="info-card">
      <div class="card-header">
        <q-icon name="location_on" size="24px" color="dark" />
        <h3 class="card-title">Contacts</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="info-value">{{ shopData.location || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">{{ shopData.phone || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">{{ shopData.email || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Working Hours -->
    <div class="info-card">
      <div class="card-header">
        <q-icon name="schedule" size="24px" color="dark" />
        <h3 class="card-title">Working Hours</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Start:</span>
          <span class="info-value">{{ workingHours.start || 'Not specified' }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">End:</span>
          <span class="info-value">{{ workingHours.end || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="info-card">
      <div class="card-header">
        <q-icon name="add_circle" size="24px" color="dark" />
        <h3 class="card-title">Additional Info</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Date Opened:</span>
          <span class="info-value">{{ shopData.dateOpened || 'Not specified' }}</span>
        </div>
      </div>
    </div>

    <!-- Links -->
    <div class="info-card" v-if="shopData.instagram || shopData.facebook">
      <div class="card-header">
        <q-icon name="link" size="24px" color="dark" />
        <h3 class="card-title">Links</h3>
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
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.9);
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-dark);
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
  color: var(--brand-dark);
  min-width: 120px;
  flex-shrink: 0;
}

.info-value {
  color: var(--brand-dark);
  flex: 1;
  line-height: 1.5;
}

.info-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
  
  &:hover {
    text-decoration: underline;
  }
}
</style>
