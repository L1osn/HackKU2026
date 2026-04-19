import type { LifestyleTier, LifestyleCategory } from '../types/lifestyle';

export const housingTiers: LifestyleTier[] = [
  {
    id: 'housing-1',
    category: 'housing',
    tier: 1,
    name: '🏚️ Shared Space',
    monthlyCostBase: 715, // Midpoint of $520–$910
    description: "You split a cramped apartment with strangers or rent a basement closet. The commute is brutal and the walls are paper-thin. Chronic sleep deprivation sets in.",
    healthEffect: -8,
    reputationEffect: -8,
    happinessEffect: -8,
  },
  {
    id: 'housing-2',
    category: 'housing',
    tier: 2,
    name: '🏠 Standard Studio',
    monthlyCostBase: 1430, // Midpoint of $1,040–$1,820
    description: "A small but functional studio in a decent neighborhood. It's yours. Quiet enough to sleep, close enough to work.",
    healthEffect: 0,
    reputationEffect: 0,
    happinessEffect: 0,
  },
  {
    id: 'housing-3',
    category: 'housing',
    tier: 3,
    name: '🏢 Urban Loft',
    monthlyCostBase: 2405, // Midpoint of $1,950–$2,860
    description: "A modern apartment with amenities — gym access, doorman, upscale neighborhood. Colleagues notice your address.",
    healthEffect: 5,
    reputationEffect: 10,
    happinessEffect: 6,
  },
  {
    id: 'housing-4',
    category: 'housing',
    tier: 4,
    name: '🏡 Penthouse',
    monthlyCostBase: 3770, // Midpoint of $2,990–$4,550
    description: "A skyline view, concierge service, a premium ZIP code. You hosted a dinner party and no one left unimpressed. You feel like you've made it — for now.",
    healthEffect: 8,
    reputationEffect: 18,
    happinessEffect: 12,
    inflationTrapRisk: true,
  }
];

export const foodTiers: LifestyleTier[] = [
  {
    id: 'food-1',
    category: 'food',
    tier: 1,
    name: '🍜 Budget Prep',
    monthlyCostBase: 299, // Midpoint of $234–$364
    description: "Ramen, rice and beans, meal prep Sundays. Nutritionally marginal — your energy levels show it.",
    healthEffect: -5,
    reputationEffect: 0,
    happinessEffect: -5,
  },
  {
    id: 'food-2',
    category: 'food',
    tier: 2,
    name: '🥗 Balanced Bistro',
    monthlyCostBase: 533, // Midpoint of $416–$650
    description: "Groceries plus a few restaurant meals a week. A normal, sustainable balance.",
    healthEffect: 3,
    reputationEffect: 0,
    happinessEffect: 3,
  },
  {
    id: 'food-3',
    category: 'food',
    tier: 3,
    name: '🍣 Foodie Daily',
    monthlyCostBase: 878, // Midpoint of $715–$1,040
    description: "Lunch out every day, nicer dinners on weekends, meal kits filling the gaps. You actually enjoy eating again.",
    healthEffect: 0,
    reputationEffect: 5,
    happinessEffect: 8,
  },
  {
    id: 'food-4',
    category: 'food',
    tier: 4,
    name: '🥂 Gourmet Palette',
    monthlyCostBase: 1560, // Midpoint of $1,170–$1,950
    description: "Client dinners, tasting menus, private clubs. This is how deals get made — or so you tell yourself.",
    healthEffect: -5,
    reputationEffect: 14,
    happinessEffect: 10,
    inflationTrapRisk: true,
  }
];

export const clothingTiers: LifestyleTier[] = [
  {
    id: 'clothing-1',
    category: 'clothing',
    tier: 1,
    name: '👕 Thrifty Basics',
    monthlyCostBase: 39, // Midpoint of ~$22–$55
    description: "Thrift stores, hand-me-downs, the same five shirts rotating. Functional. People notice in interviews.",
    healthEffect: 0,
    reputationEffect: -6,
    happinessEffect: -3,
  },
  {
    id: 'clothing-2',
    category: 'clothing',
    tier: 2,
    name: '👔 Casual Wear',
    monthlyCostBase: 98, // Midpoint of ~$65–$130
    description: "A reasonable wardrobe — quality basics, occasional splurge. Looks put together without trying too hard.",
    healthEffect: 0,
    reputationEffect: 0,
    happinessEffect: 0,
  },
  {
    id: 'clothing-3',
    category: 'clothing',
    tier: 3,
    name: '🧥 Professional Edge',
    monthlyCostBase: 205, // Midpoint of ~$140–$270
    description: "Quality work clothes, a few name brands, dressing for the job you want. Promotions notice.",
    healthEffect: 0,
    reputationEffect: 8,
    happinessEffect: 5,
  },
  {
    id: 'clothing-4',
    category: 'clothing',
    tier: 4,
    name: '💎 Luxury Brand',
    monthlyCostBase: 466, // Midpoint of ~$282–$650
    description: "Statement pieces, limited drops, full designer fits. You look like old money — and it opens doors.",
    healthEffect: 0,
    reputationEffect: 18,
    happinessEffect: 8,
    inflationTrapRisk: true,
  }
];

export const transportTiers: LifestyleTier[] = [
  {
    id: 'transport-1',
    category: 'transport',
    tier: 1,
    name: '🚶 Commuter',
    monthlyCostBase: 20, // Midpoint of $0–$39
    description: "No car, no transit pass. You walk or cycle everywhere. Limits where you can live and work — but keeps you fit.",
    healthEffect: 8,
    reputationEffect: -5,
    happinessEffect: -4,
  },
  {
    id: 'transport-2',
    category: 'transport',
    tier: 2,
    name: '🚌 Transit Pass',
    monthlyCostBase: 156, // Midpoint of $104–$208
    description: "Bus, subway, or light rail. Reliable in cities, nonexistent in suburbs. Practical and pollution-free.",
    healthEffect: 3,
    reputationEffect: 0,
    happinessEffect: 0,
  },
  {
    id: 'transport-3',
    category: 'transport',
    tier: 3,
    name: '🚗 Economy Ride',
    monthlyCostBase: 553, // Midpoint of $390–$715
    description: "A used or entry-level new car. Freedom and flexibility — but gas, insurance, and maintenance bleed you dry.",
    healthEffect: 0,
    reputationEffect: 6,
    happinessEffect: 5,
  },
  {
    id: 'transport-4',
    category: 'transport',
    tier: 4,
    name: '🚘 Premium Drive',
    monthlyCostBase: 1105, // Midpoint of $780–$1,430
    description: "A new, premium vehicle. Colleagues notice it in the parking lot. Clients take you seriously. The lease payment does not care.",
    healthEffect: 0,
    reputationEffect: 16,
    happinessEffect: 8,
    inflationTrapRisk: true,
  }
];

export const getTiersByCategory = (category: LifestyleCategory): LifestyleTier[] => {
  switch (category) {
    case 'housing': return housingTiers;
    case 'food': return foodTiers;
    case 'clothing': return clothingTiers;
    case 'transport': return transportTiers;
  }
};
