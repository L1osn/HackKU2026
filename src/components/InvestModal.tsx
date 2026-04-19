import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { AssetClass } from '../types/game';
import { ASSET_MIN_BUY } from '../types/game';

interface InvestModalProps {
  asset: AssetClass;
  onClose: () => void;
}

export const InvestModal: React.FC<InvestModalProps> = ({ asset, onClose }) => {
  const store = useGameStore();
  const { player, executeInvestAction, globalActionCount } = store;
  
  const [isBuy, setIsBuy] = useState(true);
  const [amount, setAmount] = useState(0);

  const currentBalance = player.assets[asset];
  const cash = player.cash;
  const cooldownEnd = player.assetCooldowns[asset];
  const isCooldown = globalActionCount < cooldownEnd;
  const actionsRemaining = cooldownEnd - globalActionCount;

  const minBuy = ASSET_MIN_BUY[asset] ?? 0;
  const maxAmount = isBuy ? cash : currentBalance;
  const belowMinimum = isBuy && minBuy > 0 && amount > 0 && amount < minBuy;
  const cantAffordMinimum = isBuy && minBuy > 0 && cash < minBuy;

  const handleConfirm = () => {
    executeInvestAction(asset, isBuy, amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-surface border border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-6">
        
        <div className="text-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white capitalize">{asset.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <p className="text-sm text-secondary mt-1 cursor-pointer hover:text-primary transition-colors">
            📖 Review guide
          </p>
        </div>

        <div className="bg-background rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-secondary">Current Holdings:</span>
            <span className="text-white font-mono font-medium">${currentBalance.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-secondary">Available Cash:</span>
            <span className="text-white font-mono font-medium">${cash.toLocaleString()}</span>
          </div>

          {!isBuy && isCooldown && (
            <div className="mt-2 bg-warning/10 text-warning text-xs p-2 rounded flex items-center gap-2">
              <span>🔒</span> Cannot sell yet. Cooldown ends in {actionsRemaining} action{actionsRemaining > 1 ? 's' : ''}.
            </div>
          )}

          {isBuy && minBuy > 0 && (
            <div className={`mt-2 text-xs p-2 rounded flex items-center gap-2 ${cantAffordMinimum ? 'bg-negative/10 text-negative' : 'bg-gray-800 text-secondary'}`}>
              <span>{cantAffordMinimum ? '🚫' : 'ℹ️'}</span>
              Minimum purchase: <strong className="text-white">${minBuy.toLocaleString()}</strong>
              {cantAffordMinimum && <span className="ml-1">— insufficient cash</span>}
            </div>
          )}
        </div>

        <div className="flex bg-background rounded-lg p-1">
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isBuy ? 'bg-primary text-background' : 'text-neutral hover:bg-surface'}`}
            onClick={() => { setIsBuy(true); setAmount(0); }}
          >
            BUY
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isBuy ? 'bg-primary text-background' : 'text-neutral hover:bg-surface'} ${isCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => { 
              if (!isCooldown) { setIsBuy(false); setAmount(0); }
            }}
          >
            SELL
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-secondary flex justify-between">
            <span>Amount to {isBuy ? 'buy' : 'sell'}:</span>
            <span className="text-white font-mono">${amount.toLocaleString()}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max={maxAmount} 
            step={Math.max(1, Math.floor(maxAmount / 100))}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-primary"
            disabled={!isBuy && isCooldown}
          />
          <div className="flex justify-between text-xs text-secondary font-mono mt-1">
            <span>$0</span>
            <span>${maxAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700 flex gap-3 mt-2">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-lg text-neutral bg-surface border border-gray-600 hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={amount === 0 || (!isBuy && isCooldown) || belowMinimum || cantAffordMinimum}
            className="flex-1 py-3 rounded-lg bg-primary text-background font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
