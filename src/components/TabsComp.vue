<template>
  <div
    class="tabs-comp flex q-gap-sm justify-start no-wrap q-pt-sm"
  >
    <q-btn
      v-for="t in tabs"
      :key="`tab-${t.tab}-${t.label}`"
      class="tab-btn"
      unelevated
      rounded
      :class="{
        'bg-grey-4': currentActiveTab.tab !== t.tab && !$q.dark.isActive,
        'bg-grey-9': currentActiveTab.tab !== t.tab && $q.dark.isActive,
        'bg-primary text-white': currentActiveTab.tab === t.tab
      }"
      @click="handleTabClick(t)"
      v-bind="$attrs"
    >
      <span class="tabs-comp-label">{{ t.label }}</span>
      <q-badge v-if="t.count" rounded class="tabs-comp-counter text-bold q-ml-xs">{{ t.count }}</q-badge>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { type ITab } from 'src/interfaces/tabs';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'TabsComp'
});

const props = defineProps<{
  tabs: ITab[];
  activeTab: ITab;
  useQuery?: boolean;
  sendInitialTab?: boolean;
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
  if (props.sendInitialTab ?? false) {
    emit('setActiveTab', getActiveTab());
  }
});
</script>

<style lang="scss" scoped>
.tabs-comp {
  overflow-x: auto;
}

.tabs-comp-counter {
  position: absolute;
  top: -6px;
  right: 0;
  z-index: 1;
}

.tabs-comp-label {
  white-space: nowrap;
}
</style>
