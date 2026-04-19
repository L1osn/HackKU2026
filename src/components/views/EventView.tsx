import React from 'react';
import { useGameStore } from '../../store/gameStore';

export const EventView: React.FC = () => {
  const { activeEvent, resolveActiveEvent } = useGameStore();

  if (!activeEvent) return null;

  const isPositive = activeEvent.severity === 'NORMAL_POSITIVE' || activeEvent.severity === 'WINDFALL';

  const colorClass = isPositive
    ? 'border-positive shadow-[0_0_30px_rgba(76,175,80,0.2)]'
    : 'border-negative shadow-[0_0_30px_rgba(244,67,54,0.2)]';

  const titleColor = isPositive ? 'text-positive' : 'text-negative';

  return (
    <div className="min-h-[calc(100vh-90px)] flex items-center justify-center p-4 relative">
      <div className={`max-w-xl w-full bg-surface border-2 rounded-2xl p-8 relative overflow-hidden ${colorClass}`}>
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-current to-transparent opacity-50"></div>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs tracking-widest uppercase text-secondary">
              Sudden Event
            </span>
            <span className={`text-xs px-2 py-1 rounded bg-black/50 ${titleColor} uppercase font-bold`}>
              {activeEvent.severity.replace('_', ' ')}
            </span>
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${titleColor}`}>{activeEvent.title}</h2>
          <p className="text-xl text-neutral leading-relaxed">{activeEvent.description}</p>
        </div>

        <div className="bg-background rounded-xl p-4 mb-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-secondary uppercase">Cash Impact</span>
            <span className={`text-lg font-mono font-bold ${activeEvent.cashEffect > 0 ? 'text-positive' : activeEvent.cashEffect < 0 ? 'text-negative' : 'text-neutral'}`}>
              {activeEvent.cashEffect > 0 ? '+' : ''}{activeEvent.cashEffect === 0 ? 'None' : `$${Math.abs(activeEvent.cashEffect).toLocaleString()}`}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-secondary uppercase">Health</span>
            <span className={`text-lg font-bold ${activeEvent.healthEffect > 0 ? 'text-positive' : activeEvent.healthEffect < 0 ? 'text-negative' : 'text-neutral'}`}>
              {activeEvent.healthEffect > 0 ? '+' : ''}{activeEvent.healthEffect === 0 ? 'None' : activeEvent.healthEffect}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-secondary uppercase">Reputation</span>
            <span className={`text-lg font-bold ${activeEvent.reputationEffect > 0 ? 'text-positive' : activeEvent.reputationEffect < 0 ? 'text-negative' : 'text-neutral'}`}>
              {activeEvent.reputationEffect > 0 ? '+' : ''}{activeEvent.reputationEffect === 0 ? 'None' : activeEvent.reputationEffect}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-secondary uppercase">Market Impact</span>
            <span className={`text-sm ${activeEvent.assetMultipliers ? 'text-warning' : 'text-neutral'}`}>
              {activeEvent.assetMultipliers ? 'Asset prices volatile' : 'None'}
            </span>
          </div>

          {activeEvent.salaryMultiplier && (
            <div className="flex flex-col col-span-2 pt-2 border-t border-gray-800">
              <span className="text-xs text-secondary uppercase">Salary Adjustment</span>
              <span className={`text-lg font-mono font-bold ${activeEvent.salaryMultiplier >= 1 ? 'text-positive' : 'text-negative'}`}>
                {activeEvent.salaryMultiplier >= 1 ? '+' : ''}{Math.round((activeEvent.salaryMultiplier - 1) * 100)}%
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={resolveActiveEvent}
          className="w-full py-4 font-bold text-lg rounded-xl transition-all shadow-lg text-background bg-primary hover:brightness-110"
        >
          Accept Fate
        </button>
      </div>
    </div>
  );
};
