<template>
  <div class="step-content">
    <q-form ref="formRef" class="comment-form flex column q-gap-lg">
      <div class="input-group">
        <label class="input-label">Comment (optional)</label>
        <q-input
          v-model="commentModel"
          type="textarea"
          rows="4"
          outlined
          dense
          rounded
          placeholder="Add any additional information..."
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QForm } from 'quasar';

const props = defineProps({
  comment: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{
  (e: 'update:comment', value: string): void;
}>();

const formRef = ref<QForm | null>(null);

const commentModel = computed({
  get: () => props.comment,
  set: (val: string) => emit('update:comment', val),
});

const validateForm = () => {
  // Comment is optional, so always valid
  return true;
};

const resetForm = () => {
  formRef.value?.resetValidation();
  formRef.value?.reset();
};

defineExpose({
  validateForm,
  resetForm,
});
</script>

<style scoped lang="scss">
.step-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .input-label {
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
