import type { PlayerState } from '../types/game';

/**
 * Generates a year-end narrative summary based on the player's financial and
 * health status at year close.
 */
export const generateYearEndSummary = (player: PlayerState): string => {
  const assetTotal = Object.values(player.assets).reduce((a, b) => a + b, 0);
  const debtTotal = player.liabilities.studentLoan + player.liabilities.creditCard + player.liabilities.mortgage;
  const netWorth = player.cash + assetTotal - debtTotal;

  const isRich = netWorth > 100000;
  const isBroke = netWorth < 0;
  
  const hasHighDebt = player.liabilities.creditCard > 5000;
  const isSick = player.health < 40;
  const isHealthy = player.health > 80;

  const hasHighAssets = assetTotal > 50000;

  if (isRich && isSick) return "Hard work has increased your account balance, but neck pain keeps you up all night.";
  if (isRich && isHealthy) return "You are crushing it. Wealth is growing and you feel invincible.";
  if (isRich && hasHighAssets) return "Your investment portfolio is carrying your net worth to new heights.";
  
  if (isBroke && isSick) return "Financially underwater and physically drained. A brutal year.";
  if (isBroke && hasHighDebt) return "Credit card debt is snowballing. The interest rates are suffocating.";
  if (isBroke) return "Your net worth is negative. Every paycheck feels like it vanishes instantly.";

  if (hasHighDebt && hasHighAssets) return "You are highly leveraged. Your assets are growing, but so is your debt.";
  if (isSick && !isBroke) return "You made decent money, but the medical bills and stress are piling up.";
  
  if (player.workActionsThisYear >= 5) return "You ground through the year, pulling long hours. Your wallet is slightly thicker.";
  if (player.education.isActive) return "Grad school is draining your time and money, but you hope it pays off.";
  if (player.changedJobsThisYear) return "You took a leap of faith with a new job. Time will tell if it was worth it.";
  
  if (assetTotal > player.cash * 2) return "You are heavily invested in the markets. You watch the charts anxiously.";
  if (player.cash > assetTotal * 2 && player.cash > 20000) return "You are hoarding cash. Safe, but inflation is slowly eating your purchasing power.";
  
  if (netWorth > 20000) return "A steady, average year. You made some progress, but nothing spectacular.";
  return "You survived another year in the rat race. Back to the grind tomorrow.";
};
