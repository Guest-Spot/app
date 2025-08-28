<template>
  <div class="public-about-me-tab flex column q-gap-md">
    <!-- Basic Information Card -->
    <div class="info-card bg-block border-radius-md">
      <div class="card-header q-px-md bg-block">
        <q-icon name="person" size="24px" />
        <h3 class="card-title">Basic Information</h3>
      </div>
      <div class="card-content">
        <div class="info-row">
          <span class="info-label">Username</span>
          <span class="info-value">{{ artistData.username }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Fullname</span>
          <span class="info-value">{{ artistData.fullname }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">{{ artistData.status }}</span>
        </div>
        <div class="info-row" v-if="artistData.bio">
          <span class="info-label">Bio</span>
          <span class="info-value">{{ artistData.bio }}</span>
        </div>
      </div>
    </div>

    <!-- Contacts Card -->
    <div class="info-card bg-block border-radius-md" v-if="artistData.phone || artistData.email">
      <div class="card-header q-px-md bg-block">
        <q-icon name="contact_phone" size="24px" />
        <h3 class="card-title">Contacts</h3>
      </div>
      <div class="card-content">
        <div class="info-row" v-if="artistData.phone">
          <span class="info-label">Phone</span>
          <span class="info-value">{{ artistData.phone }}</span>
        </div>
        <div class="info-row" v-if="artistData.email">
          <span class="info-label">Email</span>
          <span class="info-value">{{ artistData.email }}</span>
        </div>
      </div>
    </div>

    <!-- Links Card -->
    <div class="info-card bg-block border-radius-md" v-if="artistData.instagram || artistData.facebook">
      <div class="card-header q-px-md bg-block">
        <q-icon name="link" size="24px" />
        <h3 class="card-title">Social Links</h3>
      </div>
      <div class="card-content">
        <div class="info-row" v-if="artistData.instagram">
          <span class="info-label">Instagram</span>
          <a 
            :href="artistData.instagram" 
            target="_blank" 
            rel="noopener noreferrer"
            class="info-link"
          >
            {{ artistData.instagram }}
          </a>
        </div>
        <div class="info-row" v-if="artistData.facebook">
          <span class="info-label">Facebook</span>
          <a 
            :href="artistData.facebook" 
            target="_blank" 
            rel="noopener noreferrer"
            class="info-link"
          >
            {{ artistData.facebook }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ArtistData {
  username: string;
  fullname: string;
  status: string;
  bio?: string;
  phone?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
}

interface Props {
  artistData: ArtistData;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.public-about-me-tab {
  width: 100%;
}

.info-card {
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.card-content {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
  font-size: 14px;
}

.info-value {
  flex: 1;
  line-height: 1.4;
  font-size: 14px;
}

.info-link {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}
</style>
