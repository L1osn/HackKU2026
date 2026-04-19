/**
 * Headless 10-year regression test for Life After Grad.
 *
 * Runs a full game loop without React/Vite, injecting mock live events to
 * validate that extreme multipliers do not collapse or explode the economy.
 *
 * Usage:
 *   npx tsx scripts/simulate.ts
 *   npx tsx scripts/simulate.ts --bullish    # all live events use 1.5× multiplier
 *   npx tsx scripts/simulate.ts --bearish    # all live events use 0.5× multiplier
 */

// ── Types (inlined to avoid import.meta.env issues from liveApiService) ─────

type AssetClass = 'savingsAccount' | 'bonds' | 'stocks' | 'options' | 'crypto' | 'gold' | 'retirement' | 'property' | 'vehicle';

interface PlayerState {
  cash: number;
  salary: number;
  health: number;
  reputation: number;
  happiness: number;
  maxSavings: number;
  peakNetWorth: number;
  stableExperience: number;
  workActionsThisYear: number;
  changedJobsThisYear: boolean;
  skippedActionsCount: number;
  assets: Record<AssetClass, number>;
  assetCooldowns: Record<AssetClass, number>;
  liabilities: { studentLoan: number; creditCard: number; mortgage: number; vehicleLoan: number };
  expenses: { housing: number; food: number; clothing: number; transport: number };
  lockedLifestyle: Record<string, string>;
  activeBuffs: Array<{ type: 'volatility'; asset: AssetClass; multiplier: number; expiresAtAction: number }>;
  education: { isActive: boolean; actionsCompleted: number; actionsRequired: number; totalTuitionPaid: number; hasDegree: boolean };
  profile: null;
}

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  impactType: 'INCOME' | 'EXPENSE' | 'MARKET';
  multiplier: number;
  validYear: number;
}

// ── CLI flag parsing ────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isBullish = args.includes('--bullish');
const isBearish = args.includes('--bearish');

const scenarioLabel = isBullish ? 'BULLISH (1.5×)' : isBearish ? 'BEARISH (0.5×)' : 'NEUTRAL (mixed)';
const scenarioMultiplier = isBullish ? 1.5 : isBearish ? 0.5 : 1.0;

// ── Mock live events ────────────────────────────────────────────────────────

function buildMockLiveEvents(startYear: number, years: number): LiveEvent[] {
  const events: LiveEvent[] = [];
  for (let y = 0; y < years; y++) {
    const year = startYear + y;
    const mult = scenarioMultiplier === 1.0
      ? (y % 2 === 0 ? 1.15 : 0.85)
      : scenarioMultiplier;

    const type: LiveEvent['impactType'] =
      y % 3 === 0 ? 'INCOME' : y % 3 === 1 ? 'MARKET' : 'EXPENSE';

    events.push({
      id: `mock-live-${year}`,
      title: `Mock ${type} Event (${year})`,
      description: `Simulated ${type.toLowerCase()} shock for regression testing.`,
      impactType: type,
      multiplier: mult,
      validYear: year,
    });
  }
  return events;
}

// ── Minimal engine reimplementation (no Vite dependencies) ──────────────────

function createPlayer(): PlayerState {
  const zeroAssets = {
    savingsAccount: 0, bonds: 0, stocks: 0, options: 0,
    crypto: 0, gold: 0, retirement: 0, property: 0, vehicle: 0,
  } as Record<AssetClass, number>;

  return {
    cash: 5000, salary: 55000, health: 70, reputation: 50, happiness: 50,
    maxSavings: 5000, peakNetWorth: 5000,
    stableExperience: 0, workActionsThisYear: 0,
    changedJobsThisYear: false, skippedActionsCount: 0,
    assets: { ...zeroAssets }, assetCooldowns: { ...zeroAssets },
    liabilities: { studentLoan: 30000, creditCard: 0, mortgage: 0, vehicleLoan: 0 },
    expenses: { housing: 1200, food: 400, clothing: 100, transport: 300 },
    lockedLifestyle: {}, activeBuffs: [],
    education: { isActive: false, actionsCompleted: 0, actionsRequired: 0, totalTuitionPaid: 0, hasDegree: false },
    profile: null,
  };
}

function clamp(val: number, min: number, max: number) { return Math.max(min, Math.min(max, val)); }

function applyLiveEvent(player: PlayerState, le: LiveEvent): void {
  const mult = clamp(le.multiplier, 0.5, 1.5);

  switch (le.impactType) {
    case 'INCOME':
      player.salary = Math.round(player.salary * mult);
      break;
    case 'EXPENSE':
      player.cash += Math.round((mult - 1) * 10_000);
      if (player.cash < 0) {
        player.liabilities.creditCard += Math.abs(player.cash);
        player.cash = 0;
      }
      break;
    case 'MARKET':
      player.assets.stocks = Math.round(player.assets.stocks * mult);
      player.assets.crypto = Math.round(player.assets.crypto * mult);
      player.assets.options = Math.round(player.assets.options * mult);
      break;
  }
}

