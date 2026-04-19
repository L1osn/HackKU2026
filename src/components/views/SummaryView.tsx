import React from 'react';
import { useGameStore } from '../../store/gameStore';

import { generateYearEndSummary } from '../../lib/summaryTextEngine';

export const SummaryView: React.FC = () => {
  const { player, currentYear, advanceYear } = useGameStore();

  const annualExpense = Object.values(player.expenses).reduce((a, b) => a + b, 0) * 12;
  const summaryText = generateYearEndSummary(player);

  return (
    <div className="min-h-[calc(100vh-90px)] flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-surface border border-gray-700 rounded-2xl p-8">
        
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Year {currentYear} Concluded</h2>
        <div className="bg-black/30 p-4 rounded-lg my-6 text-primary italic font-serif text-center border-l-4 border-primary shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
          "{summaryText}"
        </div>

        <div className="bg-background rounded-xl p-6 mb-8 font-mono">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-4">
            <span className="text-neutral">Annual Lifestyle Expenses</span>
            <span className="text-negative text-xl">-${annualExpense.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-neutral">Current Cash</span>
            <span className="text-white">${player.cash.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-800">
            <span className="text-neutral">Student Loan Debt</span>
            <span className="text-negative">${player.liabilities.studentLoan.toLocaleString()}</span>
          </div>
          {player.liabilities.creditCard > 0 && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-negative">Credit Card Balance (22% APR)</span>
              <span className="text-negative font-bold">${player.liabilities.creditCard.toLocaleString()}</span>
            </div>
          )}
        </div>

        <button 
          onClick={advanceYear}
          className="w-full py-4 text-background bg-primary hover:brightness-110 font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(0,230,118,0.3)] hover:shadow-[0_0_30px_rgba(0,230,118,0.5)]"
        >
          Advance to Next Year
        </button>
      </div>
    </div>
  );
};
