<template>
  <q-dialog v-model="isVisible" position="bottom">
    <q-card class="guest-spot-slot-dialog">
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
        <GuestSpotSlotForm
          ref="slotFormRef"
          :slot-data="slotData"
          :loading="loading"
          @submit="handleSubmit"
        />
      </q-card-section>

      <q-card-actions class="dialog-actions bg-block">
        <div class="left-actions">
          <q-btn
            label="Cancel"
            rounded
            unelevated
            class="bg-block q-btn-min-width"
            @click="handleCancel"
          />
        </div>
        <div class="right-actions">
          <q-btn
            :label="isEditing ? 'Update Slot' : 'Create Slot'"
            rounded
            color="primary"
            :loading="loading"
            class="q-btn-min-width"
            @click="handleFormSubmit"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { IGuestSpotSlotForm } from 'src/interfaces/guestSpot';
import GuestSpotSlotForm from 'src/components/ShopProfile/GuestSpotTab/GuestSpotSlotForm.vue';

defineOptions({
  name: 'GuestSpotSlotDialog',
});

interface Props {
  modelValue: boolean;
  slotData?: IGuestSpotSlotForm | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  slotData: null,
  loading: false,
});

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: IGuestSpotSlotForm): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const isVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const slotFormRef = ref<InstanceType<typeof GuestSpotSlotForm> | null>(null);

const isEditing = computed(() => !!props.slotData);

const title = computed(() => (isEditing.value ? 'Edit Slot' : 'Create Slot'));

const closeDialog = () => {
  isVisible.value = false;
};

const handleCancel = () => {
  emit('cancel');
  closeDialog();
};

const handleFormSubmit = () => {
  if (slotFormRef.value) {
    slotFormRef.value.submit();
  }
};

const handleSubmit = (data: IGuestSpotSlotForm) => {
  emit('submit', data);
  closeDialog();
};
</script>

<style scoped lang="scss">
.guest-spot-slot-dialog {
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;

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
  .guest-spot-slot-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
