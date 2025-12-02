<template>
  <q-page>
    <PublicArtistProfileContent
      :document-id="documentId"
      :use-query="true"
      :check-parent-opening-hours="true"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import PublicArtistProfileContent from 'src/components/PublicArtistProfile/PublicArtistProfileContent.vue';

const route = useRoute();
const documentId = computed(() => route.params.documentId as string);
</script>
