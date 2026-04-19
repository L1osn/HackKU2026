import React from 'react';
import type { AssetClass } from '../types/game';

export interface FactCard {
  id: AssetClass;
  name: string;
  content: string;
  era: string;
  keyTakeaway: string;
}

export const FACT_CARDS: FactCard[] = [
  {
    id: 'savingsAccount',
    name: 'Savings Account',
    content: 'A savings account is a secure place to store cash. It is FDIC insured, meaning you cannot lose your principal. The interest rate is tied to the Federal Reserve. During the 2010s, rates were near 0%, meaning your money lost purchasing power to inflation. In 2024, rates reached 4.5%+, offering a decent safe return.',
    era: 'All Eras',
    keyTakeaway: 'Preserves wealth but does not build it.'
  },
  {
    id: 'bonds',
    name: 'Bonds',
    content: 'Bonds are loans you make to corporations or governments. They pay a fixed "coupon" interest rate. However, bond prices fall when new interest rates rise. 2022 was the worst year in modern bond history (-13%) because the Fed hiked rates aggressively.',
    era: 'All Eras',
    keyTakeaway: 'Stable yield, but vulnerable to interest rate shocks.'
  },
  {
    id: 'stocks',
    name: 'Stocks / Index Funds',
    content: 'An index fund owns tiny slices of hundreds of companies. It is highly diversified. Over a 50-year history, the market has crashed severely multiple times (-57% in 2008), but patient holders who did not panic sell recovered their losses every time.',
    era: 'All Eras',
    keyTakeaway: 'High long-term growth, requires emotional discipline during crashes.'
  },
  {
    id: 'options',
    name: 'Options',
    content: 'Options are contracts that let you bet on the direction of a stock with high leverage. If the stock does not move as expected by the expiration date, the option expires worthless (a total loss). Most retail options trades lose money.',
    era: 'Modern Era',
    keyTakeaway: 'Extreme leverage amplifies both gains and total losses.'
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    content: 'A digital asset secured by blockchain. It produces no underlying yield and its value is driven purely by speculation. The history is defined by massive bubbles and 70-80% crashes. Survivorship bias makes people only hear about the winners.',
    era: 'Post-2009',
    keyTakeaway: 'Extreme volatility with no fundamental floor price.'
  },
  {
    id: 'gold',
    name: 'Gold',
    content: 'Gold is a physical commodity that pays no yield. It historically performs best when people lose faith in paper money or during high inflation (like the 1970s). However, from 1980 to 2001, it sat in a 20-year bear market.',
    era: 'All Eras',
    keyTakeaway: 'A crisis hedge, not an engine for compound growth.'
  },
  {
    id: 'retirement',
    name: 'Retirement (401k/IRA)',
    content: 'Tax-advantaged investment accounts. If your employer offers a "match," it is literal free money. There is a penalty for early withdrawal. Starting a decade earlier is mathematically worth roughly $1,000,000 in your final balance due to compound growth.',
    era: 'Post-1978',
    keyTakeaway: 'The single most powerful wealth-building tool for normal people.'
  },
  {
    id: 'property',
    name: 'Real Estate / Property',
    content: 'Property appreciates over time but carries high holding costs: mortgage interest, property tax, and maintenance. It is highly illiquid. While generally stable, the 2008 crash proved house prices can and do fall nationally.',
    era: 'All Eras',
    keyTakeaway: 'A forced savings mechanism that provides housing and leverage.'
  },
  {
    id: 'vehicle',
    name: 'Vehicles',
    content: 'Vehicles are depreciating assets. Their value drops the moment you buy them and continues falling to zero. The "Total Cost of Ownership" includes gas, insurance, and maintenance, making them a significant continuous drain on cash flow.',
    era: 'All Eras',
    keyTakeaway: 'A utility expense, never an investment.'
  }
];

const SEEN_ASSETS_KEY = 'life-after-grad:seenAssets';

const loadSeenAssets = (): AssetClass[] => {
  try {
    const raw = localStorage.getItem(SEEN_ASSETS_KEY);
    if (raw) return JSON.parse(raw) as AssetClass[];
  } catch { /* ignore */ }
  return [];
};

