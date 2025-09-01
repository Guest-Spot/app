<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="trip-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <div class="input-group">
          <label class="input-label">Location</label>
          <q-input
            v-model="formData.location"
            outlined
            dense
            rounded
            placeholder="Enter trip location"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Venue</label>
          <q-input
            v-model="formData.venue"
            outlined
            dense
            rounded
            placeholder="Enter venue name"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Date</label>
          <q-input
            v-model="formData.date"
            outlined
            dense
            rounded
            placeholder="Select date"
            class="custom-input"
            mask="####-##-##"
            fill-mask
            readonly
            @click.stop="dateProxy?.show()"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer" @click.stop="dateProxy?.show()" />
            </template>
            <q-popup-proxy
              ref="dateProxy"
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="formData.date"
                mask="YYYY-MM-DD"
                class="bg-block"
                @update:model-value="() => dateProxy?.hide()"
              />
            </q-popup-proxy>
          </q-input>
        </div>
        <div class="input-row">
          <div class="input-group">
            <label class="input-label">Start Time</label>
            <q-input
              v-model="formData.startTime"
              outlined
              dense
              rounded
              placeholder="Start time"
              class="custom-input"
              mask="time"
              fill-mask
              readonly
              @click.stop="startTimeProxy?.show()"
            >
              <template #append>
                <q-icon name="schedule" class="cursor-pointer" @click.stop="startTimeProxy?.show()" />
              </template>
              <q-popup-proxy
                ref="startTimeProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="formData.startTime"
                  format24h
                  unelevated
                  class="bg-block"
                  @update:model-value="() => startTimeProxy?.hide()"
                />
              </q-popup-proxy>
            </q-input>
          </div>
          <div class="input-group">
            <label class="input-label">End Time</label>
            <q-input
              v-model="formData.endTime"
              outlined
              dense
              rounded
              placeholder="End time"
              class="custom-input"
              mask="time"
              fill-mask
              readonly
              @click.stop="endTimeProxy?.show()"
            >
              <template #append>
                <q-icon name="schedule" class="cursor-pointer" @click.stop="endTimeProxy?.show()" />
              </template>
              <q-popup-proxy
                ref="endTimeProxy"
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time
                  v-model="formData.endTime"
                  format24h
                  unelevated
                  class="bg-block"
                  @update:model-value="() => endTimeProxy?.hide()"
                />
              </q-popup-proxy>
            </q-input>
          </div>
        </div>
        <div class="input-group">
          <label class="input-label">Description</label>
          <q-input
            v-model="formData.description"
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Enter trip description"
            class="custom-input"
            rows="3"
          />
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <div class="left-actions">
          <q-btn
            v-if="isEditing"
            round
            flat
            class="bg-block"
            color="negative"
            @click="deleteTrip"
            icon="delete"
          />
          <q-btn
            label="Cancel"
            rounded
            unelevated
            class="bg-block q-btn-min-width"
            @click="closeDialog"
          />
        </div>
        <div class="right-actions">
          <q-btn
            :label="isEditing ? 'Update' : 'Add'"
            rounded
            color="primary"
            @click="confirmTrip"
            class="q-btn-min-width"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';

interface TripForm {
  id: number;
  location: string;
  date: string;
  venue: string;
  startTime: string;
  endTime: string;
  description: string;
  photos: string[];
}

interface Props {
  modelValue: boolean;
  trip: TripForm;
  isEditing: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', trip: TripForm): void;
  (e: 'delete', tripId: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const $q = useQuasar();

const isVisible = ref(props.modelValue);
const formData = ref<TripForm>({ ...props.trip });
const startTimeProxy = ref();
const endTimeProxy = ref();
const dateProxy = ref();

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

// Watch for external changes to trip
watch(() => props.trip, (newValue) => {
  formData.value = { ...newValue };
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
  // Reset form to original values when canceling
  formData.value = { ...props.trip };
};

const confirmTrip = () => {
  emit('confirm', { ...formData.value });
  isVisible.value = false;
};

const deleteTrip = () => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this trip?',
    cancel: {
      color: 'grey-6',
      rounded: true,
      title: 'Cancel'
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Delete'
    }
  }).onOk(() => {
    emit('delete', formData.value.id);
    isVisible.value = false;
  });
};

// Computed property for title
const title = computed(() => props.isEditing ? 'Edit Trip' : 'Add New Trip');

</script>

<style scoped lang="scss">
.trip-dialog {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  min-height: 600px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
      /* align with CreateBookingDialog header */
    }
  }

  .dialog-content {
    padding: 20px;

    .input-group {
      margin-bottom: 20px;

      .input-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;
      }

      .custom-input {
        width: 100%;
      }
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .left-actions {
      display: flex;
      gap: 10px;
    }

    .right-actions {
      display: flex;
      gap: 10px;
    }

    .q-btn {
      font-weight: 600;
    }

    .q-btn-min-width {
      min-width: 100px;
    }
  }
}

.body--dark {
  .trip-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
