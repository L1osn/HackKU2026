import React, { useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { calculateEnding } from '../../lib/endingEngine';
import { getCumulativeInflation } from '../../lib/financeEngine';

export const EndView: React.FC = () => {
  const { player, startYear, currentYear, resetGame } = useGameStore();

  const ending = useMemo(() => {
    const assetTotal = Object.values(player.assets).reduce((a, b) => a + b, 0);
    const debtTotal = Object.values(player.liabilities).reduce((a, b) => a + b, 0);
    const nominalNetWorth = player.cash + assetTotal - debtTotal;
    
    // To match startNW calculation in simulate.ts:
    const startNW = player.profile ? player.profile.savings - player.profile.debt : 0;
    
    const inflationMultiplier = getCumulativeInflation(startYear, currentYear);
    const realNetWorth = nominalNetWorth / inflationMultiplier;
    
    return {
      result: calculateEnding(player, realNetWorth, startNW),
      nominalNetWorth,
      realNetWorth,
      inflationMultiplier
    };
  }, [player, startYear, currentYear]);

  const { result, nominalNetWorth, realNetWorth, inflationMultiplier } = ending;

  const colorClass = result.type === 'POSITIVE' ? 'text-positive border-positive' : result.type === 'NEGATIVE' ? 'text-negative border-negative' : 'text-primary border-primary';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-xl tracking-[0.3em] text-secondary uppercase mb-2">Simulation Complete</h1>
          <h2 className={`text-5xl font-bold mb-6 ${colorClass}`}>{result.title}</h2>
          <p className="text-xl text-neutral italic">"{result.description}"</p>
        </div>

        <div className="bg-surface border border-gray-800 rounded-2xl p-8 mb-8 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-secondary uppercase text-xs tracking-widest mb-4">Financial Outcome</h3>
            <div className="space-y-4 font-mono">
              <div>
                <p className="text-neutral text-sm">Nominal Net Worth ({currentYear} Dollars)</p>
                <p className={`text-2xl font-bold ${nominalNetWorth >= 0 ? 'text-positive' : 'text-negative'}`}>
                  ${nominalNetWorth.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-neutral text-sm">Real Net Worth ({startYear} Purchasing Power)</p>
                <p className={`text-xl ${realNetWorth >= 0 ? 'text-positive' : 'text-negative'}`}>
                  ${Math.round(realNetWorth).toLocaleString()}
                </p>
                <p className="text-xs text-secondary mt-1">Inflation factor: {inflationMultiplier.toFixed(2)}x</p>
              </div>
              <div className="pt-4 border-t border-gray-800">
                <p className="text-neutral text-sm">Final Salary</p>
                <p className="text-white">${player.salary.toLocaleString()}/yr</p>
              </div>
              <div>
                <p className="text-neutral text-sm">Historical Max Savings</p>
                <p className="text-primary">${player.maxSavings.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-neutral text-sm">Total Debt Remaining</p>
                <p className="text-negative">${(player.liabilities.studentLoan + player.liabilities.creditCard).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-secondary uppercase text-xs tracking-widest mb-4">Life Outcome</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral">Health</span>
                  <span className="text-white">{player.health}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${player.health > 60 ? 'bg-positive' : player.health > 30 ? 'bg-warning' : 'bg-negative'}`} style={{ width: `${player.health}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral">Reputation</span>
                  <span className="text-white">{player.reputation}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className={`h-2 rounded-full ${player.reputation > 60 ? 'bg-positive' : player.reputation > 30 ? 'bg-warning' : 'bg-negative'}`} style={{ width: `${player.reputation}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-neutral">Happiness (Hidden)</span>
                  <span className="text-white">???</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-gray-600 w-full opacity-50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={resetGame}
          className="w-full py-4 text-white border border-gray-600 hover:bg-surface font-bold text-lg rounded-xl transition-all"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};
