<template>
  <TabsComp
    :tabs="TABS"
    :activeTab="activeTab"
    use-query
    @setActiveTab="handleTabChange"
    class="full-width"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TabsComp from 'src/components/TabsComp.vue';
import { type ITab } from 'src/interfaces/tabs';

const TAB_SHOPS = 'shops';
const TAB_ARTISTS = 'artists';

const TABS: ITab[] = [
  {
    label: 'Shops',
    tab: TAB_SHOPS
  },
  {
    label: 'Artists',
    tab: TAB_ARTISTS
  }
];

interface Props {
  modelValue: string;
}

interface Emits {
  (e: 'update:modelValue', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeTab = computed(() => {
  return TABS.find(tab => tab.tab === props.modelValue) || TABS[0]!;
});

const handleTabChange = (tab: ITab) => {
  emit('update:modelValue', tab.tab);
};
</script>
