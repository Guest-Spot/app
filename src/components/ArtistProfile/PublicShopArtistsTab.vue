<template>
  <div class="public-shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
      </div>

      <!-- Artists Grid -->
      <div class="artists-grid" v-if="artists.length > 0">
        <div
          v-for="artist in artists"
          :key="artist.id"
          class="artist-card"
        >
          <div class="artist-avatar">
            <q-avatar size="60px">
              <img v-if="artist.avatar" :src="artist.avatar" :alt="artist.name" />
              <q-icon v-else name="person" size="60px" color="grey-6" />
            </q-avatar>
          </div>
          <div class="artist-info">
            <h4 class="artist-name">{{ artist.name }}</h4>
            <p class="artist-specialty">{{ artist.specialty }}</p>
            <p class="artist-experience">{{ artist.experience }} years experience</p>
            <p class="artist-bio">{{ artist.bio }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description">This shop hasn't added any artists yet</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Artist {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  bio: string;
  avatar?: string;
}

interface Props {
  artists: Artist[];
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 4px 4px 4px 16px;
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.artist-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.artist-avatar {
  margin-right: 16px;
  flex-shrink: 0;
}

.artist-info {
  flex: 1;
}

.artist-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-dark);
}

.artist-specialty {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--primary);
  font-weight: 500;
}

.artist-experience {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #999;
}

.artist-bio {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0;
  color: #666;
  font-size: 16px;
}

// Responsive design
@media (max-width: 768px) {
  .artists-grid {
    grid-template-columns: 1fr;
  }
  
  .artist-card {
    flex-direction: column;
    text-align: center;
  }
  
  .artist-avatar {
    margin-right: 0;
    margin-bottom: 16px;
  }
}
</style>
