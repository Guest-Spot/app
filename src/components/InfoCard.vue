<template>
  <!-- Contacts -->
  <div class="info-card bg-block border-radius-md">
    <div class="card-header q-px-md q-py-sm bg-block">
      <q-icon :name="icon" size="18px" />
      <h3 class="card-title text-subtitle1">{{ title }}</h3>
    </div>
    <div class="card-content">
      <div
        class="info-row"
        v-for="item in data"
        :key="`${item.label}-${item.value}`"
        :class="item.className"
      >
        <span v-if="item.label" class="info-label">{{ item.label }}:</span>
        <a v-if="item.type === InfoItemType.Phone" target="_blank" :href="`tel:${item.value}`">
          <span class="info-value text-grey-6">{{ item.value }}</span>
        </a>
        <a
          v-else-if="item.type === InfoItemType.Email"
          target="_blank"
          :href="`mailto:${item.value}`"
        >
          <span class="info-value text-grey-6">{{ item.value }}</span>
        </a>
        <a v-else-if="item.type === InfoItemType.Link" target="_blank" :href="item.value">
          <span class="info-value text-grey-6">{{ item.value }}</span>
        </a>
        <ExpandableText v-else :text="item.value" collapsible class="info-value text-grey-6" />
        <q-btn
          v-if="item.value && item.type === InfoItemType.Link"
          icon="content_copy"
          size="sm"
          round
          unelevated
          class="bg-block q-ml-auto"
          text-color="primary"
          @click="copyLink(item.value)"
        />

        <q-skeleton v-if="!item.value" type="text" width="100%" height="20px" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard, useQuasar } from 'quasar';
import { InfoItemType } from 'src/interfaces/enums';
import ExpandableText from 'src/components/ExpandableText.vue';

interface Props {
  title: string;
  icon: string;
  data: {
    label: string;
    value: string;
    type?: InfoItemType;
    className?: string;
  }[];
}

defineProps<Props>();

const $q = useQuasar();

const showToast = () => {
  $q.notify({
    type: 'positive',
    color: 'dark',
    message: 'Link copied!',
    position: 'top',
    timeout: 2000,
    actions: [
      {
        icon: 'close',
        color: 'white',
      },
    ],
  });
};

const copyLink = (value: string) => {
  void copyToClipboard(value);
  showToast();
};
</script>

<style scoped lang="scss">
.info-card {
  width: 100%;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  margin: 0;
  font-weight: 600;
}

.card-content {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: start;
  margin-bottom: 16px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-weight: 600;
  min-width: 90px;
  flex-shrink: 0;
}

.info-value {
  color: var(--primary);
  text-decoration: none;
  word-break: break-all;
}

.text-ellipsis {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
