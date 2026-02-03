const FLOAT_BIAS = 1e-10;

/**
 * Round a monetary value to the given decimal places using half-up rule.
 * Resilient to floating-point representation (e.g. 5.145 rounds to 5.15, not 5.14).
 * @param value - Amount to round
 * @param decimals - Number of decimal places (default 2)
 * @returns Rounded number
 */
export function roundMoney(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const factor = 10 ** decimals;
  const scaled = value * factor;
  const bias = value >= 0 ? FLOAT_BIAS : -FLOAT_BIAS;
  return Math.round(scaled + bias) / factor;
}

/**
 * Convert cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars or null if input is null/undefined
 */
export function centsToDollars(cents: number | null | undefined): number | null {
  if (cents === null || cents === undefined) {
    return null;
  }
  return cents / 100;
}

/**
 * Convert dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents (rounded half-up) or null if input is null/undefined
 */
export function dollarsToCents(dollars: number | null | undefined): number | null {
  if (dollars === null || dollars === undefined) {
    return null;
  }
  const rounded = roundMoney(dollars, 2);
  return Math.round(rounded * 100);
}

/**
 * Compute total payment amount (deposit + platform commission).
 * Used by both artist booking and Guest Spot deposit payment dialogs.
 * @param depositDollars - Deposit amount in dollars
 * @param feePercent - Platform fee as percentage (e.g. 5 for 5%), or null
 * @returns Total in dollars, rounded to 2 decimal places (half-up)
 */
export function computeTotalPaymentAmount(
  depositDollars: number,
  feePercent: number | null
): number {
  if (!depositDollars || feePercent == null) {
    return roundMoney(depositDollars);
  }
  const feeDecimal = feePercent / 100;
  const commission = roundMoney(depositDollars * feeDecimal);
  return roundMoney(depositDollars + commission);
}
