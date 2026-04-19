/**
 * Pure-function settlement engine for a single game year.
 *
 * Every function here takes state in and returns new state out. Zero side effects,
 * zero Zustand dependency. This makes the engine fully testable headlessly
 * without mounting any store.
 */

import type { PlayerState, AssetClass } from '../types/game';
import type { GameEvent } from '../types/events';
import type { LifestyleSelection, LifestyleCategory, LifestyleTier } from '../types/lifestyle';
import { calculateDowngradePenalty, getNominalCost, processAnnualDebtInterest, processAnnualCreditCardInterest } from './financeEngine';
import { generateMonthlyMatrix } from './historicalData';

// ── Watermark helpers ───────────────────────────────────────────────────────

export const updateMaxSavings = (player: PlayerState): void => {
  const currentSavings = player.cash + player.assets.savingsAccount;
  if (currentSavings > player.maxSavings) {
    player.maxSavings = currentSavings;
  }
};

/**
 * Updates peakNetWorth on the player object.
 * Returns the new allTimePeakNetWorth value (caller is responsible for persisting it).
 */
export const updatePeakNetWorth = (player: PlayerState, currentAllTimePeak: number): number => {
  const totalAssets = player.cash + Object.values(player.assets).reduce((a, b) => a + b, 0);
  const totalDebt = Object.values(player.liabilities).reduce((a, b) => a + b, 0);
  const currentNetWorth = totalAssets - totalDebt;

  if (currentNetWorth > player.peakNetWorth) {
    player.peakNetWorth = currentNetWorth;
  }

  return currentNetWorth > currentAllTimePeak ? currentNetWorth : currentAllTimePeak;
};

// ── Lifestyle settlement ────────────────────────────────────────────────────

export interface LifestyleResult {
  player: PlayerState;
  finalSelection: LifestyleSelection;
}

export const settleLifestyle = (
  player: PlayerState,
  selection: LifestyleSelection,
  previousLifestyle: LifestyleSelection | null,
  startYear: number,
  currentYear: number,
): LifestyleResult => {
  let penalty = 0;

  const finalSelection = { ...selection };
  if (player.lockedLifestyle.transport) {
    finalSelection.transport = { ...finalSelection.transport!, id: player.lockedLifestyle.transport, monthlyCostBase: 800 };
  }

  if (previousLifestyle) {
    const categories: LifestyleCategory[] = ['housing', 'food', 'clothing', 'transport'];
    categories.forEach(cat => {
      if (previousLifestyle[cat] && finalSelection[cat]) {
        penalty += calculateDowngradePenalty(previousLifestyle[cat] as LifestyleTier, finalSelection[cat]!, startYear, currentYear);
      }
    });
  }

  let healthDelta = 0, reputationDelta = 0, happinessDelta = 0;
  const expenses = { ...player.expenses };

  Object.values(finalSelection).forEach(tier => {
    if (tier) {
      healthDelta += tier.healthEffect;
      reputationDelta += tier.reputationEffect;
      happinessDelta += tier.happinessEffect;
      expenses[tier.category] = getNominalCost(tier.monthlyCostBase, startYear, currentYear);
    }
  });

  player.health = Math.max(0, Math.min(100, player.health + healthDelta));
  player.reputation = Math.max(0, Math.min(100, player.reputation + reputationDelta));
  player.happiness = Math.max(0, Math.min(100, player.happiness + happinessDelta));
  player.expenses = expenses;

  player.cash -= penalty;
  if (player.cash < 0) {
    player.liabilities.creditCard += Math.abs(player.cash);
    player.cash = 0;
  }

  return { player, finalSelection };
};

// ── Health threshold ─────────────────────────────────────────────────────────

const LOW_HEALTH_THRESHOLD = 30;

// ── Action effects ──────────────────────────────────────────────────────────

/**
 * Work action: earns salary/6. When health drops below 30,
 * income is halved — the player is dragging themselves to work while sick.
 */
export const applyWorkAction = (player: PlayerState): void => {
  const baseIncome = Math.round(player.salary / 6);
  const income = player.health < LOW_HEALTH_THRESHOLD
    ? Math.round(baseIncome * 0.5)
    : baseIncome;
  player.cash += income;
  player.health = Math.max(0, player.health - 7);
  player.workActionsThisYear += 1;
};

/**
 * Rest action: recovers health, earns nothing.
 * +20 health (capped at 100), +5 happiness. Costs 1 action slot.
 */
export const applyRestAction = (player: PlayerState): void => {
  player.health = Math.min(100, player.health + 20);
  player.happiness = Math.min(100, player.happiness + 5);
};

export const applyInvestAction = (
  player: PlayerState,
  asset: AssetClass,
  isBuy: boolean,
  amount: number,
  globalActionCount: number,
): void => {
  if (isBuy && player.cash >= amount) {
    player.cash -= amount;
    player.assets[asset] += amount;
    player.assetCooldowns[asset] = globalActionCount + 2;
  } else if (!isBuy && player.assets[asset] >= amount && globalActionCount >= player.assetCooldowns[asset]) {
    player.assets[asset] -= amount;
    player.cash += amount;
  }
};

