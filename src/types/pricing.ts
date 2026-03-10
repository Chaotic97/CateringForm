import type { MealType, BarOption } from './form';

export interface MealTypePricing {
  mealType: MealType;
  label: string;
  description: string;
  pricePerPersonLow: number;
  pricePerPersonHigh: number;
  minimumHeadcount: number;
  includedCourses: number;
}

export interface BarPricing {
  barOption: BarOption;
  label: string;
  description: string;
  pricePerPersonLow: number;
  pricePerPersonHigh: number;
}

export interface PriceEstimate {
  foodLow: number;
  foodHigh: number;
  barLow: number;
  barHigh: number;
  totalLow: number;
  totalHigh: number;
  headcount: number;
  notes: string[];
}
