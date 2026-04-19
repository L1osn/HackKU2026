import type { AssetClass } from './game';

export type EventSeverity = 'NORMAL_POSITIVE' | 'NORMAL_NEGATIVE' | 'BLACK_SWAN' | 'WINDFALL';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  cashEffect: number;
  reputationEffect: number;
  healthEffect: number;
  happinessEffect: number;

  assetMultipliers?: Partial<Record<AssetClass, number>>;
  skipActions?: number;
  lockLifestyle?: { category: 'housing' | 'food' | 'transport' | 'clothing', tierId: string };
  volatilityMultiplier?: { asset: AssetClass, multiplier: number, durationActions: number };
  salaryMultiplier?: number;

  eraConstraint?: {
    startYear: number;
    endYear: number;
  };
}
