import { useState, useEffect } from 'react';
import { MEAL_TYPE_PRICING, BAR_PRICING } from '../config/pricing';
import type { MealTypePricing, BarPricing } from '../types/pricing';

interface PricingTier {
  type: string;
  key: string;
  label: string;
  description: string;
  pricePerPersonLow: number;
  pricePerPersonHigh: number;
  minimumHeadcount: number | null;
  includedCourses: number | null;
}

let cachedMeal: MealTypePricing[] | null = null;
let cachedBar: BarPricing[] | null = null;

export function usePricingTiers() {
  const [mealPricing, setMealPricing] = useState<MealTypePricing[]>(cachedMeal ?? MEAL_TYPE_PRICING);
  const [barPricing, setBarPricing] = useState<BarPricing[]>(cachedBar ?? BAR_PRICING);
  const [loading, setLoading] = useState(!cachedMeal);

  useEffect(() => {
    if (cachedMeal) return;
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((tiers: PricingTier[]) => {
        const meal: MealTypePricing[] = tiers
          .filter((t) => t.type === 'meal')
          .map((t) => ({
            mealType: t.key as MealTypePricing['mealType'],
            label: t.label,
            description: t.description,
            pricePerPersonLow: t.pricePerPersonLow,
            pricePerPersonHigh: t.pricePerPersonHigh,
            minimumHeadcount: t.minimumHeadcount ?? 0,
            includedCourses: t.includedCourses ?? 0,
          }));
        const bar: BarPricing[] = tiers
          .filter((t) => t.type === 'bar')
          .map((t) => ({
            barOption: t.key as BarPricing['barOption'],
            label: t.label,
            description: t.description,
            pricePerPersonLow: t.pricePerPersonLow,
            pricePerPersonHigh: t.pricePerPersonHigh,
          }));
        cachedMeal = meal;
        cachedBar = bar;
        setMealPricing(meal);
        setBarPricing(bar);
      })
      .catch(() => {
        cachedMeal = MEAL_TYPE_PRICING;
        cachedBar = BAR_PRICING;
      })
      .finally(() => setLoading(false));
  }, []);

  return { mealPricing, barPricing, loading };
}
