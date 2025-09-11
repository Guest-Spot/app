import type { IPicture, ITag } from 'src/interfaces/common';


export interface IPortfolio {
  documentId: string;
  title: string;
  description: string;
  pictures: IPicture[];
  tags: ITag[];
  ownerDocumentId: string;
}

export interface IPortfolioForm {
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  tags: string[];
}

export interface IGraphQLPortfoliosResult {
  portfolios: IPortfolio[];
}

export interface IGraphQLPortfolioResult {
  portfolio: IPortfolio[];
}
