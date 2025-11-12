import type { IPicture, ITag } from 'src/interfaces/common';
import type { IUser } from 'src/interfaces/user';

export interface IPortfolio {
  documentId: string;
  title: string;
  description: string;
  pictures: IPicture[];
  tags: ITag[];
  owner: IUser;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface IPortfolioForm {
  title: string;
  description: string;
  pictures?: IPicture[];
  tags: ITag[];
  imagesForUpload?: File[];
  imagesForRemove?: string[];
}

export interface IGraphQLPortfoliosResult {
  portfolios: IPortfolio[];
  portfolios_connection: {
    pageInfo: {
      total: number;
    };
  };
}

export interface IGraphQLPortfolioResult {
  portfolio: IPortfolio[];
}
