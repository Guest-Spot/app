<template>
  <div class="tabs-comp">
    <div class="flex q-gap-sm justify-start no-wrap bg-block border-radius-lg">
      <q-btn
        v-for="t in tabs"
        :key="`tab-${t.tab}-${t.label}`"
        class="tab-btn"
        unelevated
        rounded
        :class="{
          'bg-primary text-white': currentActiveTab.tab === t.tab,
        }"
        @click="handleTabClick(t)"
        v-bind="$attrs"
      >
        <span class="tabs-comp-label"
          >{{ t.label }}
          <template v-if="t.count">&nbsp;({{ t.count }})</template>
        </span>
        <q-badge
          v-if="t.hasNew"
          color="warning"
          rounded
          class="tabs-comp-counter text-bold q-ml-xs"
        />
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { type ITab } from 'src/interfaces/tabs';
import { useRouter, useRoute } from 'vue-router';

defineOptions({
  name: 'TabsComp',
});

const props = defineProps<{
  tabs: ITab[];
  activeTab: ITab;
  useQuery?: boolean;
  sendInitialTab?: boolean;
}>();

const route = useRoute();
const router = useRouter();

const currentActiveTab = computed(() => props.activeTab);

const emit = defineEmits<{
  (e: 'setActiveTab', tab: ITab): void;
}>();

const handleTabClick = (tab: ITab) => {
  if (props.useQuery ?? false) {
    void router.replace({ query: { ...route.query, tab: tab.tab } });
  }
  emit('setActiveTab', tab);
};

const getActiveTab = () => {
  const tab = router.currentRoute.value.query.tab;
  if (tab) {
    return props.tabs.find((t) => t.tab === tab) || props.tabs[0]!;
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
  padding-top: 8px;
  margin-top: -8px;
}

.tabs-comp-counter {
  min-height: 8px;
  padding: 2px 4px;
  position: absolute;
  top: -2px;
  right: 2px;
  z-index: 1;
}

.tabs-comp-label {
  white-space: nowrap;
}
</style>
