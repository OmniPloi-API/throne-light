/**
 * Net Payout Calculator
 * 
 * Calculates fees to deduct from partner withdrawals so platform absorbs $0 costs.
 * Stripe Connect fees are passed to the partner, not the platform.
 */

// Fee structure constants
const FEES = {
  // US Partners
  US: {
    PAYOUT_FEE: 0.25, // Per transfer
    MONTHLY_ACTIVE_FEE: 2.00, // First payout of month only
    TAX_FORM_FEE: 2.99, // Annual (handled separately)
    MIN_WITHDRAWAL: 10.00,
  },
  // International Partners (Extended Network)
  INTERNATIONAL: {
    PAYOUT_FEE: 0.25, // Base fee
    CROSS_BORDER_PERCENT: 0.01, // 1% FX/cross-border fee
    MONTHLY_ACTIVE_FEE: 2.00,
    MIN_WITHDRAWAL: 50.00, // Higher minimum for international
  },
  // Specific country overrides
  COUNTRY_OVERRIDES: {
    // Nigeria - via Paystack/Stripe Extended Network
    NG: {
      CROSS_BORDER_PERCENT: 0.015, // 1.5% for Nigeria
      MIN_WITHDRAWAL: 50.00,
    },
    // UK - lower fees
    GB: {
      CROSS_BORDER_PERCENT: 0.005, // 0.5% for UK
      MIN_WITHDRAWAL: 25.00,
    },
    // EU countries - moderate fees
    EU: {
      CROSS_BORDER_PERCENT: 0.008, // 0.8% for EU
      MIN_WITHDRAWAL: 25.00,
    },
  } as Record<string, { CROSS_BORDER_PERCENT: number; MIN_WITHDRAWAL: number }>,
};

// EU country codes
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

export interface PayoutCalculation {
  amountRequested: number;
  payoutFee: number;
  monthlyFee: number;
  crossBorderFee: number;
  totalFees: number;
  amountToDeposit: number;
  isFirstPayoutOfMonth: boolean;
  isInternational: boolean;
  minWithdrawal: number;
  error?: string;
}

/**
 * Calculate net payout after fees
 * @param amountRequested - The gross amount the partner wants to withdraw
 * @param countryCode - Partner's country code (e.g., 'US', 'NG', 'GB')
 * @param lastPayoutMonth - Last month they received a payout (e.g., '2025-01')
 * @returns PayoutCalculation with fee breakdown
 */
export function calculateNetPayout(
  amountRequested: number,
  countryCode: string,
  lastPayoutMonth?: string
): PayoutCalculation {
  const isUS = countryCode === 'US';
  const isInternational = !isUS;
  
  // Determine current month for monthly fee check
  const currentMonth = new Date().toISOString().slice(0, 7); // '2025-01'
  const isFirstPayoutOfMonth = lastPayoutMonth !== currentMonth;
  
  // Get fee structure based on country
  let feeStructure = isUS ? FEES.US : FEES.INTERNATIONAL;
  let crossBorderPercent = isUS ? 0 : FEES.INTERNATIONAL.CROSS_BORDER_PERCENT;
  let minWithdrawal = isUS ? FEES.US.MIN_WITHDRAWAL : FEES.INTERNATIONAL.MIN_WITHDRAWAL;
  
  // Check for country-specific overrides
  if (FEES.COUNTRY_OVERRIDES[countryCode]) {
    crossBorderPercent = FEES.COUNTRY_OVERRIDES[countryCode].CROSS_BORDER_PERCENT;
    minWithdrawal = FEES.COUNTRY_OVERRIDES[countryCode].MIN_WITHDRAWAL;
  } else if (EU_COUNTRIES.includes(countryCode)) {
    crossBorderPercent = FEES.COUNTRY_OVERRIDES['EU'].CROSS_BORDER_PERCENT;
    minWithdrawal = FEES.COUNTRY_OVERRIDES['EU'].MIN_WITHDRAWAL;
  }
  
  // Calculate fees
  const payoutFee = isUS ? FEES.US.PAYOUT_FEE : FEES.INTERNATIONAL.PAYOUT_FEE;
  const monthlyFee = isFirstPayoutOfMonth ? feeStructure.MONTHLY_ACTIVE_FEE : 0;
  const crossBorderFee = isInternational ? amountRequested * crossBorderPercent : 0;
  
  const totalFees = payoutFee + monthlyFee + crossBorderFee;
  const amountToDeposit = amountRequested - totalFees;
  
  // Validation
  let error: string | undefined;
  
  if (amountRequested < minWithdrawal) {
    error = `Minimum withdrawal is $${minWithdrawal.toFixed(2)} for your region.`;
  } else if (amountToDeposit <= 0) {
    error = `Withdrawal amount is too small to cover fees ($${totalFees.toFixed(2)}).`;
  }
  
  return {
    amountRequested,
    payoutFee: Math.round(payoutFee * 100) / 100,
    monthlyFee: Math.round(monthlyFee * 100) / 100,
    crossBorderFee: Math.round(crossBorderFee * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    amountToDeposit: Math.round(amountToDeposit * 100) / 100,
    isFirstPayoutOfMonth,
    isInternational,
    minWithdrawal,
    error,
  };
}

/**
 * Get minimum withdrawal amount for a country
 */
export function getMinWithdrawal(countryCode: string): number {
  if (countryCode === 'US') return FEES.US.MIN_WITHDRAWAL;
  if (FEES.COUNTRY_OVERRIDES[countryCode]) {
    return FEES.COUNTRY_OVERRIDES[countryCode].MIN_WITHDRAWAL;
  }
  if (EU_COUNTRIES.includes(countryCode)) {
    return FEES.COUNTRY_OVERRIDES['EU'].MIN_WITHDRAWAL;
  }
  return FEES.INTERNATIONAL.MIN_WITHDRAWAL;
}

/**
 * Format fee breakdown for display to partner
 */
export function formatFeeBreakdown(calc: PayoutCalculation): string {
  const lines = [
    `Withdrawal Amount: $${calc.amountRequested.toFixed(2)}`,
  ];
  
  if (calc.payoutFee > 0) {
    lines.push(`Payout Fee: -$${calc.payoutFee.toFixed(2)}`);
  }
  if (calc.monthlyFee > 0) {
    lines.push(`Monthly Service Fee: -$${calc.monthlyFee.toFixed(2)}`);
  }
  if (calc.crossBorderFee > 0) {
    lines.push(`International Transfer Fee: -$${calc.crossBorderFee.toFixed(2)}`);
  }
  
  lines.push(`─────────────────────`);
  lines.push(`Total Deposit: $${calc.amountToDeposit.toFixed(2)}`);
  
  return lines.join('\n');
}
