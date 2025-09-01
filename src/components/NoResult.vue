<template>
  <div class="flex column items-center q-gap-md bg-block border-radius-md q-pa-lg">
    <q-icon :name="icon" size="60px" color="grey-6" />
    <div class="flex column items-center">
      <h3 class="no-results-title">{{ title }}</h3>
      <p class="no-results-description text-grey-6 text-center">{{ description }}</p>
    </div>
    <q-btn
      v-if="link"
      :label="linkLabel"
      :icon="linkIcon"
      class="bg-block q-mt-lg"
      rounded
      unelevated
      @click="$router.push(link)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
  linkIcon?: string;
}>();
</script>

<style scoped lang="scss">
.no-results {
  text-align: center;
  padding: 60px 20px;
}

.no-results-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.no-results-description {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}

</style>
