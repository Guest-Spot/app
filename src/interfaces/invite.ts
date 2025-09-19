export interface IInvite {
  documentId: string;
  title: string;
  description: string;
  sender: string;
  recipient: string;
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

