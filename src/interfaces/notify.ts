import type { NotificationType } from 'src/interfaces/enums';

export interface INotify {
  documentId: string;
  ownerDocumentId: string;
  type: NotificationType;
  recipientDocumentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
