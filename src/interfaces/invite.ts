import type { EReactions, InviteType } from 'src/interfaces/enums';
import type { IUser } from './user';

export interface IInvite {
  documentId: string;
  type: InviteType;
  reaction: EReactions;
  title: string;
  description: string;
  sender: IUser;
  recipient: IUser;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface IGraphQLInvitesResult {
  invites: IInvite[];
}

export interface IGraphQLInviteResult {
  invite: IInvite;
}

export interface IGraphQLInvitesConnectionResult {
  invites_connection: {
    pageInfo: {
      total: number;
    };
  };
}
