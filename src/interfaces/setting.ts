export interface ISetting {
  platformFeePercent: number;
  stripeFeePercent: number;
  stripeEnabled: boolean;
  totalFeePercent: number;
}

export interface ISettingQueryResponse {
  setting: ISetting;
}

