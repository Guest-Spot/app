<template>
  <q-page class="q-pb-xl q-pt-lg flex column items-start q-gap-md">
    <div class="q-my-auto full-width">
      <div class="container">
        <div class="text-h4 q-mb-lg page-title">Frequently Asked Questions</div>

        <div class="faq-content flex column q-gap-md">
          <q-card class="faq-card" v-for="(faq, index) in faqs" :key="index">
            <q-card-section class="faq-section">
              <div class="faq-question">{{ faq.question }}</div>
              <p class="faq-answer">{{ faq.answer }}</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// FAQ data
const faqs = ref([
  {
    question: 'What is GuestSpot?',
    answer: 'GuestSpot is a platform that helps you manage and organize your guest-related activities.'
  },
  {
    question: 'How do I get started?',
    answer: 'Simply create an account and start exploring the features available in our platform.'
  },
  {
    question: 'Is GuestSpot free to use?',
    answer: 'We offer both free and premium plans. Check our pricing page for more details.'
  },
  {
    question: 'How can I contact support?',
    answer: 'You can reach our support team through the contact form or email us directly at support@guestspot.com.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings.'
  }
]);

// FAQ page component
defineOptions({
  name: 'FAQPage'
});
</script>

<style scoped lang="scss">
.page-title {
  color: var(--brand-dark);
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;
}

.faq-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.faq-card {
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

.faq-section {
  padding: 24px;
}

.faq-question {
  color: var(--brand-dark);
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  line-height: 1.4;
}

.faq-answer {
  color: var(--text-secondary);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
}
</style>
