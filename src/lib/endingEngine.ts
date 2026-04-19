import type { PlayerState } from '../types/game';

export type EndingType = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface Ending {
  id: string;
  title: string;
  description: string;
  type: EndingType;
}

export const calculateEnding = (player: PlayerState, realNetWorth: number, startNetWorth: number): Ending => {
  const { health, happiness, reputation } = player;
  
  const isRich = realNetWorth > 500000;
  const isComfortable = realNetWorth > 100000 && realNetWorth <= 500000;
  const isBroke = realNetWorth < 0;
  
  const isHappy = happiness >= 60;
  const isHealthy = health >= 60;
  const isRespected = reputation >= 60;
  
  const startedInDebt = startNetWorth < -20000;

  if (isRich && isHappy && isHealthy) {
    return {
      id: 'american_dream',
      title: 'The American Dream',
      description: 'You built significant wealth without sacrificing your health or soul. A rare and spectacular victory.',
      type: 'POSITIVE'
    };
  }

  if (isRich && (!isHealthy || !isHappy)) {
    return {
      id: 'wolf_of_wall_street',
      title: 'The Wolf of Wall Street',
      description: 'You made the money, but at what cost? Your health and happiness were left behind in the pursuit of wealth.',
      type: 'NEUTRAL'
    };
  }

  if (startedInDebt && realNetWorth > 0 && isRespected) {
    return {
      id: 'the_phoenix',
      title: 'The Phoenix',
      description: 'You started in a massive hole of debt and fought your way out to respectability. A true comeback story.',
      type: 'POSITIVE'
    };
  }

  if (isComfortable && isHappy) {
    return {
      id: 'quiet_millionaire',
      title: 'The Quiet Life',
      description: 'You did not become a billionaire, but you found a sustainable, happy balance. Sometimes enough is exactly enough.',
      type: 'POSITIVE'
    };
  }

  if (isComfortable && !isHappy && !isHealthy) {
    return {
      id: 'the_burnout',
      title: 'The Corporate Burnout',
      description: 'You survived the rat race and made decent money, but you feel empty and exhausted.',
      type: 'NEGATIVE'
    };
  }

  if (isBroke && isHappy) {
    return {
      id: 'enlightened_monk',
      title: 'The Enlightened Minimalist',
      description: 'You are completely broke, but surprisingly happy. You realized money is not the only currency in life.',
      type: 'NEUTRAL'
    };
  }

  if (isBroke && !isHappy) {
    return {
      id: 'debt_spiral',
      title: 'The Debt Spiral',
      description: 'Crushed by compound interest and bad luck. The financial system chewed you up and spit you out.',
      type: 'NEGATIVE'
    };
  }

  // Fallback
  return {
    id: 'average_joe',
    title: 'The Average Experience',
    description: 'You survived. You made some money, lost some money. Just another player in the game of life.',
    type: 'NEUTRAL'
  };
};
