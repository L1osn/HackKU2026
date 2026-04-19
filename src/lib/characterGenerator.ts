import type { CharacterProfile } from '../types/game';

/** Utility: random integer between min and max inclusive */
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const FIRST_NAMES = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Sam", "Jamie", "Avery", "Cameron", "Drew", "Quinn", "Blake", "Reese", "Skyler"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Chen", "Park", "Nguyen", "Patel", "Kim"];

/**
 * BLS 2023-2025 calibrated career archetypes.
 * Salary ranges reflect actual median entry-level wages by field.
 * Easy mode = high-demand, well-compensated fields.
 * Hard mode = competitive, oversupplied, or low-margin fields.
 */
/**
 * Gap reduction applied: Easy salaries pulled down ~10%, Hard salaries pushed up ~20%.
 * Old ratio ~2.0:1 → New ratio ~1.4:1.
 */
const CAREER_ARCHETYPES = {
  Easy: [
    { degree: "Computer Science", background: "Landed a software engineering role at a mid-size tech firm.", salaryMin: 78000, salaryMax: 105000 },
    { degree: "Nursing (BSN)", background: "Started as a registered nurse at a regional hospital system.", salaryMin: 62000, salaryMax: 76000 },
    { degree: "Electrical Engineering", background: "Joined a defense contractor as a junior systems engineer.", salaryMin: 66000, salaryMax: 88000 },
    { degree: "Data Science", background: "Hired as an analyst at a financial services company.", salaryMin: 72000, salaryMax: 96000 },
    { degree: "Accounting (CPA track)", background: "Started at a Big Four firm as an audit associate.", salaryMin: 58000, salaryMax: 72000 },
  ],
  Hard: [
    { degree: "English Literature", background: "Scraping by as a junior copywriter at a small agency.", salaryMin: 46000, salaryMax: 62000 },
    { degree: "Fine Arts", background: "Freelancing and working part-time at a gallery.", salaryMin: 40000, salaryMax: 55000 },
    { degree: "Political Science", background: "Entry-level research assistant at a non-profit.", salaryMin: 48000, salaryMax: 64000 },
    { degree: "Sociology", background: "Working as a case coordinator at a social services agency.", salaryMin: 44000, salaryMax: 60000 },
    { degree: "Biology (non-pre-med)", background: "Lab technician at a university research department.", salaryMin: 50000, salaryMax: 66000 },
    { degree: "Journalism", background: "Junior reporter at a local news outlet — the industry is dying.", salaryMin: 43000, salaryMax: 58000 },
  ],
};

/**
 * Real student debt ranges calibrated to NCES 2023 data.
 * Easy: STEM/professional programs — high earning potential but also higher tuition costs.
 * Hard: Liberal arts / social science — lower earning potential with similar or worse debt burden.
 */
const DEBT_RANGES = {
  Easy: { min: 24000, max: 50000 },
  Hard: { min: 22000, max: 42000 },
};

/**
 * Starting cash savings. Deliberately kept low per Module 1 design:
 * players should feel cash pressure immediately.
 */
const MAX_STARTING_CASH = 3000;
const STARTING_CASH = { min: 200, max: MAX_STARTING_CASH };

/**
 * Generates 3 character profiles for a given difficulty mode.
 * @param difficulty - 'Easy' or 'Hard', set by the player before profile selection.
 * @returns Array of 3 CharacterProfile objects with BLS-calibrated numbers.
 */
export function generateProfiles(difficulty: 'Easy' | 'Hard'): CharacterProfile[] {
  const archetypes = CAREER_ARCHETYPES[difficulty];
  const debtRange = DEBT_RANGES[difficulty];

  // Shuffle and pick 3 unique archetypes
  const shuffled = [...archetypes].sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map(archetype => {
    const firstName = FIRST_NAMES[rand(0, FIRST_NAMES.length - 1)];
    const lastName = LAST_NAMES[rand(0, LAST_NAMES.length - 1)];

    // Salary: random within archetype range, then apply small individual noise (-5% to +5%)
    const baseSalary = rand(archetype.salaryMin, archetype.salaryMax);
    const noiseFactor = 0.95 + Math.random() * 0.10;
    const salary = Math.round(baseSalary * noiseFactor / 1000) * 1000; // round to nearest $1k

    // Debt: random within difficulty-calibrated range
    const debt = rand(debtRange.min, debtRange.max);
    // Round to nearest $500 for realism
    const debtRounded = Math.round(debt / 500) * 500;

    // Cash savings: capped at $3000 — graduates rarely have much
    const savings = rand(STARTING_CASH.min, STARTING_CASH.max);

    return {
      id: crypto.randomUUID(),
      name: `${firstName} ${lastName}`,
      background: archetype.background,
      degree: archetype.degree,
      salary,
      savings,
      debt: debtRounded,
      difficulty,
    };
  });
}
