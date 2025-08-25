<template>
  <div class="about-me-tab flex column q-gap-md">
    <div class="image-content q-pa-md">
      <ImageUploader />
    </div>

    <!-- BIO Section -->
    <q-expansion-item
      icon="person"
      label="Basic Information"
      header-class="expansion-header"
      class="info-expansion"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Username</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter username"
            class="custom-input"
            v-model="artistData.username"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Fullname</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter fullname"
            class="custom-input"
            v-model="artistData.fullname"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Status</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter status"
            class="custom-input"
            v-model="artistData.status"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Bio</label>
          <q-input
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Tell us about yourself..."
            class="custom-input"
            v-model="artistData.bio"
            rows="4"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts Section -->
    <q-expansion-item
      icon="contact_phone"
      label="Contacts"
      header-class="expansion-header"
      class="info-expansion"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Phone</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter phone number"
            class="custom-input"
            v-model="artistData.phone"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter email address"
            class="custom-input"
            v-model="artistData.email"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Links Section -->
    <q-expansion-item
      icon="link"
      label="Links"
      header-class="expansion-header"
      class="info-expansion"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Instagram</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter Instagram link"
            class="custom-input"
            v-model="artistData.instagram"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Facebook</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter Facebook link"
            class="custom-input"
            v-model="artistData.facebook"
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Save Button -->
    <div class="save-section">
      <q-btn
        color="dark"
        class="save-btn full-width"
        @click="saveChanges"
        rounded
        unelevated
        label="Save changes"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ImageUploader } from 'src/components';

// Form data
const artistData = ref({
  username: 'artist_john',
  fullname: 'John Doe',
  status: 'Available for bookings',
  bio: 'Passionate artist with 5+ years of experience in live performances and studio recordings.',
  phone: '+1 (555) 123-4567',
  email: 'john.doe@example.com',
  instagram: 'https://instagram.com/johndoe_artist',
  facebook: 'https://facebook.com/johndoe.artist',
});

const saveChanges = () => {
  console.log('Saving artist changes...', artistData.value);
};

// Expose data for parent component
defineExpose({
  artistData
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.input-group {
  width: 100%;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.input-label {
  display: block;
  font-weight: 500;
  color: var(--brand-dark);
  margin-bottom: 8px;
  font-size: 14px;
}

.image-content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
}

.links-row {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.link-input-group {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-link-btn {
  margin-bottom: 8px;
}

.remove-link-btn {
  margin-bottom: 8px;
}

.save-section {
  margin-top: 20px;
  text-align: center;
}

.save-btn {
  background: var(--brand-dark);
  color: white;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.6px;
  text-transform: none;
  transition: all 0.3s ease;
  max-width: 300px;
}
</style>
