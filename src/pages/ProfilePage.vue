<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="content full-width q-pa-md">
          <!-- Banner Image Section -->
          <ImageUploader />

        </div>
        <!-- Navigation Tabs -->
        <div class="tabs-section q-my-lg">
          <div class="tab-container">
            <q-btn
              class="tab-btn active"
              unelevated
              rounded
              color="primary"
              text-color="white"
              label="About shop"
            />
            <q-btn
              class="tab-btn"
              unelevated
              rounded
              outline
              color="grey-7"
              label="Shop Artists"
            />
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="main-content flex column q-gap-md">
          <!-- Basic Information -->
          <q-expansion-item
            icon="info"
            label="Basic Information"
            header-class="expansion-header"
            class="info-expansion"
          >
            <div class="info-section">
              <div class="input-group">
                <label class="input-label">Title</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter shop title"
                  class="custom-input"
                  v-model="shopData.title"
                />
              </div>
              <div class="input-group">
                <label class="input-label">Description</label>
                <q-textarea
                  outlined
                  dense
                  placeholder="Enter shop description"
                  rows="3"
                  class="custom-input"
                  v-model="shopData.description"
                />
              </div>
            </div>
          </q-expansion-item>

          <!-- Contacts -->
          <q-expansion-item
            icon="location_on"
            label="Contacts"
            header-class="expansion-header"
            class="info-expansion"
          >
            <div class="info-section">
              <div class="input-group">
                <label class="input-label">Location</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter shop location"
                  class="custom-input"
                  v-model="shopData.location"
                />
              </div>
              <div class="input-group">
                <label class="input-label">Phone</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter phone number"
                  class="custom-input"
                  v-model="shopData.phone"
                />
              </div>
              <div class="input-group">
                <label class="input-label">Email</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter email address"
                  class="custom-input"
                  v-model="shopData.email"
                />
              </div>
            </div>
          </q-expansion-item>

          <!-- Working Hours -->
          <q-expansion-item
            icon="schedule"
            label="Working Hours"
            header-class="expansion-header"
            class="info-expansion"
          >
            <div class="info-section">
              <div class="hours-container">
                <div class="hours-group">
                  <label class="input-label">Start</label>
                  <q-time
                    v-model="workingHours.start"
                    format24h
                    class="custom-input"
                  />
                </div>
                <div class="hours-group">
                  <label class="input-label">End</label>
                  <q-time
                    v-model="workingHours.end"
                    format24h
                    class="custom-input"
                  />
                </div>
              </div>
            </div>
          </q-expansion-item>

          <!-- Additional Info -->
          <q-expansion-item
            icon="add_circle"
            label="Additional Info"
            header-class="expansion-header"
            class="info-expansion"
          >
            <div class="info-section">
              <div class="input-group">
                <label class="input-label">Date Opened</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter opening date"
                  class="custom-input"
                  v-model="shopData.dateOpened"
                />
              </div>
            </div>
          </q-expansion-item>

          <!-- Links -->
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
                  placeholder="Enter Instagram link"
                  class="custom-input"
                  v-model="shopData.instagram"
                />
              </div>
              <div class="input-group">
                <label class="input-label">Facebook</label>
                <q-input
                  outlined
                  dense
                  placeholder="Enter Facebook link"
                  class="custom-input"
                  v-model="shopData.facebook"
                />
              </div>
              <div class="links-row">
                <div v-for="(link, index) in shopData.customLinks" :key="index" class="link-input-group">
                  <q-input
                    outlined
                    dense
                    placeholder="Label"
                    class="custom-input"
                    v-model="link.label"
                  />
                  <q-input
                    outlined
                    dense
                    placeholder="Link"
                    class="custom-input"
                    v-model="link.link"
                  />
                  <q-btn
                    v-if="shopData.customLinks.length > 1"
                    round
                    color="negative"
                    icon="remove"
                    size="md"
                    class="remove-link-btn"
                    @click="removeCustomLink(index)"
                  />
                </div>
                <q-btn
                  round
                  color="primary"
                  icon="add"
                  size="md"
                  class="add-link-btn"
                  @click="addCustomLink"
                />
              </div>
            </div>
          </q-expansion-item>

          <!-- Save Button -->
          <div class="save-section">
            <q-btn
              color="primary"
              class="save-btn full-width"
              @click="saveChanges"
              rounded
              unelevated
              label="Save changes"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImageUploader from 'src/components/ImageUploader.vue';

// Form data
const shopData = ref({
  title: '',
  description: '',
  location: '',
  phone: '',
  email: '',
  dateOpened: '',
  instagram: '',
  facebook: '',
  customLinks: [
    { label: '', link: '' }
  ]
});

const workingHours = ref({
  start: '08:00',
  end: '23:30'
});

const addCustomLink = () => {
  shopData.value.customLinks.push({ label: '', link: '' });
};

const removeCustomLink = (index: number) => {
  if (shopData.value.customLinks.length > 1) {
    shopData.value.customLinks.splice(index, 1);
  }
};

const saveChanges = () => {
  // TODO: Implement save functionality
  console.log('Saving changes...', shopData.value, workingHours.value);
};
</script>

<style scoped lang="scss">
.content {
  width: 100%;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 10px 30px var(--shadow-light);
}

.banner-section {
  text-align: center;
}

.banner-placeholder {
  border: 2px dashed var(--shadow-light);
  border-radius: 20px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.tabs-section {
  display: flex;
  justify-content: center;
}

.tab-container {
  display: flex;
  gap: 10px;
}

.tab-btn {
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
}

.expansion-header {
  font-weight: 600;
  font-size: 18px;
  color: var(--brand-dark);
}

.info-section {
  padding: 16px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-weight: 500;
  color: var(--brand-dark);
  margin-bottom: 8px;
  font-size: 14px;
}

.hours-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hours-group {
  flex: 1;
  min-width: 200px;
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

.remove-link-btn {
  margin-bottom: 8px;
}

.add-link-btn {
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
  height: 56px;
  text-transform: none;
  transition: all 0.3s ease;
  max-width: 300px;
}
</style>
