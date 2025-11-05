export interface IStripeDashboardUrl {
  url: string;
  accountId: string;
}

export interface IStripeAccountStatus {
  payoutsEnabled: boolean;
  onboarded: boolean;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  accountId: string;
}

export interface IGetStripeDashboardUrlResponse {
  getStripeDashboardUrl: IStripeDashboardUrl;
}

export interface ICheckStripeAccountStatusResponse {
  checkStripeAccountStatus: IStripeAccountStatus;
}

