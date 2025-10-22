<template>
  <span class="expandable-text">
    <span>{{ displayText }}</span>
    <q-btn
      v-if="isTruncated && !expanded"
      flat
      dense
      no-caps
      unelevated
      size="sm"
      class="expandable-text__btn"
      :label="showMoreLabel"
      color="primary"
      @click="onExpand"
    />
    <q-btn
      v-else-if="isTruncated && expanded && collapsible"
      flat
      dense
      no-caps
      unelevated
      size="sm"
      class="expandable-text__btn"
      :label="showLessLabel"
      color="primary"
      @click="onCollapse"
    />
  </span>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
  text: string;
  maxLength?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  collapsible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxLength: 160,
  showMoreLabel: 'Show more',
  showLessLabel: 'Show less',
  collapsible: false,
});

const expanded = ref(false);

const isTruncated = computed(() => props.text?.length > props.maxLength);

const truncatedText = computed(() => {
  if (!isTruncated.value) {
    return props.text;
  }

  const rawTruncated = props.text.slice(0, props.maxLength);

  const lastSpaceIndex = rawTruncated.lastIndexOf(' ');
  const shouldUseLastSpace = lastSpaceIndex > props.maxLength * 0.6;
  const safeTruncated = shouldUseLastSpace ? rawTruncated.slice(0, lastSpaceIndex) : rawTruncated;

  return `${safeTruncated.trimEnd()}...`;
});

const displayText = computed(() => (expanded.value ? props.text : truncatedText.value));

const onExpand = () => {
  expanded.value = true;
};

const onCollapse = () => {
  if (!props.collapsible) {
    return;
  }
  expanded.value = false;
};

watch(
  () => props.text,
  () => {
    expanded.value = false;
  },
);
</script>

<style scoped lang="scss">
.expandable-text {
  display: inline;
  white-space: pre-line;
  color: inherit;

  &__btn {
    padding: 0;
    min-height: auto;
    margin-left: 4px;
    font-weight: 600;
  }
}
</style>
