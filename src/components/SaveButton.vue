<template>
  <div class="save-btn container bg-block" :class="{ 'save-btn--active': hasChanges }">
    <q-btn
      rounded
      class="full-width q-py-sm q-mb-lg q-mt-md bg-block"
      :color="hasChanges ? 'primary' : ''"
      @click="emit('save')"
      :loading="loading"
      :disable="loading || !hasChanges"
    >
      <div class="flex items-center justify-center q-gap-sm">
        <q-icon name="save" />
        <span class="text-h6">Save changes</span>
      </div>
      <template #loading>
        <div class="flex items-center justify-center q-gap-sm">
          <q-spinner size="sm" />
          <span class="text-h6">Saving...</span>
        </div>
      </template>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasChanges: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{ save: [] }>();
</script>

<style scoped lang="scss">
.save-btn {
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
}
</style>

