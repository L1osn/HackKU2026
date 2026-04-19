import type { AffordabilityState, LifestyleTier } from '../types/lifestyle';

/**
 * Simplified historical inflation rate based on year.
 */
export const getInflationRateForYear = (year: number): number => {
  if (year >= 1920 && year < 1930) return 0.02; // Roughly 2%
  if (year >= 1930 && year < 1940) return -0.01; // Deflation
  if (year >= 1940 && year < 1950) return 0.07;
  if (year >= 1950 && year < 1970) return 0.025;
  if (year >= 1970 && year < 1980) return 0.09; // Stagflation
  if (year >= 1980 && year < 1990) return 0.06;
  if (year >= 1990 && year < 2000) return 0.03;
  if (year >= 2000 && year < 2010) return 0.025;
  if (year >= 2010 && year <= 2020) return 0.015;
  if (year === 2021) return 0.047;
  if (year === 2022) return 0.08;
  if (year === 2023) return 0.034;
  if (year === 2024) return 0.029;
  if (year === 2025) return 0.028;
  if (year === 2026) return 0.025;
  
  return 0.025; // 2027+ normalized projection
};

/**
 * Get cumulative inflation multiplier from startYear to currentYear
 */
export const getCumulativeInflation = (startYear: number, currentYear: number): number => {
  let multiplier = 1.0;
  for (let y = startYear; y < currentYear; y++) {
    multiplier *= (1 + getInflationRateForYear(y));
  }
  return multiplier;
};

/**
 * Convert a base cost into the nominal cost for a specific year, given the start year
 */
export const getNominalCost = (baseCost: number, startYear: number, currentYear: number): number => {
  const multiplier = getCumulativeInflation(startYear, currentYear);
  return Math.round(baseCost * multiplier);
};

/**
 * Calculates the lifestyle adjustment (downgrade) penalty.
 * "Moving from Tier 3 or 4 to a lower tier incurs a one-time penalty of 1 month's rent at the vacated tier"
 * We'll generalize this to: any downgrade from any tier incurs a penalty equal to 1 month's cost of the old tier.
 * PRD: "if the player selects an option in a tier higher than their previous year's selection in the same category, the new tier's cost becomes the permanent minimum floor... without paying a one-time 'adjustment cost' (1 month of old tier)."
 */
export const calculateDowngradePenalty = (
  prevTier: LifestyleTier | null | undefined, 
  newTier: LifestyleTier,
  startYear: number,
  currentYear: number
): number => {
  if (!prevTier) return 0;
  if (newTier.tier < prevTier.tier) {
    // Penalty is 1 month of the old tier's nominal cost
    return getNominalCost(prevTier.monthlyCostBase, startYear, currentYear);
  }
  return 0;
};

/**
 * Estimate take-home pay (simple 25% effective tax rate assumption for UI purposes)
 */
export const estimateTakeHomePay = (annualSalary: number): number => {
  return annualSalary * 0.75;
};

/**
 * Check affordability state
 */
export const getAffordabilityState = (
  monthlyLifestyleCost: number, 
  annualSalary: number
): AffordabilityState => {
  const annualLifestyle = monthlyLifestyleCost * 12;
  const takeHome = estimateTakeHomePay(annualSalary);
  
  if (takeHome === 0) return 'OVEREXTENDED'; // prevent division by zero
  
  const ratio = annualLifestyle / takeHome;
  if (ratio < 0.5) return 'COMFORTABLE';
  if (ratio <= 0.75) return 'STRETCHING';
  return 'OVEREXTENDED';
};

/**
 * Calculates annual compound interest on student loan debt.
 * Rate: 10% APR (federal loan rate calibrated to modern averages).
 */
export const processAnnualDebtInterest = (studentLoan: number): number => {
  return Math.round(studentLoan * 1.10);
};

/**
 * Calculates annual compound interest on credit card debt.
 * Rate: 22% APR (punitive rate — triggers financial death spiral if left unchecked).
 * Priority: Players should ALWAYS clear this before student loan.
 */
export const processAnnualCreditCardInterest = (creditCard: number): number => {
  return Math.round(creditCard * 1.22);
};

