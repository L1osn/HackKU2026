export type GamePhase = 'SETUP' | 'LIFESTYLE' | 'ACTION' | 'EVENT' | 'SUMMARY' | 'END';

export type GameLength = 5 | 10 | 15 | 20;

export interface CharacterProfile {
  id: string;
  name: string;
  background: string;
  degree: string;
  salary: number;
  savings: number;
  debt: number; // student loans
  difficulty: 'Easy' | 'Hard';
}

export type AssetClass = 'savingsAccount' | 'bonds' | 'stocks' | 'options' | 'crypto' | 'gold' | 'retirement' | 'property' | 'vehicle';

export interface JobOffer {
  id: string;
  companyName: string;
  jobTitle: string;
  salary: number;
  description: string;
  sectorIcon: string;
  tier: 'ENTRY' | 'MID' | 'SENIOR' | 'ELITE';
  isQualified: boolean;
  requirementText?: string;
}

export interface EducationState {
  isActive: boolean;
  actionsCompleted: number;
  actionsRequired: number;
  totalTuitionPaid: number;
  hasDegree: boolean;
}

export interface ActiveBuff {
  type: 'volatility';
  asset: AssetClass;
  multiplier: number;
  expiresAtAction: number;
}

export interface PlayerState {
  cash: number;
  salary: number;
  health: number; // 0-100 (Hidden numerical, qualitative label displayed)
  reputation: number; // 0-100 (Hidden numerical, qualitative label displayed)
  happiness: number; // 0-100 (Completely hidden)
  
  /** Historical peak savings (cash + savingsAccount). Updated in real-time. */
  maxSavings: number;

  /** Historical peak net worth (total assets − total liabilities). Updated in real-time. */
  peakNetWorth: number;
  
  // Work Experience
  stableExperience: number; // in years
  workActionsThisYear: number;
  changedJobsThisYear: boolean;
  skippedActionsCount: number; // From debuffs
  
  // Balances
  assets: Record<AssetClass, number>;
  
  // Sell Cooldowns (unlocks at globalActionCount >= X)
  assetCooldowns: Record<AssetClass, number>;
  
  liabilities: {
    studentLoan: number;
    creditCard: number;
    mortgage: number;
    vehicleLoan: number;
  };
  
  // Monthly Expenses (set in Lifestyle phase)
  expenses: {
    housing: number;
    food: number;
    clothing: number; // monthly equivalent
    transport: number;
  };
  
  lockedLifestyle: Partial<Record<'housing' | 'food' | 'transport' | 'clothing', string>>;
  activeBuffs: ActiveBuff[];
  
  // Career & Education
  education: EducationState;
  
  // Selected Profile
  profile: CharacterProfile | null;
}

export type ActionType = 'WORK' | 'INVEST' | 'CAREER' | 'STUDY' | 'REST';

/** Minimum buy amounts for illiquid asset classes. */
export const ASSET_MIN_BUY: Partial<Record<AssetClass, number>> = {
  property: 20_000,
  vehicle: 5_000,
};

export interface ActionSlot {
  id: string;
  type: ActionType | null;
  confirmed: boolean;
  // payload could be stored here but we will just mutate the store state directly upon confirm.
}

import type { GameEvent } from './events';

export interface GameState {
  phase: GamePhase;
  startYear: number;
  currentYear: number;
  gameLength: GameLength;
  
  player: PlayerState;
  
  actions: ActionSlot[];
  currentActionIndex: number;
  
  eventQueue: GameEvent[];
  activeEvent: GameEvent | null;
}
