import type { MealTypePricing, BarPricing } from '../types/pricing';

// PLACEHOLDER PRICING — Replace with actual Sum Bar pricing
export const MEAL_TYPE_PRICING: MealTypePricing[] = [
  {
    mealType: 'tasting',
    label: 'Tasting Menu',
    description: 'A curated multi-course journey through Sum Bar\'s signature dishes',
    pricePerPersonLow: 85,
    pricePerPersonHigh: 120,
    minimumHeadcount: 20,
    includedCourses: 6,
  },
  {
    mealType: 'family-style',
    label: 'Family Style',
    description: 'Shared platters for the table — the way Chinese food is meant to be enjoyed',
    pricePerPersonLow: 65,
    pricePerPersonHigh: 95,
    minimumHeadcount: 15,
    includedCourses: 5,
  },
  {
    mealType: 'buffet',
    label: 'Buffet',
    description: 'An abundant spread with carving stations and live wok cooking',
    pricePerPersonLow: 55,
    pricePerPersonHigh: 80,
    minimumHeadcount: 25,
    includedCourses: 8,
  },
  {
    mealType: 'small-bites',
    label: 'Small Bites',
    description: 'Cocktail-style passed appetizers and dim sum — perfect for mingling',
    pricePerPersonLow: 40,
    pricePerPersonHigh: 65,
    minimumHeadcount: 15,
    includedCourses: 6,
  },
];

export const BAR_PRICING: BarPricing[] = [
  {
    barOption: 'open-bar',
    label: 'Open Bar',
    description: 'Full cocktail, wine, and beer service for all guests',
    pricePerPersonLow: 35,
    pricePerPersonHigh: 55,
  },
  {
    barOption: 'cash-bar',
    label: 'Cash Bar',
    description: 'Guests purchase their own drinks — no additional cost to host',
    pricePerPersonLow: 0,
    pricePerPersonHigh: 0,
  },
  {
    barOption: 'pairings',
    label: 'Curated Pairings',
    description: 'Sommelier-selected wine and cocktail pairings with each course',
    pricePerPersonLow: 25,
    pricePerPersonHigh: 40,
  },
  {
    barOption: 'none',
    label: 'No Bar',
    description: 'Non-alcoholic beverages only — tea, soft drinks, and water service',
    pricePerPersonLow: 0,
    pricePerPersonHigh: 0,
  },
];

export const VENUE_CAPACITY = 80;

export const PRICING_NOTES = [
  'Tax and gratuity not included',
  'Final pricing confirmed by your event coordinator',
  'Prices may vary based on menu customization',
];
