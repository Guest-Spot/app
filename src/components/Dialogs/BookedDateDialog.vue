<template>
  <q-dialog v-model="isVisible" persistent position="bottom" unelevated>
    <q-card class="booked-date-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">You already have a booking on this date</div>
        <q-btn
          icon="close"
          class="bg-block"
          text-color="primary"
          round
          dense
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section v-if="booking" class="dialog-content">
        <GuestSpotBookingCard :booking="booking" :read-only="true" />
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <q-btn
          flat
          label="Close"
          color="primary"
          rounded
          class="bg-block min-width"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import type { IGuestSpotBooking } from 'src/interfaces/guestSpot';
import GuestSpotBookingCard from 'src/components/GuestSpot/GuestSpotBookingCard.vue';

interface Props {
  modelValue: boolean;
  booking: IGuestSpotBooking | null;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
};
</script>

<style scoped lang="scss">
.booked-date-dialog {
  min-width: 360px;
  max-width: 480px;
  border-radius: 20px;

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
  }

  .dialog-actions {
    padding: 16px 20px 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .q-btn {
      font-weight: 600;
    }

    .min-width {
      min-width: 100px;
    }
  }
}

.body--dark {
  .booked-date-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
