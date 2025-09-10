export interface IPortfolio {
  documentId: string;
  title: string;
  description: string;
  pictures: string[];
  tags: string[];
  ownerDocumentId: string;
}


export interface IPortfolioForm {
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  tags: string[];
}
