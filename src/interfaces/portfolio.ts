export interface IPortfolio {
  uuid: string;
  title: string;
  description: string;
  pictures: string[];
  tags: string[];
  ownerUuid: string;
}


export interface IPortfolioForm {
  title: string;
  description: string;
  imageUrl: string;
  imageFile: File | null;
  tags: string[];
}
