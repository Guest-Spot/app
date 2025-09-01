<template>
  <q-page class="page q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-h4 q-mb-lg page-title">Privacy Policy</div>

        <div class="privacy-content flex column q-gap-md">
          <q-card class="privacy-card" v-for="(section, index) in privacySections" :key="index">
            <q-card-section class="privacy-section">
              <div class="privacy-heading">{{ section.heading }}</div>
              <p class="privacy-text">{{ section.content }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Privacy Policy sections
const privacySections = ref([
  {
    heading: 'Information We Collect',
    content: 'We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.'
  },
  {
    heading: 'How We Use Your Information',
    content: 'We use the information we collect to provide, maintain, and improve our services, to process transactions, and to communicate with you.'
  },
  {
    heading: 'Information Sharing',
    content: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy.'
  },
  {
    heading: 'Data Security',
    content: 'We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.'
  },
  {
    heading: 'Your Rights',
    content: 'You have the right to access, update, or delete your personal information. You can also opt out of certain communications from us.'
  },
  {
    heading: 'Cookies and Tracking',
    content: 'We use cookies and similar tracking technologies to enhance your experience on our website and to analyze how our services are used.'
  },
  {
    heading: 'Third-Party Services',
    content: 'Our website may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.'
  },
  {
    heading: 'Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.'
  }
]);

// Privacy Policy page component
defineOptions({
  name: 'PrivacyPage'
});
</script>

<style scoped lang="scss">
.page-title {
  color: var(--brand-dark);
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
}

.privacy-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.privacy-card {
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

.privacy-section {
  padding: 24px;
}

.privacy-heading {
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.privacy-text {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}
</style>
