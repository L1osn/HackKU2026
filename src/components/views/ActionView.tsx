import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { InvestModal } from '../InvestModal';
import { FACT_CARDS } from '../KnowledgeHub';
import { generateJobOffers } from '../../lib/careerEngine';
import { Sparkline } from '../Sparkline';
import { getCachedCurve } from '../../lib/historicalData';
import type { AssetClass } from '../../types/game';

const SEEN_ASSETS_KEY = 'life-after-grad:seenAssets';

/** Load the set of asset classes the player has already seen a flashcard for. */
const loadSeenAssets = (): Set<AssetClass> => {
  try {
    const raw = localStorage.getItem(SEEN_ASSETS_KEY);
    if (raw) return new Set(JSON.parse(raw) as AssetClass[]);
  } catch {
    // ignore parse errors
  }
  return new Set();
};

/** Persist the seen-assets set to localStorage. */
const saveSeenAssets = (seen: Set<AssetClass>): void => {
  try {
    localStorage.setItem(SEEN_ASSETS_KEY, JSON.stringify([...seen]));
  } catch {
    // ignore quota errors
  }
};

const ASSETS: AssetClass[] = ['savingsAccount', 'bonds', 'stocks', 'options', 'crypto', 'gold', 'retirement', 'property', 'vehicle'];

/**
 * DebtCard: interactive debt repayment widget.
 * Supports $1k, $10k, and All-Cash options.
 * "Repay All" triggers a confirmation guard to prevent accidentally going cash-zero
 * before a random event could trigger more CC debt.
 */
