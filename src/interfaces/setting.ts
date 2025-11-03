export interface ISetting {
  platformFeePercent: number;
  stripeFeePercent: number;
  totalFeePercent: number;
}

export interface ISettingQueryResponse {
  setting: ISetting;
}

