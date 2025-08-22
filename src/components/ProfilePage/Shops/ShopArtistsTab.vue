<template>
  <div class="shop-artists-tab">
    <!-- Artists List -->
    <div class="artists-section">
      <div class="section-header q-mb-md">
        <h3 class="text-subtitle1 text-bold q-my-none">Shop Artists ({{ artists.length }})</h3>
        <q-btn
          color="dark"
          icon="add"
          @click="showAddArtistDialog = true"
          round
          size="sm"
          unelevated
        />
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
          </div>
          <div class="artist-actions flex column q-gap-sm justify-between full-height">
            <q-btn
              size="sm"
              round
              icon="edit"
              color="grey-7"
              @click="editArtist(artist)"
            />
            <q-btn
              size="sm"
              round
              icon="delete"
              color="red"
              @click="deleteArtist(artist.id)"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <q-icon name="people" size="60px" color="grey-6" />
        <h3 class="empty-title">No Artists Yet</h3>
        <p class="empty-description">Add your first artist to showcase their work</p>
        <q-btn
          color="dark"
          icon="add"
          label="Add First Artist"
          @click="showAddArtistDialog = true"
          rounded
          unelevated
        />
      </div>
    </div>

    <!-- Add/Edit Artist Dialog -->
    <ArtistDialog
      v-model="showAddArtistDialog"
      :artist="artistForm"
      :is-editing="isEditing"
      @confirm="saveArtist"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import ArtistDialog from 'src/components/Dialogs/ArtistDialog.vue';

interface Artist {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  bio: string;
  avatar?: string;
}

// Artists data
const artists = ref<Artist[]>([
  {
    id: '1',
    name: 'John Doe',
    specialty: 'Traditional Tattoo',
    experience: 5,
    bio: 'Experienced tattoo artist specializing in traditional American style tattoos.'
  },
  {
    id: '2',
    name: 'Jane Smith',
    specialty: 'Watercolor Tattoo',
    experience: 3,
    bio: 'Creative artist known for beautiful watercolor style tattoos.'
  }
]);

// Dialog state
const showAddArtistDialog = ref(false);
const isEditing = ref(false);
const editingArtistId = ref<string | null>(null);

// Form data
const artistForm = reactive({
  name: '',
  specialty: '',
  experience: 0,
  bio: ''
});

// Methods
const editArtist = (artist: Artist) => {
  isEditing.value = true;
  editingArtistId.value = artist.id;
  artistForm.name = artist.name;
  artistForm.specialty = artist.specialty;
  artistForm.experience = artist.experience;
  artistForm.bio = artist.bio;
  showAddArtistDialog.value = true;
};

const deleteArtist = (artistId: string) => {
  artists.value = artists.value.filter(artist => artist.id !== artistId);
};

const saveArtist = (artistData: { name: string; specialty: string; experience: number; bio: string }) => {
  if (isEditing.value && editingArtistId.value) {
    // Update existing artist
    const index = artists.value.findIndex(artist => artist.id === editingArtistId.value);
    if (index !== -1) {
      // Update only the form fields, preserve id and avatar
      const artist = artists.value[index];
      if (artist) {
        artist.name = artistData.name;
        artist.specialty = artistData.specialty;
        artist.experience = artistData.experience;
        artist.bio = artistData.bio;
      }
    }
  } else {
    // Add new artist
    const newArtist: Artist = {
      id: Date.now().toString(),
      name: artistData.name,
      specialty: artistData.specialty,
      experience: artistData.experience,
      bio: artistData.bio
    };
    artists.value.push(newArtist);
  }
  
  resetArtistForm();
  showAddArtistDialog.value = false;
};

const resetArtistForm = () => {
  artistForm.name = '';
  artistForm.specialty = '';
  artistForm.experience = 0;
  artistForm.bio = '';
  isEditing.value = false;
  editingArtistId.value = null;
};

// Expose data for parent component
defineExpose({
  artists
});
</script>

<style scoped lang="scss">
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--brand-dark);
}

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.artist-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.artist-avatar {
  margin-right: 16px;
}

.artist-info {
  flex: 1;
}

.artist-name {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--brand-dark);
}

.artist-specialty {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #666;
}

.artist-experience {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-title {
  margin: 16px 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--brand-dark);
}

.empty-description {
  margin: 0 0 24px 0;
  color: #666;
}


</style>