const DebtCard: React.FC<{
  label: string;
  apr: number;
  balance: number;
  cash: number;
  type: 'studentLoan' | 'creditCard';
  urgent?: boolean;
}> = ({ label, apr, balance, cash, type, urgent }) => {
  const [confirmAll, setConfirmAll] = useState(false);

  const repay = (amount: number) => {
    useGameStore.getState().repayDebt(amount, type);
    setConfirmAll(false);
  };

  const annualInterest = Math.round(balance * apr / 100);
  const canPay1k = cash >= 1000;
  const canPay10k = cash >= 10000;
  const canPayAll = cash > 0 && balance > 0;

  const btnBase = "px-2 py-1 text-[10px] font-bold rounded transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed";
  const shadowHover = urgent
    ? "hover:shadow-[0_2px_12px_rgba(244,67,54,0.4)] hover:-translate-y-px active:translate-y-0"
    : "hover:shadow-[0_2px_10px_rgba(255,255,255,0.1)] hover:-translate-y-px active:translate-y-0";

  return (
    <div className={`rounded-lg p-3 border ${urgent ? 'border-negative bg-negative/8' : 'border-gray-700 bg-gray-900/50'}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className={`text-xs font-bold ${urgent ? 'text-negative' : 'text-white'}`}>{label}</span>
          <span className={`ml-2 text-[10px] font-mono ${urgent ? 'text-negative/80' : 'text-neutral'}`}>{apr}% APR</span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-bold font-mono ${urgent ? 'text-negative' : 'text-white'}`}>
            ${balance.toLocaleString()}
          </div>
          <div className="text-[9px] text-negative/70 font-mono">+${annualInterest.toLocaleString()}/yr interest</div>
        </div>
      </div>

      {/* Action buttons */}
      {!confirmAll ? (
        <div className="flex gap-1.5 mt-2">
          <button
            disabled={!canPay1k}
            onClick={() => repay(1000)}
            className={`${btnBase} border border-gray-600 text-white bg-gray-800 hover:bg-white hover:text-black ${shadowHover} flex-1`}
          >
            Repay $1k
          </button>
          <button
            disabled={!canPay10k}
            onClick={() => repay(10000)}
            className={`${btnBase} border border-gray-600 text-white bg-gray-800 hover:bg-white hover:text-black ${shadowHover} flex-1`}
          >
            Repay $10k
          </button>
          <button
            disabled={!canPayAll}
            onClick={() => setConfirmAll(true)}
            className={`${btnBase} ${urgent ? 'bg-negative text-white hover:brightness-110 border border-negative' : 'bg-gray-700 text-white border border-gray-500 hover:bg-white hover:text-black'} ${shadowHover} flex-1`}
          >
            All Cash
          </button>
        </div>
      ) : (
        /* Confirmation guard for "Repay All" */
        <div className="mt-2 bg-black/50 rounded-lg p-2 border border-warning/40">
          <p className="text-[10px] text-warning mb-2 leading-relaxed">
            ⚠ Spend <strong className="text-white">${Math.min(cash, balance).toLocaleString()}</strong> to pay this down? You'll have <strong className="text-white">${Math.max(0, cash - balance).toLocaleString()}</strong> left. A random event could force you back into CC debt.
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={() => repay(Math.min(cash, balance))}
              className={`${btnBase} bg-negative text-white border border-negative hover:brightness-110 flex-1`}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmAll(false)}
              className={`${btnBase} border border-gray-600 text-white bg-gray-800 flex-1`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export const ActionView: React.FC = () => {
  const { player, actions, currentActionIndex, currentYear, startYear, marketHistory, skipYear, executeWorkAction, executeRestAction, executeCareerJobChange, executeStudyAction, enrollGradSchool, dropoutGradSchool } = useGameStore();
  
  const [activeModal, setActiveModal] = useState<'INVEST' | 'CAREER' | 'STUDY' | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetClass | null>(null);
  const [jobOffers, setJobOffers] = useState<any[]>([]);
  const [timeTab, setTimeTab] = useState<'1Y' | '3Y' | '10Y'>('1Y');

  // Flashcard: shown the first time the player clicks any asset in the Portfolio Market.
  const [seenAssets] = useState<Set<AssetClass>>(loadSeenAssets);
  const [flashcardAsset, setFlashcardAsset] = useState<AssetClass | null>(null);

  const handleInvestClick = (asset: AssetClass) => {
    if (!seenAssets.has(asset)) {
      // First encounter — show educational flashcard before opening InvestModal.
      setFlashcardAsset(asset);
    } else {
      setSelectedAsset(asset);
      setActiveModal('INVEST');
    }
  };

  const dismissFlashcard = () => {
    if (!flashcardAsset) return;
    seenAssets.add(flashcardAsset);
    saveSeenAssets(seenAssets);
    setSelectedAsset(flashcardAsset);
    setFlashcardAsset(null);
    setActiveModal('INVEST');
  };

  const openCareer = () => {
    setJobOffers(generateJobOffers(player));
    setActiveModal('CAREER');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 grid md:grid-cols-[1fr_420px] gap-8 pb-24">
      {/* LEFT PANEL: Action Slots & Main Choices */}
      <div className="flex flex-col gap-8">
        <div className="bg-surface border border-gray-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Take Action</h2>
            {currentYear - startYear >= 5 && (
              <button 
                onClick={skipYear}
                className="px-4 py-2 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-black transition-colors rounded font-bold text-sm"
              >
                ⏩ Skip This Year
              </button>
            )}
          </div>
          
          <div className="flex flex-col gap-3 mb-8">
            {actions.map((action, idx) => (
              <div 
                key={action.id} 
                className={`p-3 border rounded-lg flex items-center justify-between ${idx === currentActionIndex && !action.confirmed ? 'border-primary bg-primary/5 shadow-[0_0_15px_rgba(0,230,118,0.1)]' : action.confirmed ? 'border-gray-700 bg-gray-800/30' : 'border-gray-800 bg-surface opacity-50'}`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${action.confirmed ? 'bg-primary text-background' : idx === currentActionIndex ? 'border-2 border-primary text-primary' : 'border-2 border-gray-600 text-gray-600'}`}>
                    {idx + 1}
                  </div>
                  <span className="font-bold text-sm text-white">
                    {action.confirmed ? (action.type ? action.type : <span className="text-negative">SKIPPED (DEBUFF)</span>) : idx === currentActionIndex ? 'Current Action' : 'Locked'}
                  </span>
                </div>
                {idx === currentActionIndex && !action.confirmed && (
                  <span className="text-[10px] text-primary animate-pulse">Awaiting input...</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => executeWorkAction(currentActionIndex)}
              className="p-4 border border-gray-700 rounded-xl bg-surface hover:border-primary hover:bg-primary/10 transition-all duration-150 flex flex-col items-center gap-1.5 group relative overflow-hidden hover:shadow-[0_4px_20px_rgba(0,230,118,0.15)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="absolute top-1.5 right-1.5 flex flex-col items-end">
                <span className="text-[9px] text-secondary uppercase bg-gray-800 px-1.5 py-0.5 rounded">{player.workActionsThisYear}/4 Stable Exp Target</span>
              </div>
              <span className="text-2xl group-hover:scale-110 transition-transform mt-3">💼</span>
              <span className="font-bold text-sm text-white">Work</span>
              <span className="text-[10px] text-neutral text-center">Earn +${Math.round(player.salary / 6).toLocaleString()}<br/>Builds stable experience</span>
            </button>
            <button 
              onClick={openCareer}
              className="p-4 border border-gray-700 rounded-xl bg-surface hover:border-primary hover:bg-primary/10 transition-all duration-150 flex flex-col items-center gap-1.5 group relative hover:shadow-[0_4px_20px_rgba(0,230,118,0.12)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <div className="absolute top-1.5 right-1.5">
                <span className="text-[9px] text-negative uppercase bg-negative/10 px-1.5 py-0.5 rounded border border-negative/20">High Friction</span>
              </div>
              <span className="text-2xl group-hover:scale-110 transition-transform mt-3">🤝</span>
              <span className="font-bold text-sm text-white">Career</span>
              <span className="text-[10px] text-neutral text-center">Interview for jobs<br/><span className="text-negative">Cost: 1 Action (No Income)</span></span>
            </button>
            <button 
              onClick={() => setActiveModal('STUDY')}
              className="p-4 border border-gray-700 rounded-xl bg-surface hover:border-primary hover:bg-primary/10 transition-all duration-150 flex flex-col items-center gap-1.5 group hover:shadow-[0_4px_20px_rgba(0,230,118,0.12)] hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
              <span className="font-bold text-sm text-white">Education</span>
              <span className="text-[10px] text-neutral text-center">Grad school<br/>Unlocks higher job tiers</span>
            </button>
            <button 
              onClick={() => executeRestAction(currentActionIndex)}
              className="p-4 border border-gray-700 rounded-xl bg-surface hover:border-primary hover:bg-primary/10 transition-all duration-150 flex flex-col items-center gap-1.5 group relative hover:shadow-[0_4px_20px_rgba(0,230,118,0.12)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {player.health < 30 && (
                <div className="absolute top-1.5 right-1.5">
                  <span className="text-[9px] text-negative uppercase bg-negative/10 px-1.5 py-0.5 rounded border border-negative/20 animate-pulse">Low HP!</span>
                </div>
              )}
              <span className="text-2xl group-hover:scale-110 transition-transform">🏖️</span>
              <span className="font-bold text-sm text-white">Rest</span>
              <span className="text-[10px] text-neutral text-center">+20 Health, $0 Earned<br/>{player.health < 30 ? <span className="text-negative font-bold">Work income halved!</span> : 'Recover from burnout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Asset Return Panel / Portfolio (wider sidebar) */}
      <div className="bg-surface border border-gray-700 rounded-xl p-6 flex flex-col h-[calc(100vh-160px)] sticky top-[120px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Portfolio Market</h2>
          <div className="flex gap-1 bg-gray-800 rounded p-1">
            {['1Y', '3Y', '10Y'].map(t => (
              <button 
                key={t}
                onClick={() => setTimeTab(t as any)}
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${timeTab === t ? 'bg-primary text-black' : 'text-secondary hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {ASSETS.map(asset => {
            const balance = player.assets[asset];
            const vBuff = player.activeBuffs.find(b => b.type === 'volatility' && b.asset === asset);
            
            let chartData: number[] = [];
            if (timeTab === '1Y') {
              chartData = marketHistory[asset] || [1, 1];
            } else {
              const yearsBack = timeTab === '3Y' ? 3 : 10;
              const curve = getCachedCurve(asset);
              chartData = curve.filter(p => p.year > currentYear - yearsBack && p.year <= currentYear).map(p => p.value);
              if (chartData.length < 2) chartData = [1, 1];
            }

            return (
              <div 
                key={asset} 
                onClick={() => handleInvestClick(asset)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between items-center group ${vBuff ? 'border-warning bg-warning/5 animate-pulse' : 'border-gray-700 hover:border-primary'}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize group-hover:text-primary transition-colors">{asset.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {vBuff && <span className="text-[10px] bg-warning text-background px-1 rounded font-bold">VOLATILE</span>}
                  </div>
                  <span className="text-xs text-secondary">Balance: ${balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkline data={chartData} width={60} height={24} />
                  <span className="text-neutral text-xl opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</span>
                </div>
              </div>
            )
          })}
        </div>


        {/* ── LIABILITIES PANEL ──────────────────────────────────────── */}
        <div className="mt-6 border-t border-gray-800 pt-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>Liabilities</span>
            {player.liabilities.creditCard > 0 && (
              <span className="text-[9px] font-bold text-negative bg-negative/10 px-2 py-0.5 rounded animate-pulse">PRIORITY: Pay CC First</span>
            )}
          </h2>

          <div className="space-y-3">
            {/* Credit Card — show first since it's the priority */}
            {player.liabilities.creditCard > 0 && (
              <DebtCard
                label="Credit Card"
                apr={22}
                balance={player.liabilities.creditCard}
                cash={player.cash}
                type="creditCard"
                urgent
              />
            )}

            {/* Student Loan */}
            {player.liabilities.studentLoan > 0 && (
              <DebtCard
                label="Student Loan"
                apr={10}
                balance={player.liabilities.studentLoan}
                cash={player.cash}
                type="studentLoan"
              />
            )}

            {player.liabilities.studentLoan === 0 && player.liabilities.creditCard === 0 && (
              <div className="text-xs text-positive text-center py-3 border border-positive/20 rounded-lg bg-positive/5">
                🎉 Debt Free! Keep it up.
              </div>
            )}
          </div>
        </div>

      </div>



      {/* Modals */}
      {/* ── FLASHCARD MODAL: shown the first time a player clicks an asset ─── */}
      {flashcardAsset && (() => {
        const card = FACT_CARDS.find(c => c.id === flashcardAsset);
        if (!card) return null;
        return (
          <div className="fixed inset-0 z-[110] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface border border-primary/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(0,230,118,0.15)] flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] text-primary uppercase tracking-widest font-bold mb-1">Investment Insight</p>
                  <h2 className="text-2xl font-bold text-white">{card.name}</h2>
                </div>
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded mt-1 shrink-0">
                  {card.era}
                </span>
              </div>

              {/* Body */}
              <p className="text-sm text-neutral leading-relaxed">{card.content}</p>

              {/* Key Takeaway */}
              <div className="bg-background/60 border border-primary/20 rounded-xl p-4">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Key Takeaway</p>
                <p className="text-sm text-white italic">"{card.keyTakeaway}"</p>
              </div>

              {/* CTA */}
              <button
                onClick={dismissFlashcard}
                className="mt-2 w-full py-3 bg-primary text-background font-bold rounded-lg hover:brightness-110 active:brightness-90 transition-all"
              >
                Got It — Open {card.name}
              </button>
            </div>
          </div>
        );
      })()}

      {activeModal === 'INVEST' && selectedAsset && (
        <InvestModal asset={selectedAsset} onClose={() => { setActiveModal(null); setSelectedAsset(null); }} />
      )}

      {activeModal === 'CAREER' && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-gray-700 rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-2">Job Offers</h2>
            <p className="text-sm text-secondary mb-6">Changing jobs will consume your current action slot, earning you $0 for this block while you interview. Offers have strict barriers to entry.</p>
            <div className="flex flex-col gap-4 mb-6">
              {jobOffers.map((offer, i) => (
                <div key={i} className={`border rounded-lg p-4 flex flex-col gap-2 transition-colors ${offer.isQualified ? 'border-gray-700 bg-background/50 hover:border-primary' : 'border-gray-800 bg-black/50 opacity-50 grayscale'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{offer.sectorIcon}</span>
                        <span className="text-[10px] bg-gray-700 text-white px-2 py-0.5 rounded font-bold">{offer.tier}</span>
                      </div>
                      <span className="font-bold text-lg text-white">{offer.jobTitle}</span>
                      <p className="text-sm text-secondary">{offer.companyName}</p>
                    </div>
                    <span className={`font-mono font-bold text-lg ${offer.isQualified ? 'text-primary' : 'text-neutral'}`}>${offer.salary.toLocaleString()}/yr</span>
                  </div>
                  <p className="text-sm text-neutral mt-2">{offer.description}</p>
                  
                  {!offer.isQualified && (
                    <div className="mt-2 text-xs text-negative bg-negative/10 p-2 rounded">
                      🔒 UNQUALIFIED: {offer.requirementText}
                    </div>
                  )}

                  {offer.isQualified && (
                    <button 
                      onClick={() => { executeCareerJobChange(currentActionIndex, offer); setActiveModal(null); }}
                      className="mt-2 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-background font-bold rounded transition-all"
                    >
                      Accept Offer (Costs 1 Action, $0 Earned)
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors">Decline All</button>
          </div>
        </div>
      )}

      {activeModal === 'STUDY' && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">Graduate School</h2>
            {!player.education.isActive ? (
              <div className="flex flex-col gap-4">
                <p className="text-neutral text-sm">A master's degree costs <strong className="text-negative">$40,000</strong> and requires <strong className="text-white">6 Action Points</strong> to complete. Graduation permanently boosts your salary ceiling by 40% and unlocks SENIOR / ELITE jobs.</p>
                <button 
                  onClick={() => { enrollGradSchool(40000, 6); setActiveModal(null); }}
                  className="py-3 bg-primary text-background font-bold rounded-lg hover:brightness-110 transition-all mt-4"
                >
                  Enroll Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-neutral text-sm">You are currently enrolled. Progress: <strong className="text-white">{player.education.actionsCompleted} / {player.education.actionsRequired}</strong> actions.</p>
                <div className="w-full bg-gray-800 rounded-full h-4">
                  <div className="bg-primary h-4 rounded-full" style={{ width: `${(player.education.actionsCompleted / player.education.actionsRequired) * 100}%` }}></div>
                </div>
                <button 
                  onClick={() => { executeStudyAction(currentActionIndex); setActiveModal(null); }}
                  className="py-3 bg-primary text-background font-bold rounded-lg hover:brightness-110 transition-all mt-2"
                >
                  Study (Spend 1 Action)
                </button>
                <button 
                  onClick={() => { dropoutGradSchool(); setActiveModal(null); }}
                  className="py-2 border border-negative text-negative font-bold rounded-lg hover:bg-negative/10 transition-all mt-2"
                >
                  Drop Out (Lose Tuition)
                </button>
              </div>
            )}
            <button onClick={() => setActiveModal(null)} className="w-full mt-4 py-3 border border-gray-600 rounded-lg text-white hover:bg-gray-800 transition-colors">Back</button>
          </div>
        </div>
      )}

    </div>
  );
};