// ── Event resolution ────────────────────────────────────────────────────────

export const resolveEvent = (player: PlayerState, event: GameEvent, globalActionCount: number): void => {
  player.cash += event.cashEffect;
  if (player.cash < 0) {
    player.liabilities.creditCard += Math.abs(player.cash);
    player.cash = 0;
  }

  player.health = Math.max(0, Math.min(100, player.health + event.healthEffect));
  player.reputation = Math.max(0, Math.min(100, player.reputation + event.reputationEffect));
  player.happiness = Math.max(0, Math.min(100, player.happiness + event.happinessEffect));

  if (event.assetMultipliers) {
    for (const [asset, multiplier] of Object.entries(event.assetMultipliers)) {
      if (multiplier !== undefined) {
        player.assets[asset as AssetClass] = Math.round(player.assets[asset as AssetClass] * multiplier);
      }
    }
  }

  if (event.skipActions) player.skippedActionsCount += event.skipActions;
  if (event.lockLifestyle) player.lockedLifestyle[event.lockLifestyle.category] = event.lockLifestyle.tierId;
  if (event.salaryMultiplier) player.salary = Math.round(player.salary * event.salaryMultiplier);
  if (event.volatilityMultiplier) {
    player.activeBuffs.push({
      type: 'volatility',
      asset: event.volatilityMultiplier.asset,
      multiplier: event.volatilityMultiplier.multiplier,
      expiresAtAction: globalActionCount + event.volatilityMultiplier.durationActions,
    });
  }
};

// ── Year-end settlement ─────────────────────────────────────────────────────

export interface YearEndResult {
  player: PlayerState;
  marketHistory: Record<AssetClass, number[]>;
}

/**
 * Pure year-end settlement. Applies:
 *  1. Stable experience + salary bump
 *  2. Annual lifestyle expense deduction
 *  3. Debt interest compounding
 *  4. Asset market returns + growth drift
 *  5. Resets per-year counters
 */
export const settleYearEnd = (
  player: PlayerState,
  currentYear: number,
): YearEndResult => {
  // Stable experience
  if (player.workActionsThisYear >= 4 && !player.changedJobsThisYear) {
    player.stableExperience += 1;
    player.salary = Math.round(player.salary * 1.07);
  }

  player.workActionsThisYear = 0;
  player.changedJobsThisYear = false;
  player.lockedLifestyle = {};

  // Lifestyle expenses
  const totalMonthlyExpense = Object.values(player.expenses).reduce((a, b) => a + b, 0);
  const annualExpense = totalMonthlyExpense * 12;
  player.cash -= annualExpense;
  if (player.cash < 0) {
    player.liabilities.creditCard += Math.abs(player.cash);
    player.cash = 0;
  }

  // Debt interest
  player.liabilities.studentLoan = processAnnualDebtInterest(player.liabilities.studentLoan);
  if (player.liabilities.creditCard > 0) {
    player.liabilities.creditCard = processAnnualCreditCardInterest(player.liabilities.creditCard);
  }

  // Market returns
  const matrix = generateMonthlyMatrix(currentYear, player.activeBuffs);
  const growthDriftRate = 0.03 + Math.random() * 0.02;

  for (const asset of Object.keys(player.assets) as AssetClass[]) {
    if (player.assets[asset] > 0) {
      const endYearMult = matrix[asset][12];
      player.assets[asset] = Math.round(player.assets[asset] * endYearMult);
      if (asset !== 'vehicle') {
        player.assets[asset] = Math.round(player.assets[asset] * (1 + growthDriftRate));
      }
    }
  }

  return { player, marketHistory: matrix };
};

// ── Skip-year fast-forward ──────────────────────────────────────────────────

export const simulateSkippedYear = (
  player: PlayerState,
  currentYear: number,
  generateEvent: (year: number) => GameEvent,
): void => {
  for (let i = 0; i < 6; i++) {
    player.cash += Math.round(player.salary / 6);
    player.health = Math.max(0, player.health - 7);
    player.workActionsThisYear += 1;

    if (Math.random() < 0.25) {
      const event = generateEvent(currentYear);
      player.cash += event.cashEffect;
      if (player.cash < 0) {
        player.liabilities.creditCard += Math.abs(player.cash);
        player.cash = 0;
      }
      player.health = Math.max(0, Math.min(100, player.health + event.healthEffect));
      player.reputation = Math.max(0, Math.min(100, player.reputation + event.reputationEffect));
      player.happiness = Math.max(0, Math.min(100, player.happiness + event.happinessEffect));
      if (event.salaryMultiplier) player.salary = Math.round(player.salary * event.salaryMultiplier);
    }
  }
};
