import type { AssetClass, ActiveBuff } from '../types/game';

export interface AssetCurvePoint {
  year: number;
  value: number;
}

export const getAssetCurve = (asset: AssetClass): AssetCurvePoint[] => {
  const points: AssetCurvePoint[] = [];
  let currentVal = 100;
  
  for (let year = 1920; year <= 2036; year++) {
    let multiplier = 1.0;
    
    switch (asset) {
      case 'savingsAccount':
        // Updated: 5-6% high-yield savings in 2026+ environment
        multiplier = 1.02;
        if (year >= 2010 && year <= 2020) multiplier = 1.005;
        if (year >= 2022 && year <= 2024) multiplier = 1.045;
        if (year >= 2025) multiplier = 1.055; // 5.5% avg (5-6% range)
        break;
      case 'bonds':
        // Updated: 7-9% bond yields in 2026+ environment
        multiplier = 1.06;
        if (year === 2022) multiplier = 0.87;
        if (year >= 2025) multiplier = 1.08; // 8% avg (7-9% range)
        break;
      case 'stocks':
      case 'retirement':
        // Updated: 12-14% equity returns in 2026+ environment
        multiplier = 1.10;
        if (year === 1929) multiplier = 0.70;
        if (year >= 1930 && year <= 1932) multiplier = 0.80;
        if (year >= 2000 && year <= 2002) multiplier = 0.83;
        if (year === 2008) multiplier = 0.60;
        if (year === 2020) multiplier = 0.90;
        if (year === 2022) multiplier = 0.80;
        if (year === 2023) multiplier = 1.24; // 2023 recovery
        if (year === 2024) multiplier = 1.20; // 2024 AI bull run
        if (year === 2025) multiplier = 1.15; // 2025 continued growth
        if (year >= 2026) multiplier = 1.13; // 13% avg (12-14% range)
        if (asset === 'retirement') multiplier += 0.01;
        break;
      case 'options':
        multiplier = Math.random() > 0.7 ? 2.5 : 0.4;
        break;
      case 'crypto':
        if (year < 2009) {
          multiplier = 1.0; currentVal = 1;
        } else {
          multiplier = 1.5;
          if (year === 2018) multiplier = 0.20;
          if (year === 2021) multiplier = 3.0;
          if (year === 2022) multiplier = 0.23;
          if (year === 2024) multiplier = 2.0;
          if (year === 2025) multiplier = 1.6; // 2025 post-halving rally
          if (year >= 2026) multiplier = 1.4; // 2026+ moderate bull
        }
        break;
      case 'gold':
        multiplier = 1.04;
        if (year >= 1970 && year <= 1980) multiplier = 1.20;
        if (year > 1980 && year <= 2001) multiplier = 0.98;
        if (year >= 2020 && year <= 2024) multiplier = 1.08;
        if (year >= 2025) multiplier = 1.10; // Gold strength in 2025+
        break;
      case 'property':
        multiplier = 1.04;
        if (year === 2008) multiplier = 0.80;
        if (year >= 2021 && year <= 2023) multiplier = 1.15;
        if (year >= 2024 && year <= 2025) multiplier = 1.06; // Cooling
        if (year >= 2026) multiplier = 1.08; // Moderate growth
        break;
      case 'vehicle':
        multiplier = 0.85;
        if (currentVal < 1) currentVal = 1;
        break;
    }
    
    if (!['savingsAccount', 'vehicle'].includes(asset)) {
      const noise = (Math.random() * 0.06) - 0.03;
      multiplier += noise;
    }
    
    currentVal *= multiplier;
    if (asset === 'options' && currentVal < 1) currentVal = 100;
    
    points.push({ year, value: Math.max(0, currentVal) });
  }
  
  return points;
};

const curveCache: Partial<Record<AssetClass, AssetCurvePoint[]>> = {};

export const getCachedCurve = (asset: AssetClass): AssetCurvePoint[] => {
  if (!curveCache[asset]) curveCache[asset] = getAssetCurve(asset);
  return curveCache[asset]!;
};

export const getExpectedYearEndMultiplier = (asset: AssetClass, currentYear: number): number => {
  const curve = getCachedCurve(asset);
  const thisYear = curve.find(p => p.year === currentYear);
  const nextYear = curve.find(p => p.year === currentYear + 1);
  if (thisYear && nextYear && thisYear.value > 0) return nextYear.value / thisYear.value;
  return 1.05;
};

// Module 4: Generate Monthly Matrix with Negative Correlation
export const generateMonthlyMatrix = (currentYear: number, activeBuffs: ActiveBuff[]): Record<AssetClass, number[]> => {
  const assets: AssetClass[] = ['savingsAccount', 'bonds', 'stocks', 'options', 'crypto', 'gold', 'retirement', 'property', 'vehicle'];
  const matrix: Record<AssetClass, number[]> = {} as any;
  
  // 1. Determine target multiplier for the end of the year (month 12)
  const targets: Record<AssetClass, number> = {} as any;
  assets.forEach(asset => {
    let target = getExpectedYearEndMultiplier(asset, currentYear);
    const vBuff = activeBuffs.find(b => b.type === 'volatility' && b.asset === asset);
    if (vBuff) {
      target = 1.0 + ((target - 1.0) * vBuff.multiplier);
    }
    targets[asset] = target;
    matrix[asset] = [1.0]; // Month 0 is baseline
  });

  // 2. Generate month by month
  for (let m = 1; m <= 12; m++) {
    // Pick a highly volatile asset to lead the market (e.g. Stocks or Crypto)
    const leader = Math.random() > 0.5 ? 'stocks' : 'crypto';
    const leaderTarget = targets[leader];
    
    // We want the leader to slowly march towards its target + some random noise
    const progressToTarget = m / 12;
    const expectedCurrent = 1.0 + (leaderTarget - 1.0) * progressToTarget;
    
    // Add month noise
    const noise = (Math.random() * 0.1) - 0.05; // +/- 5% month-to-month noise
    let leaderValue = expectedCurrent + noise;
    
    // At month 12, force exactly to target
    if (m === 12) leaderValue = leaderTarget;
    matrix[leader].push(leaderValue);

    // Now Negative Correlation logic: if leader jumped up > 2% from its expected path, Gold/Bonds drop.
    const leaderJumped = noise > 0.02;
    const leaderDropped = noise < -0.02;

    assets.forEach(asset => {
      if (asset === leader) return;
      
      const target = targets[asset];
      const prog = m / 12;
      let val = 1.0 + (target - 1.0) * prog;
      
      let assetNoise = (Math.random() * 0.04) - 0.02;

      // Force inverse correlation
      if (['gold', 'bonds'].includes(asset)) {
        if (leaderJumped) assetNoise = -Math.abs(assetNoise) - 0.02; // Force drop
        if (leaderDropped) assetNoise = Math.abs(assetNoise) + 0.02; // Force rise
      } else if (['retirement', 'options'].includes(asset)) {
        // Positive correlation with leader (stocks)
        if (leader === 'stocks') {
          if (leaderJumped) assetNoise = Math.abs(assetNoise) + 0.02;
          if (leaderDropped) assetNoise = -Math.abs(assetNoise) - 0.02;
        }
      }

      // Savings & Vehicle are smooth
      if (['savingsAccount', 'vehicle'].includes(asset)) assetNoise = 0;

      val += assetNoise;
      if (m === 12) val = target; // Lock to target at year end
      matrix[asset].push(Math.max(0, val));
    });
  }

  return matrix;
};
