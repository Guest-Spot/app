<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-h4 q-mb-lg page-title">Terms of Service</div>
        
        <div class="tos-content flex column q-gap-md">
          <q-card class="tos-card" v-for="(section, index) in tosSections" :key="index">
            <q-card-section class="tos-section">
              <div class="tos-heading">{{ section.heading }}</div>
              <p class="tos-text">{{ section.content }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Terms of Service sections
const tosSections = ref([
  {
    heading: '1. Acceptance of Terms',
    content: 'By accessing and using GuestSpot, you accept and agree to be bound by the terms and provision of this agreement.'
  },
  {
    heading: '2. Use License',
    content: 'Permission is granted to temporarily download one copy of the materials on GuestSpot\'s website for personal, non-commercial transitory viewing only.'
  },
  {
    heading: '3. Disclaimer',
    content: 'The materials on GuestSpot\'s website are provided on an \'as is\' basis. GuestSpot makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.'
  },
  {
    heading: '4. Limitations',
    content: 'In no event shall GuestSpot or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GuestSpot\'s website.'
  },
  {
    heading: '5. Revisions and Errata',
    content: 'The materials appearing on GuestSpot\'s website could include technical, typographical, or photographic errors. GuestSpot does not warrant that any of the materials on its website are accurate, complete or current.'
  },
  {
    heading: '6. Links',
    content: 'GuestSpot has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by GuestSpot of the site.'
  }
]);

// Terms of Service page component
defineOptions({
  name: 'TOSPage'
});
</script>

<style scoped lang="scss">
.page-title {
  color: var(--brand-dark);
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
}

.tos-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tos-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid var(--shadow-light);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

.tos-section {
  padding: 24px;
}

.tos-heading {
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.tos-text {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}
</style>
