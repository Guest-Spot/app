<template>
  <!-- Contacts -->
  <div class="info-card bg-block border-radius-lg">
    <div v-if="title || icon" class="card-header q-px-md q-pt-md">
      <q-icon :name="icon" size="18px" />
      <h3 class="card-title text-subtitle1">{{ title }}</h3>
    </div>
    <div class="card-content">
      <slot name="header" />
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
          <span class="info-value email-text text-grey-6">{{ item.value }}</span>
        </a>
        <a v-else-if="item.type === InfoItemType.Link" target="_blank" :href="item.value">
          <span class="info-value link-text text-grey-6">{{ item.value }}</span>
        </a>
        <ExpandableText
          :text="item.value || 'n/a'"
          collapsible
          :class="item.className ? ['info-value', 'text-grey-6', item.className] : ['info-value', 'text-grey-6']"
          formatted
        />
        <div v-if="item.value" class="flex items-center q-gap-sm q-ml-auto">
          <q-btn
            v-if="item.type === InfoItemType.Phone && getWhatsappLink(item.value)"
            :icon="whatsappIcon"
            :href="getWhatsappLink(item.value) ?? undefined"
            target="_blank"
            rel="noopener"
            size="sm"
            round
            unelevated
            class="bg-block q-ml-auto"
            aria-label="Write via WhatsApp"
          />
          <q-btn
            v-if="item.value && isCopyable(item.type)"
            icon="content_copy"
            size="sm"
            round
            unelevated
            class="bg-block q-ml-auto"
            text-color="primary"
            @click="copyLink(item.value)"
          />
        </div>
      </div>
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { copyToClipboard, useQuasar } from 'quasar';
import { InfoItemType } from 'src/interfaces/enums';
import ExpandableText from 'src/components/ExpandableText.vue';
import whatsappIconUrl from 'src/assets/icons/whatsapp.svg';

interface Props {
  title?: string;
  icon?: string;
  data?: {
    label: string;
    value: string;
    type?: InfoItemType;
    className?: string;
  }[];
}

defineProps<Props>();

const $q = useQuasar();
const whatsappIcon = `img:${whatsappIconUrl}`;

const getWhatsappLink = (phone: string): string | null => {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');

  return digits ? `https://wa.me/${digits}` : null;
};

const isCopyable = (type?: InfoItemType): boolean => {
  if (!type) {
    return false;
  }
  return [InfoItemType.Link, InfoItemType.Phone, InfoItemType.Email].includes(type);
};

const showToast = () => {
  $q.notify({
    type: 'positive',
    color: 'dark',
    message: 'Copied!',
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
}

.email-text {
  word-break: break-all;
}

.link-text {
  text-decoration: underline;
  word-break: break-all;
}
</style>
