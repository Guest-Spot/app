<template>
  <div class="tabs-comp flex q-gap-sm justify-start full-width no-wrap">
    <q-btn
      v-for="t in tabs"
      :key="`tab-${t.tab}-${t.label}`"
      class="tab-btn"
      :class="{ active: currentActiveTab.tab === t.tab }"
      unelevated
      rounded
      :outline="currentActiveTab.tab !== t.tab"
      :color="currentActiveTab.tab === t.tab ? 'dark' : 'grey-7'"
      :text-color="currentActiveTab.tab === t.tab ? 'white' : 'dark'"
      :label="t.label"
      @click="handleTabClick(t)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { type ITab } from 'src/interfaces/tabs';
import { useRouter } from 'vue-router';

const props = defineProps<{
  tabs: ITab[];
  activeTab: ITab;
  useQuery?: boolean;
}>();

const router = useRouter();

const currentActiveTab = computed(() => props.activeTab);

const emit = defineEmits<{
  (e: 'setActiveTab', tab: ITab): void;
}>();

const handleTabClick = (tab: ITab) => {
  if (props.useQuery ?? false) {
    void router.replace({ query: { tab: tab.tab } });
  }
  emit('setActiveTab', tab);
};

const getActiveTab = () => {
  const tab = router.currentRoute.value.query.tab;
  if (tab) {
    return props.tabs.find(t => t.tab === tab) || props.tabs[0]!;
  }
  return props.tabs[0]!;
};

onMounted(() => {
  emit('setActiveTab', getActiveTab());
});
</script>

<style lang="scss" scoped>
.tabs-comp {
  overflow-x: auto;

  .tab-btn {
    min-width: 100px;
    flex: 1 0 auto;
  }
}
</style>