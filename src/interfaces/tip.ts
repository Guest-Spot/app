export interface ITipPaymentSession {
  sessionId: string;
  sessionUrl: string;
}

export interface ITipPreset {
  id: string;
  label: string;
  amountCents: number;
  order: number;
}

export interface ITipPresetsResult {
  tipPresets: ITipPreset[];
}
