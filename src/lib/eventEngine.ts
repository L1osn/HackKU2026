import type { GameEvent } from '../types/events';

// ── Static event pools ──────────────────────────────────────────────────────

export const genericEvents: Omit<GameEvent, 'id'>[] = [
  {
    title: 'Severe Burnout',
    description: 'You pushed yourself too hard. You are forced to take a mental health break, losing your next action and a month of income.',
    severity: 'BLACK_SWAN',
    cashEffect: 0,
    reputationEffect: -5,
    healthEffect: -20,
    happinessEffect: -20,
    skipActions: 1,
  },
  {
    title: 'Major Vehicle Overhaul',
    description: 'Your car broke down spectacularly. You are forced to rely on expensive alternative transport for the rest of the year.',
    severity: 'NORMAL_NEGATIVE',
    cashEffect: -500,
    reputationEffect: 0,
    healthEffect: -5,
    happinessEffect: -10,
    lockLifestyle: { category: 'transport', tierId: 'transport_4' },
  },
  {
    title: 'Industry Trend: Crypto Boom',
    description: 'Cryptocurrency volatility has doubled. Buckle up for the next few actions.',
    severity: 'NORMAL_POSITIVE',
    cashEffect: 0,
    reputationEffect: 0,
    healthEffect: 0,
    happinessEffect: 5,
    volatilityMultiplier: { asset: 'crypto', multiplier: 2.0, durationActions: 3 },
  },
  {
    title: 'Core Project Gone Wrong',
    description: 'A major project you led failed. Your bonus structure was slashed, permanently reducing your salary by 10%.',
    severity: 'NORMAL_NEGATIVE',
    cashEffect: 0,
    reputationEffect: -10,
    healthEffect: -5,
    happinessEffect: -15,
    salaryMultiplier: 0.9,
  },
  {
    title: 'Seizing a Key Opportunity',
    description: 'You stepped up when the company needed it most. You earned a permanent 15% salary increase.',
    severity: 'WINDFALL',
    cashEffect: 0,
    reputationEffect: 15,
    healthEffect: -5,
    happinessEffect: 15,
    salaryMultiplier: 1.15,
  },
  {
    title: 'Surprise Medical Bill',
    description: 'You visited an out-of-network specialist. Insurance denied the claim.',
    severity: 'NORMAL_NEGATIVE',
    cashEffect: -800,
    reputationEffect: 0,
    healthEffect: -5,
    happinessEffect: -3,
  },
  {
    title: 'Networking Opportunity',
    description: 'You met someone influential at a dinner party. They gave you their card.',
    severity: 'NORMAL_POSITIVE',
    cashEffect: -100,
    reputationEffect: 8,
    healthEffect: 0,
    happinessEffect: 2,
  }
];

export const historicalEvents: Omit<GameEvent, 'id'>[] = [
  {
    title: 'Inflation Shock & Crypto Crash',
    description: 'The Federal Reserve aggressively hiked interest rates. Speculative assets are in freefall.',
    severity: 'BLACK_SWAN',
    cashEffect: 0,
    reputationEffect: 0,
    healthEffect: -5,
    happinessEffect: -10,
    assetMultipliers: { crypto: 0.23, bonds: 0.87, stocks: 0.8 },
    eraConstraint: { startYear: 2022, endYear: 2022 }
  }
];

// ── Sync path (unchanged, used by skipYear and as inline fallback) ───────────

export const generateRandomEvent = (currentYear: number): GameEvent => {
  const validHistorical = historicalEvents.filter(e =>
    !e.eraConstraint || (currentYear >= e.eraConstraint.startYear && currentYear <= e.eraConstraint.endYear)
  );
  const combinedPool = [...genericEvents, ...validHistorical];
  const shuffled = combinedPool.sort(() => Math.random() - 0.5);
  return { ...shuffled[0], id: crypto.randomUUID() };
};

