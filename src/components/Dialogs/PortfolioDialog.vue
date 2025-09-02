<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="portfolio-dialog">
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
          <label class="input-label">Title</label>
          <q-input
            v-model="formData.title"
            outlined
            dense
            rounded
            placeholder="Enter work title"
            class="custom-input"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Description</label>
          <q-input
            v-model="formData.description"
            outlined
            dense
            rounded
            type="textarea"
            placeholder="Enter work description"
            class="custom-input"
            rows="3"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Image</label>
          <ImageUploader
            :image="formData.imageFile || null"
            multiple
            @on-change="onImageChange"
            @clear="onImageClear"
          />
        </div>

        <div class="input-group">
          <label class="input-label">Tags</label>
          <q-input
            v-model="newTag"
            outlined
            dense
            rounded
            placeholder="Enter tag and press Enter"
            class="custom-input"
            @keyup.enter="addTag"
          >
            <template v-slot:append>
              <q-btn
                round
                dense
                icon="add"
                color="dark"
                size="sm"
                @click="addTag"
              />
            </template>
          </q-input>
          <div class="tags-container">
            <q-chip
              v-for="(tag, index) in formData.tags"
              :key="index"
              :label="tag"
              size="sm"
              removable
              @remove="removeTag(index)"
              class="work-tag bg-block"
            />
          </div>
        </div>
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
          :label="isEditing ? 'Save' : 'Add'"
          rounded
          color="primary"
          @click="confirmWork"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import ImageUploader from 'src/components/ImageUploader.vue';
import type { IPortfolioForm } from 'src/interfaces/portfolio';

defineOptions({
  name: 'PortfolioDialog',
});

interface Props {
  modelValue: boolean;
  work: IPortfolioForm;
  isEditing: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm', work: IPortfolioForm): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isVisible = ref(props.modelValue);
const formData = ref<IPortfolioForm>({ ...props.work });
const newTag = ref('');

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

// Watch for external changes to work
watch(() => props.work, (newValue) => {
  formData.value = { ...newValue };
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
  // Reset form to original values when canceling
  formData.value = { ...props.work };
  newTag.value = '';
};

const confirmWork = () => {
  emit('confirm', { ...formData.value });
  isVisible.value = false;
};

const onImageChange = (file: File) => {
  formData.value.imageFile = file;
  // Create a temporary URL for preview
  formData.value.imageUrl = URL.createObjectURL(file);
};

const onImageClear = () => {
  formData.value.imageFile = null;
  formData.value.imageUrl = '';
};

const addTag = () => {
  if (newTag.value.trim() && !formData.value.tags.includes(newTag.value.trim())) {
    formData.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
};

const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1);
};

// Computed property for title
const title = computed(() => props.isEditing ? 'Edit Portfolio Work' : 'Add New Work');

</script>

<style scoped lang="scss">
.portfolio-dialog {
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

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;

      .work-tag {
        font-size: 12px;
      }
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
  .portfolio-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
