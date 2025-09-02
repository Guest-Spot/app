<template>
  <div class="about-me-tab flex column q-gap-md">
    <ImageUploader />

    <!-- BIO Section -->
    <q-expansion-item
      icon="person"
      label="Basic Information"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
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
          <label class="input-label">Name</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter name"
            class="custom-input"
            v-model="artistData.name"
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
      class="bg-block border-radius-lg"
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
      class="bg-block border-radius-lg"
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

    <!-- Theme Settings -->
    <ThemeSettings />

    <!-- Save Button -->
    <div class="save-section">
      <q-btn
        class="full-width bg-block"
        @click="saveChanges"
        rounded
        size="lg"
        unelevated
      >
        <q-icon name="save" size="18px" />
        <span class="q-ml-sm text-subtitle1">Save changes</span>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ImageUploader, ThemeSettings } from 'src/components';

// Form data
const artistData = ref({
  username: 'artist_john',
  name: 'John Doe',
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
  margin-bottom: 8px;
  font-size: 14px;
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
</style>
