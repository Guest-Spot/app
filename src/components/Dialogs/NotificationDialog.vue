<template>
  <q-dialog
    v-model="isVisible"
    position="right"
    full-width
    full-height
    no-route-dismiss
    transition-show="slide-left"
    transition-hide="slide-right"
    class="notification-dialog"
  >
    <q-card>
      <q-card-section class="notification-dialog-header bg-block row items-center justify-between">
        <div class="text-subtitle1 text-bold">Notifications</div>
        <q-btn
          icon="close"
          flat
          round
          dense
          class="q-ml-sm bg-block"
          size="sm"
          text-color="negative"
          v-close-popup
        />
      </q-card-section>
      <q-card-section class="dialog-content">
        <div v-if="receivedPendingInvites.length > 0" class="flex column q-gap-sm">
          <NotificationItem
            v-for="invite in receivedPendingInvites"
            :key="invite.documentId"
            :invite="invite"
            :loading-accept="loadingAccept && invite.documentId === updatingInviteDocumentId"
            :loading-reject="loadingReject && invite.documentId === updatingInviteDocumentId"
            @accept="handleAccept"
            @reject="handleReject"
          />
        </div>
        <div
          v-else
          class="flex justify-center items-center q-h-full q-mt-lg full-width column q-gap-sm"
        >
          <q-icon name="notifications" size="24px" class="text-grey-6" />
          <div class="text-caption text-grey-6">Notifications not found</div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref, watch } from 'vue';
import NotificationItem from 'src/components/Cards/NotificationItem.vue';
import { useMutation } from '@vue/apollo-composable';
import { UPDATE_INVITE_MUTATION } from 'src/apollo/types/invite';
import { EReactions } from 'src/interfaces/enums';
import useNotify from 'src/modules/useNotify';
import useInviteCompos from 'src/composables/useInviteCompos';
import useUser from 'src/modules/useUser';

interface Props {
  modelValue: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const emit = defineEmits<Emits>();
const props = defineProps<Props>();
const $q = useQuasar();
const { showSuccess } = useNotify();
const { fetchInvites, receivedPendingInvites } = useInviteCompos();
const { user } = useUser();

defineOptions({
  components: {
    NotificationItem,
  },
});

const {
  mutate: updateInviteMutation,
  onDone: onUpdateInviteSuccess,
  onError: onUpdateInviteError,
} = useMutation(UPDATE_INVITE_MUTATION);

// Dialog visibility
const isVisible = ref(props.modelValue);
const updatingInviteDocumentId = ref<string | null>(null);
const successMessage = ref<string>('');
const loadingAccept = ref<boolean>(false);
const loadingReject = ref<boolean>(false);

const handleAccept = (documentId: string) => {
  updatingInviteDocumentId.value = documentId;
  $q.dialog({
    title: 'Confirm Invitation',
    message: 'Are you sure you want to accept this invitation?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      title: 'Cancel',
    },
    ok: {
      color: 'primary',
      rounded: true,
      label: 'Accept',
    },
  }).onOk(() => {
    loadingAccept.value = true;
    void updateInviteMutation({
      documentId,
      data: {
        reaction: EReactions.Accepted,
      },
    });
    successMessage.value = 'Invitation accepted successfully';
  });
};

const handleReject = (documentId: string) => {
  updatingInviteDocumentId.value = documentId;
  $q.dialog({
    title: 'Confirm Rejection',
    message: 'Are you sure you want to reject this invitation?',
    cancel: {
      color: 'grey-9',
      rounded: true,
      title: 'Cancel',
    },
    ok: {
      color: 'negative',
      rounded: true,
      label: 'Reject',
    },
  }).onOk(() => {
    loadingReject.value = true;
    void updateInviteMutation({
      documentId,
      data: {
        reaction: EReactions.Rejected,
      },
    });
    successMessage.value = 'Invitation rejected successfully';
  });
};

onUpdateInviteSuccess(() => {
  void fetchInvites({
    reaction: {
      eq: EReactions.Pending,
    },
    recipient: {
      eq: user.value?.documentId,
    },
  });
  updatingInviteDocumentId.value = null;
  showSuccess(successMessage.value);
  successMessage.value = '';
  loadingAccept.value = false;
  loadingReject.value = false;
});

onUpdateInviteError((error) => {
  updatingInviteDocumentId.value = null;
  console.error('Error updating invite', error);
  successMessage.value = '';
  loadingAccept.value = false;
  loadingReject.value = false;
});

// Watch for props changes
watch(
  () => props.modelValue,
  (newValue) => {
    isVisible.value = newValue;
  },
);

// Watch for internal changes to isVisible
watch(isVisible, (newValue) => {
  emit('update:modelValue', newValue);
});
</script>

<style lang="scss" scoped>
.notification-dialog {
  .notification-dialog-header {
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .q-card {
    width: 320px !important;
    border-radius: 20px 0 0 20px;
    box-shadow: none;
  }
}
</style>