export const KnowledgeHub: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const unlocked = loadSeenAssets();

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Knowledge Hub</h1>
            <p className="text-secondary">
              {unlocked.length} of {FACT_CARDS.length} concepts unlocked across your playthroughs.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-surface border border-gray-700 text-white rounded hover:bg-gray-800 transition"
          >
            Back to Game
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {FACT_CARDS.map(card => {
            const isUnlocked = unlocked.includes(card.id);
            return (
              <div 
                key={card.id}
                className={`border rounded-xl p-5 flex flex-col gap-3 ${isUnlocked ? 'border-gray-700 bg-surface' : 'border-gray-800 bg-background/50 opacity-60'}`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-white text-lg">{isUnlocked ? card.name : '???'}</h3>
                  {!isUnlocked && <span className="text-secondary">🔒</span>}
                </div>
                
                {isUnlocked ? (
                  <>
                    <span className="text-xs text-primary bg-primary/10 w-fit px-2 py-1 rounded">
                      Era: {card.era}
                    </span>
                    <p className="text-sm text-neutral leading-relaxed flex-1">
                      {card.content}
                    </p>
                    <div className="mt-2 pt-3 border-t border-gray-800">
                      <p className="text-xs font-bold text-white uppercase mb-1">Key Takeaway</p>
                      <p className="text-sm text-secondary italic">"{card.keyTakeaway}"</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-secondary flex-1 italic mt-4">
                    Encounter this asset during gameplay to unlock its knowledge card.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">Era Index</h2>
        <div className="bg-surface border border-gray-700 rounded-xl overflow-hidden mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/50 text-secondary border-b border-gray-700">
              <tr>
                <th className="p-4 font-medium">Era</th>
                <th className="p-4 font-medium">Defining Characteristic</th>
                <th className="p-4 font-medium">New Grad Environment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {/* ── 1920s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1920–1928</td>
                <td className="p-4 text-neutral">Roaring Twenties; booming stocks, easy credit, mass adoption of cars and radio.</td>
                <td className="p-4 text-positive">Strong — industrial expansion created abundant white-collar jobs.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1929–1932</td>
                <td className="p-4 text-neutral">Wall Street Crash; Dow fell 89%; bank failures; beginning of the Great Depression.</td>
                <td className="p-4 text-negative">Catastrophic — 25% unemployment; any job was a privilege.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1933–1939</td>
                <td className="p-4 text-neutral">New Deal era; slow recovery; Social Security created; gold standard partially abandoned.</td>
                <td className="p-4 text-negative">Difficult — recovery was uneven; savings earned almost nothing.</td>
              </tr>
              {/* ── 1940s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1940–1945</td>
                <td className="p-4 text-neutral">WWII mobilization; full employment via war production; rationing; bonds sold as "war bonds."</td>
                <td className="p-4 text-warning">Mixed — full employment but consumption constrained; inflation suppressed artificially.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1946–1949</td>
                <td className="p-4 text-neutral">Post-war adjustment; brief inflation spike; GI Bill fuels college enrollment and suburban housing boom.</td>
                <td className="p-4 text-positive">Good — GI Bill opened college access; housing demand surged.</td>
              </tr>
              {/* ── 1950s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1950–1959</td>
                <td className="p-4 text-neutral">Post-war prosperity; suburban expansion; TV era; Dow tripled; pension culture at peak.</td>
                <td className="p-4 text-positive">Excellent — corporate hiring was aggressive; defined-benefit pensions were standard.</td>
              </tr>
              {/* ── 1960s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1960–1969</td>
                <td className="p-4 text-neutral">Kennedy/Johnson growth era; space race; Vietnam War spending; civil rights era; late-decade inflation begins.</td>
                <td className="p-4 text-positive">Strong — low unemployment; government and defense sector booming.</td>
              </tr>
              {/* ── 1970s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1970–1979</td>
                <td className="p-4 text-neutral">Stagflation decade; oil shocks (1973, 1979); Nixon ends gold standard; inflation peaked at 14%; gold +500%.</td>
                <td className="p-4 text-negative">Harsh — real wages fell; saving in cash destroyed wealth.</td>
              </tr>
              {/* ── 1980s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1980–1989</td>
                <td className="p-4 text-neutral">Volcker rate shock (20% Fed rate) kills inflation; Reagan tax cuts; corporate mergers; Dow 5× by decade end; 401(k) introduced 1978, mass adoption begins.</td>
                <td className="p-4 text-positive">Strong rebound — high-yield bonds and equities rewarded early adopters.</td>
              </tr>
              {/* ── 1990s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">1990–1999</td>
                <td className="p-4 text-neutral">Internet revolution; longest peacetime expansion; NASDAQ 10× in the decade; dot-com mania peaks in 1999.</td>
                <td className="p-4 text-positive">Exceptional — tech hiring frenzy; index funds becoming mainstream.</td>
              </tr>
              {/* ── 2000s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2000–2002</td>
                <td className="p-4 text-neutral">Dot-com bust; NASDAQ −78%; 9/11; recession; overvalued tech stocks collapse.</td>
                <td className="p-4 text-negative">Tough — tech hiring froze; first mover advantage evaporated.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2003–2007</td>
                <td className="p-4 text-neutral">Housing bubble inflates; cheap credit; derivatives proliferate; "nobody thought home prices could fall."</td>
                <td className="p-4 text-positive">Good — credit easy; real estate gains felt universal.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2008–2009</td>
                <td className="p-4 text-neutral">Global Financial Crisis; Lehman Brothers collapses; S&amp;P −57%; housing −30%; TARP bailout.</td>
                <td className="p-4 text-negative">Generational scarring — class of 2008/09 permanently lower lifetime earnings vs. peers.</td>
              </tr>
              {/* ── 2010s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2010–2019</td>
                <td className="p-4 text-neutral">ZIRP decade; zero interest rates crush savers; stocks 4× (S&amp;P); rise of passive investing; gig economy; student debt crisis.</td>
                <td className="p-4 text-warning">Mixed — stocks rewarded holders, cash savers punished; housing recovery locked out many grads.</td>
              </tr>
              {/* ── 2020s ─────────────────────────────────────────────── */}
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2020</td>
                <td className="p-4 text-neutral">COVID-19 crash (−34% in 33 days); Fed prints $3T; fastest recovery in history; crypto awakens.</td>
                <td className="p-4 text-warning">Volatile — remote work opened doors; macro chaos required nerve to stay invested.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2021</td>
                <td className="p-4 text-neutral">Post-pandemic boom; stimulus cash, crypto euphoria, remote work, meme stocks.</td>
                <td className="p-4 text-warning">Mixed — income opportunities high, housing unaffordable.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2022</td>
                <td className="p-4 text-neutral">Inflation shock; Fed rate hikes crush bonds and crypto; bear market; worst bond year since 1788.</td>
                <td className="p-4 text-negative">Unfavorable — expenses rise, savings eroded.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2023</td>
                <td className="p-4 text-neutral">Inflation cools; tech layoffs; ChatGPT sparks AI race; stocks recover sharply.</td>
                <td className="p-4 text-warning">Mixed — depends heavily on sector.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2024</td>
                <td className="p-4 text-neutral">Soft landing; rate cuts begin; record stock highs; Bitcoin ETF approved; crypto ETF era.</td>
                <td className="p-4 text-positive">Favorable — investment conditions improve.</td>
              </tr>
              <tr className="hover:bg-gray-800/30">
                <td className="p-4 font-mono text-white">2025</td>
                <td className="p-4 text-neutral">AI adoption accelerates; continued bull market; post-halving crypto rally; high-yield savings at peak.</td>
                <td className="p-4 text-positive">Strong — tech and finance sectors expanding.</td>
              </tr>
              <tr className="hover:bg-gray-800/30 bg-primary/5">
                <td className="p-4 font-mono text-primary font-bold">2026</td>
                <td className="p-4 text-neutral">Normalized rates; mature AI economy; broad equity growth 12–14%; bond yields 7–9%; gold strength.</td>
                <td className="p-4 text-primary font-semibold">Current year — your journey begins here.</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
