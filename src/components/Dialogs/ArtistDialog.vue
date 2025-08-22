<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="artist-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
        <q-btn
          icon="close"
          color="dark"
          round
          dense
          size="sm"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <div class="input-group">
          <label class="input-label">Name</label>
          <q-input
            v-model="formData.name"
            outlined
            dense
            rounded
            placeholder="Enter artist name"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Specialty</label>
          <q-input
            v-model="formData.specialty"
            outlined
            dense
            rounded
            placeholder="Enter artist specialty"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Experience (years)</label>
          <q-input
            v-model.number="formData.experience"
            outlined
            dense
            rounded
            type="number"
            placeholder="Enter years of experience"
            class="custom-input"
          />
        </div>
        <div class="input-group">
          <label class="input-label">Bio</label>
          <q-input
            v-model="formData.bio"
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Enter artist bio"
            class="custom-input"
          />
        </div>
      </q-card-section>

      <q-card-actions class="dialog-actions">
        <q-btn
          label="Отмена"
          rounded
          color="grey-6"
          @click="closeDialog"
        />
        <q-btn
          :label="isEditing ? 'Обновить' : 'Добавить'"
          rounded
          color="dark"
          @click="confirmArtist"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface ArtistForm {
  name: string;
  specialty: string;
  experience: number;
  bio: string;
}

interface Props {
  modelValue: boolean;
  artist: ArtistForm;
  isEditing: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', artist: ArtistForm): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);
const formData = ref<ArtistForm>({ ...props.artist });

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

// Watch for external changes to artist
watch(() => props.artist, (newValue) => {
  formData.value = { ...newValue };
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
  // Reset form to original values when canceling
  formData.value = { ...props.artist };
};

const confirmArtist = () => {
  emit('confirm', { ...formData.value });
  isVisible.value = false;
};

// Computed property for title
const title = computed(() => props.isEditing ? 'Edit Artist' : 'Add New Artist');
</script>

<style scoped lang="scss">
.artist-dialog {
  border-radius: 20px 20px 0 0;
  min-height: 400px;
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid var(--border-light);
    
    .text-subtitle1 {
      font-weight: 600;
      color: var(--brand-dark);
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
        color: var(--brand-dark);
        font-size: 14px;
      }
      
      .custom-input {
        width: 100%;
      }
    }
  }
  
  .dialog-actions {
    padding: 10px 20px 20px;
    justify-content: space-between;
    position: sticky;
    bottom: 0;
    background: white;
    border-top: 1px solid var(--border-light);
    z-index: 10;
    
    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}
</style>
