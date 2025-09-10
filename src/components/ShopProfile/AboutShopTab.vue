<template>
  <div class="about-shop-tab flex column q-gap-md">
    <!-- Banner Image Section -->
    <ImageUploader
      :images="shopData.pictures || []"
      @on-change="shopData.pictures = $event"
      placeholder="Upload images"
      multiple
      placeholderIcon="photo_library"
    />

    <!-- Basic Information -->
    <q-expansion-item
      icon="info"
      label="Basic Information"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Name</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop name"
            class="custom-input"
            v-model="shopData.name"
            clearable
          />
        </div>
        <div class="input-group">
          <label class="input-label">Description</label>
          <q-input
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Enter shop description"
            class="custom-input"
            v-model="shopData.description"
            maxlength="200"
            counter
            clearable
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Contacts -->
    <q-expansion-item
      icon="location_on"
      label="Contacts"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">City</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop city"
            class="custom-input"
            v-model="shopData.city"
            clearable
          />
        </div>
        <div class="input-group">
          <label class="input-label">Address</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop address"
            clearable
            class="custom-input"
            v-model="shopData.address"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Phone</label>
          <q-input
            outlined
            dense
            rounded
            mask="(###) ### - ####"
            placeholder="Enter phone number"
            class="custom-input"
            clearable
            v-model="shopData.phone"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Email</label>
          <q-input
            outlined
            dense
            rounded
            type="email"
            clearable
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
      class="bg-block border-radius-lg full-width"
    >
      <WorkingHoursEditor v-model="openingTimesModel" />
    </q-expansion-item>

    <!-- Links -->
    <q-expansion-item
      icon="link"
      label="Links"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Website</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter Website link"
            class="custom-input"
            v-model="shopData.website"
            clearable
          />
        </div>
        <div class="input-group">
          <label class="input-label">Instagram</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter Instagram link"
            class="custom-input"
            v-model="shopData.instagram"
            clearable
          />
        </div>
      </div>
    </q-expansion-item>

    <!-- Additional Info -->
    <q-expansion-item
      icon="add_circle"
      label="Additional Info"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Date Opened</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter opening date"
            class="custom-input"
            v-model="shopData.dateOpened"
            clearable
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
import { ref, computed, defineAsyncComponent } from 'vue';
import { ImageUploader, ThemeSettings } from 'src/components';
import type { IOpeningHours } from 'src/interfaces/shop';

const WorkingHoursEditor = defineAsyncComponent(() => import('./WorkingHoursEditor.vue'));

// Form data
const shopData = ref({
  pictures: [] as File[],
  name: '',
  description: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  dateOpened: '',
  instagram: '',
  openingTimes: [] as IOpeningHours[],
  website: '',
});

// Computed property for opening times to handle v-model
const openingTimesModel = computed({
  get: () => shopData.value.openingTimes || [],
  set: (value: IOpeningHours[]) => {
    shopData.value.openingTimes = value;
  }
});

const saveChanges = () => {
  console.log('Saving changes...', shopData.value);
};

// Expose data for parent component
defineExpose({
  shopData,
});
</script>

<style scoped lang="scss">
.info-section {
  padding: 16px;
}

.input-group {
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

.hours-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.hours-group {
  flex: 1;
  min-width: 200px;
  position: relative;
}

.time-input {
  cursor: pointer;

  .q-field__control {
    cursor: pointer;
  }
}

.save-section {
  margin-top: 20px;
  text-align: center;
}

:deep(.working-hours) {
  .days-row {
    padding: 16px;
  }
}
</style>
