<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="create-booking-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">Create Booking Request</div>
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
        <q-form ref="formRef">
          <div class="input-group">
            <label class="input-label">Title</label>
            <q-input
              v-model="bookingData.title"
              outlined
              dense
              rounded
              placeholder="Enter booking title"
              class="custom-input"
              :rules="[val => !!val || 'Title is required']"
            />
          </div>
          <div class="input-group">
            <label class="input-label">Description</label>
            <q-input
              v-model="bookingData.description"
              outlined
              dense
              rounded
              type="textarea"
              placeholder="Describe what you need"
              class="custom-input"
              rows="3"
              required
              :rules="[val => !!val || 'Description is required']"
            />
          </div>
          <div class="input-group">
            <label class="input-label">Date</label>
            <q-input
              v-model="bookingData.date"
              outlined
              dense
              rounded
              type="date"
              placeholder="Select date"
              class="custom-input"
              :rules="[val => !!val || 'Date is required']"
            />
          </div>
          <div class="input-row">
            <div class="input-group">
              <label class="input-label">Start Time</label>
              <q-input
                v-model="bookingData.startTime"
                outlined
                dense
                rounded
                placeholder="Start time"
                class="custom-input"
                mask="time"
                fill-mask
                readonly
                required
                :rules="[val => !!val || 'Start time is required']"
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
                    v-model="bookingData.startTime"
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
                v-model="bookingData.endTime"
                outlined
                dense
                rounded
                placeholder="End time"
                class="custom-input"
                mask="time"
                fill-mask
                readonly
                required
                :rules="[val => !!val || 'End time is required']"
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
                    v-model="bookingData.endTime"
                    format24h
                    unelevated
                    class="bg-block"
                    @update:model-value="() => endTimeProxy?.hide()"
                  />
                </q-popup-proxy>
              </q-input>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          label="Cancel"
          rounded
          unelevated
          class="bg-block"
          @click="closeDialog"
        />
        <q-btn
          rounded
          color="primary"
          @click="onSubmit"
          :loading="isSubmitting"
        >
          <div class="q-px-md">
            <span class="text-body2">Send Request</span>
            <q-icon name="send" size="16px" color="white" class="q-ml-sm" />
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar, type QForm } from 'quasar';
import type { IBooking } from 'src/interfaces/booking';

interface Props {
  modelValue: boolean;
  shopId?: number;
  artistId?: number;
  type: 'shop-to-artist' | 'artist-to-shop';
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', booking: Partial<IBooking>): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const $q = useQuasar();

const isVisible = ref(props.modelValue);
const isSubmitting = ref(false);
const formRef = ref<QForm | null>(null);
const startTimeProxy = ref();
const endTimeProxy = ref();

// Initialize booking data
const bookingData = ref<Partial<IBooking>>({
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  shopId: props.shopId || 0,
  artistId: props.artistId || 0,
  status: 'pending',
  type: props.type
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
  if (newValue) {
    resetForm();
  }
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const resetForm = () => {
  bookingData.value = {
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    shopId: props.shopId || 0,
    artistId: props.artistId || 0,
    status: 'pending'
  };
};

const closeDialog = () => {
  isVisible.value = false;
  // Reset form to original values when canceling
  resetForm();
};

const onSubmit = () => {
  try {
    isSubmitting.value = true;
    void formRef.value?.validate?.();

    // Validate required fields
    if (!bookingData.value.title || !bookingData.value.description ||
        !bookingData.value.date || !bookingData.value.startTime || !bookingData.value.endTime) {
      $q.notify({
        type: 'negative',
        message: 'Please fill in all required fields',
        position: 'top',
        actions: [
          {
            icon: 'close',
            color: 'white',
          }
        ]
      });
      return;
    }

    // Validate time range
    if (bookingData.value.startTime >= bookingData.value.endTime) {
      $q.notify({
        type: 'negative',
        message: 'End time must be after start time',
        position: 'top',
        actions: [
          {
            icon: 'close',
            color: 'white',
          }
        ]
      });
      return;
    }

    // Emit the booking data
    emit('submit', {
      ...bookingData.value,
      shopId: props.shopId || 0,
      artistId: props.artistId || 0
    });

    // Show success message
    $q.notify({
      type: 'positive',
      color: 'dark',
      message: 'Booking request sent successfully!',
      position: 'top',
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    });

    closeDialog();
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to send booking request',
      position: 'top',
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    });
    console.log('Error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.create-booking-dialog {
  border-radius: 20px 20px 0 0;
  min-height: 600px;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;

    .input-group {
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
    justify-content: space-between;
    position: sticky;
    bottom: 0;
    z-index: 10;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}

.body--dark {
  .create-booking-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
