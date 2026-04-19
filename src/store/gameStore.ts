import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GamePhase, GameLength, PlayerState, CharacterProfile, ActionSlot, AssetClass, JobOffer } from '../types/game';
import type { GameEvent } from '../types/events';
import type { LifestyleSelection } from '../types/lifestyle';
import { generateRandomEvent } from '../lib/eventEngine';
import { generateMonthlyMatrix } from '../lib/historicalData';
import {
  updateMaxSavings,
  updatePeakNetWorth,
  settleLifestyle,
  applyWorkAction,
  applyRestAction,
  applyInvestAction,
  resolveEvent,
  settleYearEnd,
  simulateSkippedYear,
} from '../lib/yearEngine';

// ── Asset entry tracking (for future ROI calculation) ───────────────────────

interface AssetEntry {
  amountInvested: number;
  entryYear: number;
}

// ── Store shape ─────────────────────────────────────────────────────────────

interface GameStore {
  phase: GamePhase;
  startYear: number;
  currentYear: number;
  gameLength: GameLength;

  player: PlayerState;
  actions: ActionSlot[];
  currentActionIndex: number;
  globalActionCount: number;

  currentLifestyle: LifestyleSelection | null;
  previousLifestyle: LifestyleSelection | null;

  activeEvent: GameEvent | null;
  assetEntries: Partial<Record<AssetClass, AssetEntry[]>>;
  marketHistory: Partial<Record<AssetClass, number[]>>;

  allTimePeakNetWorth: number;

  setPhase: (phase: GamePhase) => void;
  setupGame: (startYear: number, length: GameLength) => void;
  selectProfile: (profile: CharacterProfile) => void;

  confirmLifestyleSelection: (selection: LifestyleSelection) => void;

  _postActionCheck: () => void;

  executeWorkAction: (index: number) => void;
  executeRestAction: (index: number) => void;
  executeInvestAction: (asset: AssetClass, isBuy: boolean, amount: number) => void;
  executeCareerJobChange: (index: number, offer: JobOffer) => void;
  executeStudyAction: (index: number) => void;

  enrollGradSchool: (tuitionCost: number, requiredActions: number) => void;
  dropoutGradSchool: () => void;

  resolveActiveEvent: () => void;

  repayDebt: (amount: number, type: 'studentLoan' | 'creditCard') => void;
  skipYear: () => void;

  advanceYear: () => void;
  resetGame: () => void;
}

// ── Initial state ───────────────────────────────────────────────────────────

const initialPlayerState: PlayerState = {
  cash: 0, salary: 0, health: 70, reputation: 50, happiness: 50,
  maxSavings: 0, peakNetWorth: 0,
  stableExperience: 0, workActionsThisYear: 0, changedJobsThisYear: false, skippedActionsCount: 0,
  lockedLifestyle: {}, activeBuffs: [],
  assets: { savingsAccount: 0, bonds: 0, stocks: 0, options: 0, crypto: 0, gold: 0, retirement: 0, property: 0, vehicle: 0 },
  assetCooldowns: { savingsAccount: 0, bonds: 0, stocks: 0, options: 0, crypto: 0, gold: 0, retirement: 0, property: 0, vehicle: 0 },
  liabilities: { studentLoan: 0, creditCard: 0, mortgage: 0, vehicleLoan: 0 },
  expenses: { housing: 0, food: 0, clothing: 0, transport: 0 },
  education: { isActive: false, actionsCompleted: 0, actionsRequired: 0, totalTuitionPaid: 0, hasDegree: false },
  profile: null,
};

const defaultActions = (): ActionSlot[] =>
  Array.from({ length: 6 }, (_, i) => ({ id: `action-${i}`, type: null, confirmed: false }));

// ── localStorage persistence for cross-game peak ────────────────────────────

const ALL_TIME_PEAK_KEY = 'life-after-grad:allTimePeakNetWorth';

const readAllTimePeak = (): number => {
  try {
    const raw = localStorage.getItem(ALL_TIME_PEAK_KEY);
    return raw ? (parseFloat(raw) || 0) : 0;
  } catch { return 0; }
};

const writeAllTimePeak = (value: number): void => {
  try { localStorage.setItem(ALL_TIME_PEAK_KEY, String(value)); }
  catch { /* quota exceeded — ignore */ }
};

/**
 * Syncs the allTimePeakNetWorth watermark and persists to localStorage.
 * Immer-safe: mutates draft directly.
 */
const syncPeaks = (draft: GameStore): void => {
  updateMaxSavings(draft.player);
  const newPeak = updatePeakNetWorth(draft.player, draft.allTimePeakNetWorth);
  if (newPeak !== draft.allTimePeakNetWorth) {
    draft.allTimePeakNetWorth = newPeak;
    writeAllTimePeak(newPeak);
  }
};

// ── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    phase: 'SETUP',
    startYear: 2026, currentYear: 2026, gameLength: 10,
    currentActionIndex: 0, globalActionCount: 0,
    currentLifestyle: null, previousLifestyle: null,
    activeEvent: null,
    assetEntries: {}, marketHistory: {},
    allTimePeakNetWorth: readAllTimePeak(),
    player: { ...initialPlayerState },
    actions: defaultActions(),

    // ── Phase control ─────────────────────────────────────────────────────

    setPhase: (phase) => set((d) => { d.phase = phase; }),

    setupGame: (startYear, length) => set((d) => {
      d.startYear = startYear;
      d.currentYear = startYear;
      d.gameLength = length;
      d.phase = 'SETUP';
      d.player = { ...initialPlayerState };
      d.actions = defaultActions();
      d.currentActionIndex = 0;
      d.globalActionCount = 0;
      d.currentLifestyle = null;
      d.previousLifestyle = null;
      d.activeEvent = null;
      d.assetEntries = {};
      d.marketHistory = generateMonthlyMatrix(startYear, []);
    }),

    selectProfile: (profile) => set((d) => {
      d.player.cash = profile.savings;
      d.player.salary = profile.salary;
      d.player.profile = profile;
      d.player.liabilities.studentLoan = profile.debt;
      d.phase = 'LIFESTYLE';
      syncPeaks(d);
    }),

    // ── Lifestyle ─────────────────────────────────────────────────────────

    confirmLifestyleSelection: (selection) => set((d) => {
      const { finalSelection } = settleLifestyle(
        d.player, selection, d.previousLifestyle, d.startYear, d.currentYear,
      );
      d.currentLifestyle = finalSelection;
      d.phase = 'ACTION';
    }),

    // ── Post-action orchestration ─────────────────────────────────────────

    _postActionCheck: () => set((d) => {
      d.player.activeBuffs = d.player.activeBuffs.filter(
        b => b.expiresAtAction > d.globalActionCount,
      );

      const allConfirmed = d.actions.every(a => a.confirmed);

      // Roll for event
      if (Math.random() < 0.25) {
        d.activeEvent = generateRandomEvent(d.currentYear);
        d.phase = 'EVENT';
        return;
      }

      if (allConfirmed) {
        d.phase = 'SUMMARY';
        return;
      }

      // Auto-skip if debuff is active
      while (d.player.skippedActionsCount > 0 && !d.actions.every(a => a.confirmed)) {
        const idx = d.currentActionIndex;
        d.actions[idx].type = null;
        d.actions[idx].confirmed = true;
        d.player.skippedActionsCount -= 1;
        d.globalActionCount += 1;
        if (idx < 5) d.currentActionIndex = idx + 1;
      }

      if (d.actions.every(a => a.confirmed)) {
        d.phase = 'SUMMARY';
      }
    }),

    // ── Actions ───────────────────────────────────────────────────────────

    executeWorkAction: (index) => {
      set((d) => {
        applyWorkAction(d.player);
        d.actions[index].type = 'WORK';
        d.actions[index].confirmed = true;
        d.globalActionCount += 1;
        if (index < 5) d.currentActionIndex = index + 1;
        d.marketHistory = generateMonthlyMatrix(d.currentYear, d.player.activeBuffs);
        syncPeaks(d);
      });
      get()._postActionCheck();
    },

    executeRestAction: (index) => {
      set((d) => {
        applyRestAction(d.player);
        d.actions[index].type = 'REST';
        d.actions[index].confirmed = true;
        d.globalActionCount += 1;
        if (index < 5) d.currentActionIndex = index + 1;
        d.marketHistory = generateMonthlyMatrix(d.currentYear, d.player.activeBuffs);
        syncPeaks(d);
      });
      get()._postActionCheck();
    },

    /**
     * Investing is a FREE action — no action slot consumed.
     * Market sparklines refresh after every transaction to simulate live prices.
     */
    executeInvestAction: (asset, isBuy, amount) => {
      set((d) => {
        applyInvestAction(d.player, asset, isBuy, amount, d.globalActionCount);
        if (isBuy) {
          if (!d.assetEntries[asset]) d.assetEntries[asset] = [];
          d.assetEntries[asset]!.push({ amountInvested: amount, entryYear: d.currentYear });
        }
        d.marketHistory = generateMonthlyMatrix(d.currentYear, d.player.activeBuffs);
        syncPeaks(d);
      });
    },

    executeCareerJobChange: (index, offer) => {
      set((d) => {
        d.player.salary = offer.salary;
        d.player.changedJobsThisYear = true;
        d.actions[index].type = 'CAREER';
        d.actions[index].confirmed = true;
        d.globalActionCount += 1;
        if (index < 5) d.currentActionIndex = index + 1;
        d.marketHistory = generateMonthlyMatrix(d.currentYear, d.player.activeBuffs);
      });
      get()._postActionCheck();
    },

    executeStudyAction: (index) => {
      set((d) => {
        if (d.player.education.isActive) {
          d.player.education.actionsCompleted += 1;
          if (d.player.education.actionsCompleted >= d.player.education.actionsRequired) {
            d.player.education.isActive = false;
            d.player.education.hasDegree = true;
            d.player.salary = Math.round(d.player.salary * 1.4);
            d.player.reputation = Math.min(100, d.player.reputation + 15);
          }
        }
        d.actions[index].type = 'STUDY';
        d.actions[index].confirmed = true;
        d.globalActionCount += 1;
        if (index < 5) d.currentActionIndex = index + 1;
        d.marketHistory = generateMonthlyMatrix(d.currentYear, d.player.activeBuffs);
      });
      get()._postActionCheck();
    },

    enrollGradSchool: (tuitionCost, requiredActions) => set((d) => {
      d.player.cash -= tuitionCost;
      if (d.player.cash < 0) {
        d.player.liabilities.studentLoan += Math.abs(d.player.cash);
        d.player.cash = 0;
      }
      d.player.education.isActive = true;
      d.player.education.actionsCompleted = 0;
      d.player.education.actionsRequired = requiredActions;
      d.player.education.totalTuitionPaid = tuitionCost;
    }),

    dropoutGradSchool: () => set((d) => {
      d.player.education.isActive = false;
      d.player.education.actionsCompleted = 0;
      d.player.education.actionsRequired = 0;
      d.player.education.totalTuitionPaid = 0;
    }),

    // ── Event resolution ──────────────────────────────────────────────────

    resolveActiveEvent: () => {
      set((d) => {
        const event = d.activeEvent;
        if (!event) return;

        resolveEvent(d.player, event, d.globalActionCount);
        d.activeEvent = null;
        syncPeaks(d);

        const allConfirmed = d.actions.every(a => a.confirmed);
        d.phase = allConfirmed ? 'SUMMARY' : 'ACTION';

        // Auto-skip if debuff was applied
        if (!allConfirmed && d.player.skippedActionsCount > 0) {
          const idx = d.currentActionIndex;
          d.actions[idx].type = null;
          d.actions[idx].confirmed = true;
          d.player.skippedActionsCount -= 1;
          if (idx < 5) d.currentActionIndex = idx + 1;

          if (d.actions.every(a => a.confirmed)) {
            d.phase = 'SUMMARY';
          }
        }
      });
    },

    // ── Debt repayment ────────────────────────────────────────────────────

    repayDebt: (amount, type) => set((d) => {
      const maxRepay = Math.min(amount, d.player.cash, d.player.liabilities[type]);
      if (maxRepay > 0) {
        d.player.cash -= maxRepay;
        d.player.liabilities[type] -= maxRepay;
      }
    }),

    // ── Skip year ─────────────────────────────────────────────────────────

    skipYear: () => {
      set((d) => {
        simulateSkippedYear(d.player, d.currentYear, generateRandomEvent);
        syncPeaks(d);
      });
      get().advanceYear();
    },

    // ── Year advancement ──────────────────────────────────────────────────

    advanceYear: () => set((d) => {
      const { marketHistory } = settleYearEnd(d.player, d.currentYear);
      syncPeaks(d);

      const nextYear = d.currentYear + 1;
      const isEnd = nextYear >= d.startYear + d.gameLength;

      d.currentYear = nextYear;
      d.phase = isEnd ? 'END' : 'LIFESTYLE';
      d.actions = defaultActions();
      d.currentActionIndex = 0;
      d.previousLifestyle = d.currentLifestyle;
      d.currentLifestyle = null;
      d.marketHistory = marketHistory;
    }),

    // ── Reset ─────────────────────────────────────────────────────────────

    resetGame: () => set((d) => {
      d.phase = 'SETUP';
      d.player = { ...initialPlayerState };
      d.actions = defaultActions();
      d.currentActionIndex = 0;
      d.globalActionCount = 0;
      d.currentLifestyle = null;
      d.previousLifestyle = null;
      d.activeEvent = null;
      d.assetEntries = {};
      d.marketHistory = {};
    }),
  })),
);
