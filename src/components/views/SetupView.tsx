import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { generateProfiles } from '../../lib/characterGenerator';
import { TypewriterText } from '../TypewriterText';
import type { GameLength } from '../../types/game';

const INTRO_SENTENCES = [
  "You think graduation is the finish line of your struggles. In reality, it is merely the lobby of a relentless survival game.",
  "Here, the average graduate steps off the stage shackled to $30,000 in student debt, the interest compounding before the ink on their diploma even dries.",
  "Here, 40% of recent alumni find themselves trapped in underemployment, their hard-earned degrees useless against skyrocketing rents that devour half their monthly paychecks.",
  "Worse still, one minor slip—a sudden layoff, a medical emergency, a blown engine—is all it takes to wipe out years of fragile savings and drag them into the suffocating abyss of 22% credit card debt.",
  "Here, millions of bright, ambitious minds are quietly ground down by the invisible machinery of inflation and market crashes, surrendering their dreams just to keep the lights on.",
  "Is that pristine offer letter in your hands a genuine stepping stone to wealth, or simply a velvet-lined trap designed to keep you running on the treadmill forever?",
  "Now, it is your turn to find out.",
];

type SetupStage = 'INTRO' | 'DIFFICULTY' | 'PROFILE';

export const SetupView: React.FC = () => {
  const { selectProfile, setupGame } = useGameStore();
  const [stage, setStage] = useState<SetupStage>('INTRO');
  const [introFinished, setIntroFinished] = useState(false);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Hard' | null>(null);
  const [gameLength, setGameLength] = useState<GameLength>(10);
  const [profiles] = useState(() => ({
    Easy: generateProfiles('Easy'),
    Hard: generateProfiles('Hard'),
  }));

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (stage === 'INTRO') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 cursor-pointer bg-black relative overflow-hidden"
        onClick={() => setStage('DIFFICULTY')}
      >
        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />

        <div className="z-10 flex flex-col items-center max-w-3xl px-6 text-center">
          <TypewriterText
            sentences={INTRO_SENTENCES}
            typingSpeed={28}
            pauseBetween={1200}
            onComplete={() => setIntroFinished(true)}
          />

          <div className={`mt-20 flex flex-col items-center gap-4 transition-all duration-1000 ${introFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter" style={{ textShadow: '0 0 60px rgba(0,230,118,0.3)' }}>
              Life After Grad
            </h1>
            <button
              onClick={(e) => { e.stopPropagation(); setStage('DIFFICULTY'); }}
              className="mt-4 px-10 py-3 border border-primary text-primary hover:bg-primary hover:text-black transition-all duration-200 font-bold tracking-[0.2em] text-sm uppercase shadow-[0_0_20px_rgba(0,230,118,0.15)] hover:shadow-[0_0_30px_rgba(0,230,118,0.4)]"
            >
              Start Game
            </button>
          </div>
        </div>

        <p className="fixed bottom-5 text-xs text-gray-600 z-10 tracking-widest uppercase">Click anywhere to skip</p>
      </div>
    );
  }

  // ── DIFFICULTY SELECTION ───────────────────────────────────────────────────
  if (stage === 'DIFFICULTY') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background animate-fade-in">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Life After Grad</h1>
            <p className="text-neutral text-base">Choose your starting reality. There is no easy way out — only different kinds of hard.</p>
          </div>

          {/* Game Length Selector */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="text-sm text-secondary font-medium">Timeline:</span>
            <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
              {([5, 10, 15, 20] as GameLength[]).map(len => (
                <button
                  key={len}
                  onClick={() => setGameLength(len)}
                  className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${gameLength === len ? 'bg-primary text-black' : 'text-secondary hover:text-white'}`}
                >
                  {len}yr
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* EASY */}
            <button
              onClick={() => { setDifficulty('Easy'); setStage('PROFILE'); }}
              className="group relative text-left p-8 border border-gray-700 rounded-2xl bg-surface hover:border-primary transition-all duration-200 hover:shadow-[0_4px_30px_rgba(0,230,118,0.12)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">📈</span>
                <div>
                  <span className="block text-lg font-bold text-white group-hover:text-primary transition-colors">Easy Mode</span>
                  <span className="text-xs text-positive font-bold uppercase tracking-wider">High-Demand Fields</span>
                </div>
              </div>
              <p className="text-neutral text-sm leading-relaxed mb-5">
                You chose a marketable major. Tech, nursing, engineering. The job market wants you. Your salary will cover your debt — if you play it smart.
              </p>
              <div className="space-y-2 font-mono text-sm border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-neutral">Salary range</span>
                  <span className="text-positive font-bold">$58k – $105k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Student debt</span>
                  <span className="text-warning">$24k – $50k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Loan interest</span>
                  <span className="text-negative">10% APR</span>
                </div>
              </div>
            </button>

            {/* HARD */}
            <button
              onClick={() => { setDifficulty('Hard'); setStage('PROFILE'); }}
              className="group relative text-left p-8 border border-gray-700 rounded-2xl bg-surface hover:border-negative transition-all duration-200 hover:shadow-[0_4px_30px_rgba(244,67,54,0.12)] hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎭</span>
                <div>
                  <span className="block text-lg font-bold text-white group-hover:text-negative transition-colors">Hard Mode</span>
                  <span className="text-xs text-negative font-bold uppercase tracking-wider">Passion Economy</span>
                </div>
              </div>
              <p className="text-neutral text-sm leading-relaxed mb-5">
                You followed your passion. Art, journalism, social science. The world respects your degree at dinner parties — but not on pay stubs. The debt is just as real.
              </p>
              <div className="space-y-2 font-mono text-sm border-t border-gray-700 pt-4">
                <div className="flex justify-between">
                  <span className="text-neutral">Salary range</span>
                  <span className="text-warning font-bold">$40k – $66k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Student debt</span>
                  <span className="text-warning">$22k – $42k</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral">Loan interest</span>
                  <span className="text-negative">10% APR</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── PROFILE SELECTION ──────────────────────────────────────────────────────
  const activeProfiles = profiles[difficulty!];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              onClick={() => setStage('DIFFICULTY')}
              className="text-xs text-secondary hover:text-white transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${difficulty === 'Easy' ? 'bg-positive/20 text-positive' : 'bg-negative/20 text-negative'}`}>
              {difficulty} Mode
            </span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Choose Your Starting Point</h2>
          <p className="text-neutral text-sm">Three people. Same diploma date. Very different hands they've been dealt.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {activeProfiles.map((p, i) => (
            <div
              key={p.id}
              className="bg-surface border border-gray-700 rounded-xl p-6 hover:border-primary transition-all duration-200 cursor-pointer group flex flex-col hover:shadow-[0_4px_24px_rgba(0,230,118,0.1)] hover:-translate-y-0.5"
              onClick={() => { setupGame(2026, gameLength); selectProfile(p); }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{p.name}</h3>
                  <span className="text-xs text-neutral">{p.degree}</span>
                </div>
                <span className="text-xs bg-gray-800 text-neutral px-2 py-1 rounded">#{i + 1}</span>
              </div>

              <p className="text-neutral text-xs leading-relaxed mb-5 flex-1 italic">"{p.background}"</p>

              {/* Stats */}
              <div className="space-y-2.5 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-neutral text-xs">Annual Salary</span>
                  <span className="text-white font-bold">${p.salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral text-xs">Monthly take-home</span>
                  <span className="text-positive text-xs">${Math.round(p.salary * 0.75 / 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral text-xs">Starting Cash</span>
                  <span className="text-white text-xs">${p.savings.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-700 pt-2.5 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral">Student Loan <span className="text-negative/70">(10% APR)</span></span>
                    <span className="text-negative font-bold">${p.debt.toLocaleString()}</span>
                  </div>
                  {/* Show annual interest cost as a warning */}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-neutral opacity-60">→ Annual interest</span>
                    <span className="text-xs text-negative/80">+${Math.round(p.debt * 0.10).toLocaleString()}/yr</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-5 py-2.5 rounded-lg bg-gray-800 text-white text-sm font-medium group-hover:bg-primary group-hover:text-background transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.3)] group-hover:shadow-[0_4px_16px_rgba(0,230,118,0.3)]">
                Select Profile
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
