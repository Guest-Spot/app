<template>
  <q-page>
    <PublicShopProfileContent
      :document-id="documentId"
      :is-fixed-button="true"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PublicShopProfileContent from 'src/components/PublicShopProfile/PublicShopProfileContent.vue';

const route = useRoute();
const documentId = computed(() => route.params.documentId as string);
</script>
