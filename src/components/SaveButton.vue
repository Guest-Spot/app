<template>
  <div class="save-btn container" :class="{ 'save-btn--active': hasChanges }">
    <q-btn
      class="full-width bg-block"
      @click="emit('save')"
      rounded
      size="lg"
      :text-color="hasChanges ? 'primary' : ''"
      unelevated
      :loading="loading"
      :disable="loading"
    >
      <q-icon name="save" size="18px" />
      <span class="q-ml-sm text-subtitle1">Save changes</span>
      <template #loading>
        <div class="flex items-center justify-center q-gap-sm">
          <q-spinner size="sm" />
          <span class="q-ml-sm text-subtitle1">Saving...</span>
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
  bottom: env(safe-area-inset-bottom);

  .q-btn {
    font-weight: 700;
    font-size: 18.8px;
    letter-spacing: 0.6px;
    height: 48px;
  }
}
</style>

