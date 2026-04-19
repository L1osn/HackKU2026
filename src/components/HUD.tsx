import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getCumulativeInflation } from '../lib/financeEngine';

/**
 * AnimatedValue: renders a number that flashes green on increase, red on decrease.
 * Uses a 500ms CSS animation per PRD spec.
 */
const AnimatedValue: React.FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  forceColor?: string;
  /** If true, the value is always rendered as negative-colored (e.g. debt) */
  alwaysNegativeColor?: boolean;
  /** If true, a red pulse animation is triggered when value increases (debt going up is bad) */
  pulseOnIncrease?: boolean;
}> = ({ value, prefix = '', suffix = '', forceColor, alwaysNegativeColor, pulseOnIncrease }) => {
  const prevValue = useRef(value);
  const [flashClass, setFlashClass] = useState('');

  useEffect(() => {
    if (value !== prevValue.current) {
      const increased = value > prevValue.current;

      if (pulseOnIncrease && increased) {
        // Debt went up — this is BAD, pulse red urgently
        setFlashClass('animate-[flash-red_0.5s_ease-out]');
      } else if (!pulseOnIncrease) {
        setFlashClass(increased ? 'animate-[flash-green_0.5s_ease-out]' : 'animate-[flash-red_0.5s_ease-out]');
      }

      prevValue.current = value;
      const t = setTimeout(() => setFlashClass(''), 500);
      return () => clearTimeout(t);
    }
  }, [value, pulseOnIncrease]);

  const absVal = Math.abs(value).toLocaleString();
  const isNeg = value < 0;
  const colorClass = forceColor ?? (alwaysNegativeColor ? 'text-negative' : (isNeg ? 'text-negative' : 'text-white'));

  return (
    <span className={`font-mono transition-colors ${colorClass} ${flashClass}`}>
      {isNeg && !alwaysNegativeColor ? '-' : ''}{prefix}{absVal}{suffix}
    </span>
  );
};

/** Qualitative label helpers */
const getQualitative = (val: number) => val > 66 ? 'Good' : val > 33 ? 'Medium' : 'Poor';
const qualColor = (val: number) => val > 66 ? 'text-positive' : val > 33 ? 'text-warning' : 'text-negative';

export const HUD: React.FC = () => {
  const { player, currentYear, startYear, gameLength, phase, actions, allTimePeakNetWorth } = useGameStore();

  if (phase === 'SETUP') return null;

  const assetTotal = Object.values(player.assets).reduce((a, b) => a + b, 0);
  const debtTotal = Object.values(player.liabilities).reduce((a, b) => a + b, 0);
  const totalAssets = player.cash + assetTotal;
  const nominalNetWorth = totalAssets - debtTotal;

  return (
    <div className="sticky top-0 z-50 bg-surface/95 backdrop-blur-md border-b border-gray-800 shadow-xl px-4 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-2">

        {/* ── HEADER BAR: Year + Action Dots ─────────────────────────────── */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/70">
          <span className="text-xs font-bold text-neutral uppercase tracking-widest">
            Year {currentYear - startYear + 1}
            <span className="opacity-40"> / {gameLength}</span>
            <span className="text-gray-600 ml-3 font-normal">{currentYear}</span>
          </span>
          <div className="flex gap-1.5" title="Action Points (6 per year)">
            {actions.map((a, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  a.confirmed
                    ? 'bg-primary shadow-[0_0_6px_rgba(0,230,118,0.7)]'
                    : 'border border-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── ROW 1 (Heavy Assets): Net Worth | Peak Net Worth | Total Assets | Total Debt ─ */}
        <div className="flex flex-wrap justify-between items-end gap-x-8 gap-y-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-neutral uppercase tracking-widest mb-0.5">Net Worth</span>
            <div className={`text-xl sm:text-2xl font-bold font-mono ${nominalNetWorth >= 0 ? 'text-white' : 'text-negative'}`}>
              <AnimatedValue value={nominalNetWorth} prefix="$" />
            </div>
          </div>

          {/* All-time peak net worth — persists across resets, stored in localStorage */}
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400/70 uppercase tracking-widest mb-0.5">All-Time Peak</span>
            <div className="text-base font-bold font-mono text-amber-400 flex items-center gap-1">
              <span className="text-xs leading-none">▲</span>
              <AnimatedValue value={allTimePeakNetWorth} prefix="$" forceColor="text-amber-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-neutral uppercase tracking-widest mb-0.5">Total Assets</span>
            <div className="text-base font-bold font-mono text-white">
              <AnimatedValue value={totalAssets} prefix="$" forceColor="text-white" />
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-negative/80 uppercase tracking-widest mb-0.5">Total Debt</span>
            <div className="text-base font-bold font-mono">
              <AnimatedValue value={debtTotal} prefix="-$" alwaysNegativeColor pulseOnIncrease />
            </div>
          </div>
        </div>

        {/* ── ROW 2 (Status & History): Health | Rep | Stable Exp | Cash | Max Savings ─── */}
        <div className="flex flex-wrap justify-between items-end gap-x-5 gap-y-2 bg-black/30 rounded-lg px-4 py-3 border border-gray-800/40">

          {/* Health */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-neutral uppercase tracking-wider">Health</span>
            <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded border ${qualColor(player.health)} ${player.health > 66 ? 'bg-positive/10 border-positive/20' : player.health > 33 ? 'bg-warning/10 border-warning/20' : 'bg-negative/10 border-negative/20'}`}>
              {getQualitative(player.health)}
            </span>
          </div>

          {/* Reputation */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-neutral uppercase tracking-wider">Rep</span>
            <span className={`text-sm font-bold uppercase px-2 py-0.5 rounded border ${qualColor(player.reputation)} ${player.reputation > 66 ? 'bg-positive/10 border-positive/20' : player.reputation > 33 ? 'bg-warning/10 border-warning/20' : 'bg-negative/10 border-negative/20'}`}>
              {getQualitative(player.reputation)}
            </span>
          </div>

          {/* Stable Experience */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-neutral uppercase tracking-wider">Stable Exp</span>
            <span className="text-sm font-bold font-mono text-white px-2 py-0.5 rounded border bg-white/5 border-white/10">
              {player.stableExperience}yr
            </span>
          </div>

          {/* Purchasing Power Erosion — the silent killer */}
          {(() => {
            const inflMult = getCumulativeInflation(startYear, currentYear);
            const erosionPct = Math.round((1 - 1 / inflMult) * 100);
            if (erosionPct <= 0) return null;
            return (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-negative/80 uppercase tracking-wider">Inflation</span>
                <span className="text-sm font-bold font-mono text-negative px-2 py-0.5 rounded border bg-negative/10 border-negative/20 animate-pulse">
                  -{erosionPct}%
                </span>
              </div>
            );
          })()}

          <div className="h-5 w-px bg-gray-700 hidden sm:block self-center" />

          {/* Cash */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-neutral uppercase tracking-wider">Cash</span>
            <span className="text-sm font-bold font-mono text-white bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              <AnimatedValue value={player.cash} prefix="$" forceColor="text-white" />
            </span>
          </div>

          {/* Max Savings (Historical Peak) */}
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[10px] text-neutral uppercase tracking-wider">Max Savings</span>
            <span className="text-sm font-bold font-mono text-primary/80 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
              <AnimatedValue value={player.maxSavings} prefix="$" forceColor="text-primary/80" />
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