function simulateYear(player: PlayerState): void {
  for (let action = 0; action < 6; action++) {
    player.cash += Math.round(player.salary / 6);
    player.health = Math.max(0, player.health - 7);
    player.workActionsThisYear += 1;
  }

  const annualExpense = Object.values(player.expenses).reduce((a, b) => a + b, 0) * 12;
  player.cash -= annualExpense;
  if (player.cash < 0) {
    player.liabilities.creditCard += Math.abs(player.cash);
    player.cash = 0;
  }

  player.liabilities.studentLoan = Math.round(player.liabilities.studentLoan * 1.10);
  if (player.liabilities.creditCard > 0) {
    player.liabilities.creditCard = Math.round(player.liabilities.creditCard * 1.22);
  }

  if (player.workActionsThisYear >= 4 && !player.changedJobsThisYear) {
    player.stableExperience += 1;
    player.salary = Math.round(player.salary * 1.07);
  }
  player.workActionsThisYear = 0;

  // Rough asset growth (3–5% drift on non-vehicle)
  const drift = 1.03 + Math.random() * 0.02;
  for (const key of Object.keys(player.assets) as AssetClass[]) {
    if (player.assets[key] > 0 && key !== 'vehicle') {
      player.assets[key] = Math.round(player.assets[key] * drift);
    }
  }
}

function netWorth(p: PlayerState): number {
  const totalAssets = p.cash + Object.values(p.assets).reduce((a, b) => a + b, 0);
  const totalDebt = Object.values(p.liabilities).reduce((a, b) => a + b, 0);
  return totalAssets - totalDebt;
}

// ── Ending classifier (mirrors endingEngine.ts) ────────────────────────────

function classifyEnding(p: PlayerState): string {
  const nw = netWorth(p);
  const isRich = nw > 500_000;
  const isComfortable = nw > 100_000 && nw <= 500_000;
  const isBroke = nw < 0;
  const isHappy = p.happiness >= 60;
  const isHealthy = p.health >= 60;

  if (isRich && isHappy && isHealthy) return 'The American Dream';
  if (isRich) return 'The Wolf of Wall Street';
  if (isComfortable && isHappy) return 'The Quiet Life';
  if (isComfortable) return 'The Corporate Burnout';
  if (isBroke && isHappy) return 'The Enlightened Minimalist';
  if (isBroke) return 'The Debt Spiral';
  return 'The Average Experience';
}

// ── Main ────────────────────────────────────────────────────────────────────

function run() {
  const START_YEAR = 2026;
  const GAME_LENGTH = 10;

  console.log('='.repeat(64));
  console.log(`  LIFE AFTER GRAD — Headless Regression Simulation`);
  console.log(`  Scenario: ${scenarioLabel}`);
  console.log(`  Period:   ${START_YEAR} – ${START_YEAR + GAME_LENGTH - 1}`);
  console.log('='.repeat(64));

  const player = createPlayer();
  const liveEvents = buildMockLiveEvents(START_YEAR, GAME_LENGTH);

  // Invest a baseline amount so MARKET events have something to affect
  player.assets.stocks = 5000;
  player.assets.crypto = 2000;
  player.cash -= 7000;

  for (let y = 0; y < GAME_LENGTH; y++) {
    const year = START_YEAR + y;
    const yearLiveEvent = liveEvents.find(e => e.validYear === year);

    // Apply live event at year start (before action phase)
    if (yearLiveEvent) {
      applyLiveEvent(player, yearLiveEvent);
      console.log(`\n  [Year ${year}] LIVE EVENT: ${yearLiveEvent.title} (${yearLiveEvent.impactType} ×${yearLiveEvent.multiplier})`);
    }

    simulateYear(player);

    const nw = netWorth(player);
    const bar = nw >= 0
      ? '█'.repeat(Math.min(40, Math.floor(nw / 10_000)))
      : '░'.repeat(Math.min(40, Math.floor(Math.abs(nw) / 10_000)));

    console.log(
      `  [Year ${year}]  Cash: $${player.cash.toLocaleString().padStart(9)}` +
      `  Salary: $${player.salary.toLocaleString().padStart(8)}` +
      `  Debt: $${(player.liabilities.studentLoan + player.liabilities.creditCard).toLocaleString().padStart(8)}` +
      `  NW: $${nw.toLocaleString().padStart(9)}  ${bar}`
    );
  }

  const finalNW = netWorth(player);
  const ending = classifyEnding(player);

  console.log('\n' + '='.repeat(64));
  console.log(`  FINAL NET WORTH:  $${finalNW.toLocaleString()}`);
  console.log(`  ENDING:           ${ending}`);
  console.log(`  Health: ${player.health}  Happiness: ${player.happiness}  Rep: ${player.reputation}`);
  console.log('='.repeat(64));

  // Sanity assertions
  const SANE_MIN = -500_000;
  const SANE_MAX = 5_000_000;
  if (finalNW < SANE_MIN || finalNW > SANE_MAX) {
    console.error(`\n  ❌ REGRESSION FAILURE: Net worth $${finalNW.toLocaleString()} is outside sane bounds [${SANE_MIN.toLocaleString()}, ${SANE_MAX.toLocaleString()}]`);
    process.exit(1);
  }

  console.log(`\n  ✅ Regression passed. Net worth within sane bounds.`);
}

run();
