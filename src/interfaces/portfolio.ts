export interface IPortfolio {
  documentId: string;
  title: string;
  description: string;
  pictures: {
    url: string;
  }[];
  tags: {
    name: string;
  }[];
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
