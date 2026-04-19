# life-after-grad

[![Standard Readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![React](https://img.shields.io/badge/react-19-61dafb.svg?style=flat-square)](https://react.dev)
[![Vite](https://img.shields.io/badge/vite-8-646cff.svg?style=flat-square)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/typescript-6-3178c6.svg?style=flat-square)](https://www.typescriptlang.org)

A browser-based financial life simulator that lets recent graduates live up to two decades of money decisions in a single sitting.

Life After Grad puts the player in the shoes of a newly minted college graduate and asks them to navigate 5–20 years of annual decisions: where to live, what to eat, how to earn, what to invest in, and what to do when life throws an event they didn't plan for. The simulation is anchored in real historical market data from 1920 to 2036, so the era shapes the inflation, crashes, and booms a player will actually face. Inspired by [Spent](https://playspent.org/), the goal is to make abstract financial concepts — compound interest, opportunity cost, the cost of being under-insured — feel personal and consequential rather than theoretical.

The product requirements that drive this implementation live alongside this repository in [`../PRD/`](../PRD/); the current source of truth is `PRD_v11.md`.

## Table of Contents

- [Background](#background)
- [Key Features](#key-features)
- [Install](#install)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Gameplay Loop](#gameplay-loop)
- [Core Systems](#core-systems)
- [Contributing](#contributing)
- [License](#license)

## Background

College graduates in the United States leave school with an average of roughly $30,000 in student debt and very little formal financial education. Traditional tools — budgeting apps, retirement calculators, lecture-style literacy courses — fail to engage this audience because they are abstract and impersonal. The missing ingredient is emotional stakes.

Life After Grad compresses years of financial cause and effect into a single session. Players feel the weight of a missed 401(k) match, the panic of a medical bill without savings, and the slow accumulation of compound interest. Every decision has an immediate, visible financial consequence displayed in plain language. The player never stares at a portfolio dashboard; they make discrete, time-limited choices and live with the results.

## Key Features

- **Four timeline modes** — 5, 10, 15, or 20-year (Legacy Mode) playthroughs, each with balanced scoring to keep competition fair across durations.
- **Two difficulty tracks** — Easy (high-demand STEM/healthcare fields, $58k–$105k salary) and Hard (passion-economy degrees, $40k–$66k salary), each generating three unique graduate profiles.
- **Free-form investing** — investment operations consume zero action points; players can open the portfolio panel and trade unlimited times per year as long as cash permits.
- **Rest mechanic** — a dedicated Rest action that costs one action slot but recovers +20 health, the primary way to climb back from Poor health status.
- **Health survival pressure** — when health drops below the critical threshold, work income is halved, forcing a brutal trade-off between earning and recovering.
- **Nine asset classes** — savings accounts, bonds, stocks, options, crypto, gold, retirement funds, property, and vehicles — each with distinct risk curves, sell cooldowns, and minimum buy thresholds.
- **Physical asset entry barriers** — property requires a minimum $20,000 buy-in; vehicles require $5,000. Buttons grey out when cash is insufficient.
- **Real-time sparkline charts** — 1Y, 3Y, and 10Y market views with monthly granularity and negative-correlation modeling (stocks vs. gold/bonds).
- **Era-aware event engine** — random life events drawn from both a generic pool and a historical pool constrained to specific year ranges.
- **Dual debt system** — student loans at 10% APR and credit cards at 22% APR, with interactive repayment widgets and confirmation guards.
- **Inflation simulation** — era-specific inflation rates from 1920 to 2026+, with cumulative purchasing-power erosion visible on the HUD.
- **Knowledge Hub** — a floating educational overlay that surfaces investment fact cards the first time a player interacts with each asset class.
- **Eight narrative endings** — from "The American Dream" to "The Debt Spiral," determined by a composite of real net worth, health, happiness, and reputation.

## Install

Requires [Node.js](https://nodejs.org) 20 or newer and npm.

```sh
git clone <repository-url>
cd life-after-grad
npm install
```

## Usage

Start the dev server with hot module reloading:

```sh
npm run dev
```

Build a production bundle to `dist/`:

```sh
npm run build
```

Preview the production build locally:

```sh
npm run preview
```

Lint the project:

```sh
npm run lint
```

### Headless simulation

A headless harness under `scripts/simulate.ts` runs a full playthrough against the game engines without the UI. It is useful for balance tuning and regression testing the finance, event, and ending engines.

```sh
npx tsx scripts/simulate.ts
```

## Project Structure

```
life-after-grad/
├── index.html                  Vite entry point
├── src/
│   ├── App.tsx                 Phase router (SETUP → LIFESTYLE → ACTION → EVENT → SUMMARY → END)
│   ├── main.tsx                React root
│   ├── index.css               Global styles + Tailwind layers
│   ├── components/
│   │   ├── HUD.tsx             Sticky stats bar (year, actions, net worth, health, inflation)
│   │   ├── InvestModal.tsx     Buy/sell modal with cooldown + minimum-buy enforcement
│   │   ├── KnowledgeHub.tsx    Educational fact cards indexed by asset class
│   │   ├── Sparkline.tsx       Mini SVG charts for the portfolio market panel
│   │   ├── TypewriterText.tsx  Cinematic intro typing effect
│   │   └── views/
│   │       ├── SetupView.tsx       Intro, difficulty, timeline length, profile selection
│   │       ├── LifestyleView.tsx   Yearly lifestyle tier choices (cost ↔ stat effects)
│   │       ├── ActionView.tsx      6 action slots + portfolio market + debt repayment
│   │       ├── EventView.tsx       Random event resolution UI
│   │       ├── SummaryView.tsx     Year-end narrative + advance year
│   │       └── EndView.tsx         Ending screen with real vs. nominal net worth
│   ├── lib/                    Pure engines — zero React dependency, fully testable headlessly
│   │   ├── yearEngine.ts          Lifestyle settlement, action effects, event resolution, year-end
│   │   ├── eventEngine.ts         Generic + historical event pools, generateRandomEvent
│   │   ├── financeEngine.ts       Inflation, nominal costs, debt interest, affordability checks
│   │   ├── historicalData.ts      Asset curves 1920–2036, monthly market matrix, sparkline data
│   │   ├── careerEngine.ts        Procedural job offers with tier gates
│   │   ├── characterGenerator.ts  Easy/Hard graduate profiles (salary, debt, savings)
│   │   ├── endingEngine.ts        Composite ending titles from NW + health/happiness/rep
│   │   ├── summaryTextEngine.ts   Year-end flavor text generation
│   │   └── lifestyleData.ts       Housing/food/clothing/transport tier definitions
│   ├── store/
│   │   └── gameStore.ts        Zustand + Immer store holding the full player and game state
│   └── types/
│       ├── game.ts             Phases, lengths, PlayerState, AssetClass, action types, min buys
│       ├── events.ts           GameEvent shape (cash/health/rep/happiness effects, buffs)
│       └── lifestyle.ts        Lifestyle tiers + selection types
├── scripts/simulate.ts         Headless end-to-end simulation harness
└── public/                     Static assets (favicon)
```

The `lib/` engines are intentionally decoupled from React so they can be exercised by the headless simulator and unit tested without a DOM.

## Gameplay Loop

Each game year proceeds through a fixed sequence of phases, rendered by [`App.tsx`](src/App.tsx):

1. **Setup** — the player picks a timeline (5 / 10 / 15 / 20 years), a difficulty track (Easy or Hard), and one of three randomly generated graduate profiles. A cinematic typewriter intro sets the stage before any choices are made.
2. **Lifestyle** — the player chooses tiers for housing, food, clothing, and transportation. Each tier trades monthly cost against secondary effects on health, reputation, and happiness. Downgrading from a previous year's tier incurs a one-time penalty.
3. **Action** — the player fills six action slots per year from four slot-consuming actions (Work, Career, Education, Rest). Investing is free and can be done unlimited times alongside other actions via the Portfolio Market panel.
4. **Event** — after each action there is a 25% chance of a random life event firing, drawn from the era-appropriate pool. Events can alter cash, stats, salary, asset values, market volatility, or force action skips.
5. **Summary** — a plain-language recap of the year's net worth movement, followed by year-end settlement (stable experience, lifestyle expenses, debt interest, market returns).
6. **End** — the ending engine scores the player across four dimensions (real net worth, health, happiness, reputation) and assigns one of eight narrative endings with a full financial breakdown comparing nominal and inflation-adjusted net worth.

## Core Systems

### Action Economy

Each year grants **6 action points**. Four action types consume a slot:

| Action | Slot Cost | Effect |
|--------|-----------|--------|
| **Work** | 1 | Earns salary / 6; drains 7 health; increments work-action counter |
| **Career** | 1 | Opens procedural job offers (Entry / Mid / Senior / Elite tiers); earns $0 |
| **Education** | 1 | Advances grad-school progress (6 slots to graduate); earns $0 |
| **Rest** | 1 | Recovers +20 health (capped at 100), +5 happiness; earns $0 |

**Investing** is a **free action** — it does not consume a slot. Players can open the Portfolio Market sidebar and execute unlimited buy/sell transactions whenever they have sufficient cash or holdings.

### Health & Survival Pressure

Health is a hidden 0–100 value displayed qualitatively as Good (>66), Medium (34–66), or Poor (≤33). When health drops below the critical threshold of 30:

- **Work income is halved** — simulating sick leave and performance decline.
- The player must choose between earning at 50% capacity or spending a precious action slot on Rest to recover.

Lifestyle tier choices, events, and the cumulative toll of consecutive Work actions all affect health.

### Financial Model

- **Inflation** — era-specific rates (e.g., 9% during 1970s stagflation, 8% in 2022) compound annually. The HUD displays cumulative purchasing-power erosion in real time.
- **Debt** — student loans accrue 10% APR; credit-card debt accrues 22% APR. Credit-card debt is auto-generated whenever cash goes negative. Interactive repayment widgets ($1k / $10k / All Cash) with confirmation guards.
- **Market simulation** — nine asset classes follow long-run historical curves from 1920 to 2036. A monthly market matrix introduces intra-year volatility with negative correlation between risk-on assets (stocks, crypto) and safe havens (gold, bonds). Volatility buffs from events temporarily amplify specific asset swings.
- **Sell cooldown** — after buying an asset, the player must wait 2 global actions before selling, preventing instant arbitrage.
- **Minimum buy thresholds** — property requires $20,000; vehicles require $5,000. Insufficient funds grey out the purchase button.

### Career Progression

Job offers are procedurally generated with four tiers gated by hard requirements:

| Tier | Requirements |
|------|-------------|
| Entry | None |
| Mid | 1+ year stable experience OR grad degree |
| Senior | 3+ years stable experience AND grad degree |
| Elite | 3+ years stable exp, grad degree, Good reputation, Good health |

**Stable experience** accumulates when a player completes ≥4 Work actions in a year without changing jobs, granting +1 year of experience and a 7% salary bump.

### Endings

Eight endings are possible, ranging from **The American Dream** (rich, happy, healthy) to **The Debt Spiral** (broke and miserable). The ending screen shows nominal net worth, inflation-adjusted real net worth, final salary, historical max savings, remaining debt, and life-outcome bars for health and reputation. An all-time peak net worth watermark persists across games via localStorage.

The Knowledge Hub is reachable from any phase via the floating button and surfaces investment fact cards the player has encountered during play.

## Contributing

Issues and pull requests are welcome. When opening an issue, please include the difficulty, game length, and profile that reproduced the behavior — balance and event bugs are common.

Before submitting a pull request:

- Run `npm run lint` and fix any reported issues.
- Run `npm run build` to confirm the TypeScript build succeeds.
- Run `npx tsx scripts/simulate.ts` to confirm the headless simulation still completes without runtime errors.

Gameplay and balance changes should reference the relevant section of the latest PRD in [`../PRD/`](../PRD/).

## License

[MIT](LICENSE) © 2026 Leo Sun
