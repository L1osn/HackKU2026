import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { housingTiers, foodTiers, clothingTiers, transportTiers } from '../../lib/lifestyleData';
import { getNominalCost, calculateDowngradePenalty } from '../../lib/financeEngine';
import type { LifestyleSelection, LifestyleTier } from '../../types/lifestyle';

export const LifestyleView: React.FC = () => {
  const { player, currentYear, startYear, previousLifestyle, confirmLifestyleSelection } = useGameStore();
  
  const [selection, setSelection] = useState<Partial<LifestyleSelection>>({});

  const isComplete = selection.housing && selection.food && selection.clothing && selection.transport;

  const getPenalty = (cat: keyof LifestyleSelection, tier: LifestyleTier) => {
    if (!previousLifestyle || !previousLifestyle[cat]) return 0;
    return calculateDowngradePenalty(previousLifestyle[cat]!, tier, startYear, currentYear);
  };

  const handleSelect = (cat: keyof LifestyleSelection, tier: LifestyleTier) => {
    setSelection(prev => ({ ...prev, [cat]: tier }));
  };

  const totalMonthly = Object.values(selection).reduce((acc, tier) => {
    if (!tier) return acc;
    return acc + getNominalCost(tier.monthlyCostBase, startYear, currentYear);
  }, 0);

  const affordRatio = totalMonthly / (player.salary * 0.75 / 12);
  let affordStatus = "Comfortable";
  let affordColor = "text-positive";
  if (affordRatio > 0.75) { affordStatus = "Overextended"; affordColor = "text-negative"; }
  else if (affordRatio > 0.5) { affordStatus = "Stretching"; affordColor = "text-warning"; }

  const renderCategory = (title: string, catKey: keyof LifestyleSelection, options: LifestyleTier[]) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-white mb-4 capitalize">{title}</h3>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {options.map((t, i) => {
          const isSelected = selection[catKey]?.id === t.id;
          const nominalCost = getNominalCost(t.monthlyCostBase, startYear, currentYear);
          const penalty = getPenalty(catKey, t);

          return (
            <div 
              key={t.id} 
              onClick={() => handleSelect(catKey, t)}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-700 bg-surface hover:border-gray-500'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-white text-sm leading-tight">{t.name}</span>
                <span className="text-xs bg-gray-700 text-neutral px-1.5 py-0.5 rounded ml-2 flex-shrink-0">T{i + 1}</span>
              </div>
              <p className="text-primary font-mono text-sm mb-2">${nominalCost}/mo</p>
              <p className="text-xs text-neutral mb-3 min-h-[36px]">{t.description}</p>
              
              {penalty > 0 && (
                <div className="text-xs text-negative mb-2 bg-negative/10 p-1 rounded">
                  ⚠️ Downgrade Cost: ${penalty}
                </div>
              )}
              
              <div className="flex gap-2 text-xs">
                {t.healthEffect !== 0 && <span className={t.healthEffect > 0 ? 'text-positive' : 'text-negative'}>Health {t.healthEffect > 0 ? '+' : ''}{t.healthEffect}</span>}
                {t.reputationEffect !== 0 && <span className={t.reputationEffect > 0 ? 'text-positive' : 'text-negative'}>Rep {t.reputationEffect > 0 ? '+' : ''}{t.reputationEffect}</span>}
                {t.happinessEffect !== 0 && <span className={t.happinessEffect > 0 ? 'text-positive' : 'text-negative'}>Joy {t.happinessEffect > 0 ? '+' : ''}{t.happinessEffect}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto pb-32">
      <h2 className="text-3xl font-bold text-white mb-2">Year {currentYear}: Lifestyle Choices</h2>
      <p className="text-neutral mb-8">Set your baseline standard of living for this year. Downgrading will cost a one-time adjustment fee.</p>

      {renderCategory('Housing', 'housing', housingTiers)}
      {renderCategory('Food', 'food', foodTiers)}
      {renderCategory('Transport', 'transport', transportTiers)}
      {renderCategory('Clothing', 'clothing', clothingTiers)}

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-800 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">Projected Monthly</p>
              <p className="text-xl font-mono text-white">${totalMonthly.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider mb-1">Affordability</p>
              <p className={`text-xl font-bold ${affordColor}`}>{affordStatus}</p>
            </div>
          </div>
          
          <button 
            disabled={!isComplete}
            onClick={() => confirmLifestyleSelection(selection as LifestyleSelection)}
            className="px-8 py-3 bg-primary text-background font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all w-full sm:w-auto"
          >
            {isComplete ? 'Confirm Lifestyle' : 'Select All Categories'}
          </button>
        </div>
      </div>
    </div>
  );
};
