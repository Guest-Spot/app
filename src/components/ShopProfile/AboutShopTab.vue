<template>
  <div class="about-shop-tab flex column q-gap-md">
    <!-- Banner Image Section -->
    <ImageUploader />

    <!-- Basic Information -->
    <q-expansion-item
      icon="info"
      label="Basic Information"
      header-class="expansion-header"
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="input-group">
          <label class="input-label">Title</label>
          <q-input
            outlined
            dense
            rounded
            placeholder="Enter shop title"
            class="custom-input"
            v-model="shopData.title"
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
          <label class="input-label">Location</label>
          <q-input
            outlined
            dense
            rounded
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
            rounded
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
            rounded
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
      class="bg-block border-radius-lg"
    >
      <div class="info-section">
        <div class="hours-container">
          <div class="hours-group">
            <label class="input-label">Start</label>
            <q-input
              v-model="workingHours.start"
              outlined
              dense
              rounded
              readonly
              class="custom-input time-input"
              @click="startTimeDialog = true"
            >
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer" @click="startTimeDialog = true" />
              </template>
            </q-input>
            <TimePickerDialog
              v-model="startTimeDialog"
              :time="workingHours.start"
              title="Выберите время начала"
              @confirm="onStartTimeConfirm"
            />
          </div>
          <div class="hours-group">
            <label class="input-label">End</label>
            <q-input
              v-model="workingHours.end"
              outlined
              dense
              rounded
              readonly
              class="custom-input time-input"
              @click="endTimeDialog = true"
            >
              <template v-slot:append>
                <q-icon name="schedule" class="cursor-pointer" @click="endTimeDialog = true" />
              </template>
            </q-input>
            <TimePickerDialog
              v-model="endTimeDialog"
              :time="workingHours.end"
              title="Выберите время окончания"
              @confirm="onEndTimeConfirm"
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
          />
        </div>
      </div>
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
          <label class="input-label">Instagram</label>
          <q-input
            outlined
            dense
            rounded
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
            rounded
            placeholder="Enter Facebook link"
            class="custom-input"
            v-model="shopData.facebook"
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
import { TimePickerDialog } from '../Dialogs';
import { ImageUploader, ThemeSettings } from 'src/components';

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
});

const workingHours = ref({
  start: '08:00',
  end: '23:30'
});

const startTimeDialog = ref(false);
const endTimeDialog = ref(false);

const onStartTimeConfirm = (time: string) => {
  workingHours.value.start = time;
};

const onEndTimeConfirm = (time: string) => {
  workingHours.value.end = time;
};

const saveChanges = () => {
  // TODO: Implement save functionality
  const shopDataToSave = {
    ...shopData.value,
    workingHoursStart: workingHours.value.start,
    workingHoursEnd: workingHours.value.end
  };
  console.log('Saving changes...', shopDataToSave);
};

// Expose data for parent component
defineExpose({
  shopData,
  workingHours
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
</style>
