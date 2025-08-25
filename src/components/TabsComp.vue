<template>
  <div class="tab-comp flex q-gap-sm justify-center full-width">
    <q-btn
      v-for="t in tabs"
      :key="`tab-${t.tab}-${t.label}`"
      class="tab-btn"
      :class="{ active: activeTab.tab === t.tab }"
      unelevated
      rounded
      :outline="activeTab.tab !== t.tab"
      :color="activeTab.tab === t.tab ? 'dark' : 'grey-7'"
      :text-color="activeTab.tab === t.tab ? 'white' : 'dark'"
      :label="t.label"
      @click="emit('setActiveTab', t)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ITab } from 'src/interfaces/tabs';

const props = defineProps<{
  tabs: ITab[];
  activeTab: ITab;
}>();

const activeTab = computed(() => props.activeTab);

const emit = defineEmits<{
  (e: 'setActiveTab', tab: ITab): void;
}>();
</script>
