import type { JobOffer, PlayerState } from '../types/game';

const SECTORS = [
  { icon: '🏢', name: 'Corporate' },
  { icon: '💻', name: 'Tech' },
  { icon: '🏥', name: 'Healthcare' },
  { icon: '🎓', name: 'Education' },
  { icon: '🏗️', name: 'Construction' },
  { icon: '🍽️', name: 'Service' },
  { icon: '📊', name: 'Finance' },
  { icon: '🎨', name: 'Creative' }
];

const COMPANY_PREFIXES = ['Global', 'Apex', 'Nova', 'Summit', 'Pioneer', 'Horizon', 'Nexus', 'Vertex', 'Dynamic', 'Prime'];
const COMPANY_SUFFIXES = ['Solutions', 'Group', 'Partners', 'Systems', 'Ventures', 'Holdings', 'Corp', 'Network'];

const JOB_TITLES = ['Associate', 'Specialist', 'Coordinator', 'Analyst', 'Manager', 'Consultant', 'Director'];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateJobOffers = (player: PlayerState): JobOffer[] => {
  const { salary: currentSalary, reputation, health, stableExperience, education } = player;

  const isGood = reputation > 66;
  const isMedium = reputation > 33 && reputation <= 66;
  
  const generateOffer = (multiplier: number, volatility: number, tier: JobOffer['tier']): JobOffer => {
    const base = currentSalary * multiplier;
    const finalSalary = Math.round(base + (Math.random() * volatility * 2 - volatility));
    
    const sector = SECTORS[rand(0, SECTORS.length - 1)];
    const companyName = `${COMPANY_PREFIXES[rand(0, COMPANY_PREFIXES.length - 1)]} ${COMPANY_SUFFIXES[rand(0, COMPANY_SUFFIXES.length - 1)]}`;
    const title = JOB_TITLES[rand(0, JOB_TITLES.length - 1)];
    
    let description = '';
    if (multiplier >= 1.2) description = "Fast-paced environment with high expectations.";
    else if (multiplier >= 1.0) description = "Solid, stable role with a normal work-life balance.";
    else description = "Underfunded department. They need bodies, and they need them yesterday.";

    // Qualifications logic
    let isQualified = true;
    let requirementText = '';

    if (tier === 'MID') {
      isQualified = stableExperience >= 1 || education.hasDegree;
      requirementText = 'Requires 1+ Yr Stable Exp OR Grad Degree';
    } else if (tier === 'SENIOR') {
      isQualified = stableExperience >= 3 && education.hasDegree;
      requirementText = 'Requires 3+ Yrs Stable Exp AND Grad Degree';
    } else if (tier === 'ELITE') {
      isQualified = stableExperience >= 3 && education.hasDegree && reputation > 66 && health > 66;
      requirementText = 'Requires 3+ Yrs Stable Exp, Grad Degree, Good Rep & Health';
    } else {
      requirementText = 'No specific requirements';
    }

    return {
      id: crypto.randomUUID(),
      companyName,
      jobTitle: `${title} - ${sector.name}`,
      salary: finalSalary,
      description,
      sectorIcon: sector.icon,
      tier,
      isQualified,
      requirementText
    };
  };

  const offers: JobOffer[] = [];

  // Provide a mix of tiers based on reputation to give aspirational but unselectable options
  if (isGood) {
    offers.push(generateOffer(1.1, 5000, 'MID'));
    offers.push(generateOffer(1.4, 10000, 'SENIOR'));
    offers.push(generateOffer(1.8, 20000, 'ELITE')); // Elite high-paying but strict requirements
  } else if (isMedium) {
    offers.push(generateOffer(0.9, 5000, 'ENTRY'));
    offers.push(generateOffer(1.1, 8000, 'MID'));
    offers.push(generateOffer(1.4, 10000, 'SENIOR')); 
  } else {
    offers.push(generateOffer(1.0, 5000, 'ENTRY'));
    offers.push(generateOffer(0.8, 5000, 'ENTRY'));
    offers.push(generateOffer(1.2, 8000, 'MID')); 
  }

  // Shuffle array
  return offers.sort(() => Math.random() - 0.5);
};
