export type LifestyleCategory = 'housing' | 'food' | 'clothing' | 'transport';

export interface LifestyleTier {
  id: string;
  tier: number;
  category: LifestyleCategory;
  name: string;
  monthlyCostBase: number; // Base cost before inflation scaling
  description: string;
  healthEffect: number; // Annual change
  reputationEffect: number; // One-time or persistent adjustment
  happinessEffect: number; // Annual change
  inflationTrapRisk?: boolean;
}

export type LifestyleSelection = Record<LifestyleCategory, LifestyleTier | null>;

export type AffordabilityState = 'COMFORTABLE' | 'STRETCHING' | 'OVEREXTENDED';
