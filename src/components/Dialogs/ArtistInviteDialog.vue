<template>
  <q-dialog
    v-model="isVisible"
    position="bottom"
  >
    <q-card class="artist-invite-dialog">
      <q-card-section class="dialog-header">
        <div class="text-subtitle1 text-bold">{{ title }}</div>
        <q-btn
          icon="close"
          round
          dense
          size="sm"
          class="bg-block"
          text-color="primary"
          @click="closeDialog"
        />
      </q-card-section>

      <q-card-section class="dialog-content">
        <div class="input-group">
          <label class="input-label">Invitation Link</label>
          <div class="link-container">
            <q-input
              v-model="inviteLink"
              outlined
              dense
              rounded
              readonly
              class="custom-input link-input"
            />
            <q-btn
              round
              dense
              class="bg-block"
              @click="copyLink"
            >
              <q-icon name="content_copy" size="18px" />
            </q-btn>
          </div>
          <p class="link-description text-grey-6">
            Send this link to the artist you want to invite to your shop
          </p>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  shopId?: string | number;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const $q = useQuasar();

const isVisible = ref(props.modelValue);
const copyIcon = ref('content_copy');
const copyButtonColor = ref('dark');

// Generate invite link based on shop ID
const inviteLink = computed(() => {
  const baseUrl = window.location.origin;
  const shopId = props.shopId || 'default';
  return `${baseUrl}/artist/join?shop=${shopId}&invite=true`;
});

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  isVisible.value = newValue;
});

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const closeDialog = () => {
  isVisible.value = false;
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(inviteLink.value);

    // Show success feedback
    copyIcon.value = 'check';
    copyButtonColor.value = 'positive';

    $q.notify({
      type: 'positive',
      color: 'dark',
      message: 'Link copied to clipboard!',
      position: 'top',
      timeout: 2000,
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    });

    // Reset button state after delay
    setTimeout(() => {
      copyIcon.value = 'content_copy';
      copyButtonColor.value = 'dark';
    }, 2000);

  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = inviteLink.value;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    copyIcon.value = 'check';
    copyButtonColor.value = 'positive';

    $q.notify({
      type: 'positive',
      message: 'Link copied to clipboard!',
      position: 'top',
      timeout: 2000,
      actions: [
        {
          icon: 'close',
          color: 'white',
        }
      ]
    });

    setTimeout(() => {
      copyIcon.value = 'content_copy';
      copyButtonColor.value = 'dark';
    }, 2000);
  }
};

// Computed property for title
const title = computed(() => 'Invite Artist to Shop');
</script>

<style scoped lang="scss">
.artist-invite-dialog {
  border-radius: 20px 20px 0 0;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .text-subtitle1 {
      font-weight: 600;
    }
  }

  .dialog-content {
    padding: 20px;

    .input-group {
      margin-bottom: 20px;

      .input-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        font-size: 14px;
      }

      .link-container {
        display: flex;
        align-items: center;
        gap: 8px;

        .link-input {
          flex: 1;
        }

        .copy-button {
          flex-shrink: 0;
        }
      }

      .link-description {
        margin: 8px 0 0 0;
        font-size: 12px;
        color: #666;
        line-height: 1.4;
      }
    }
  }

  .dialog-actions {
    padding: 16px 20px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    bottom: 0;

    .q-btn {
      min-width: 100px;
      font-weight: 600;
    }
  }
}

.body--dark {
  .artist-invite-dialog {
    .dialog-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
