import type { NotificationType } from 'src/interfaces/enums';

export type NotificationBody = Record<string, unknown> | null;

export interface INotify {
  documentId: string;
  ownerDocumentId: string;
  type: NotificationType;
  recipientDocumentId: string;
  body: NotificationBody;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
