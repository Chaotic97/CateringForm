import { useMemo } from 'react';
import { useFormStore } from '../store/useFormStore';
import { MEAL_TYPE_PRICING, BAR_PRICING, PRICING_NOTES } from '../config/pricing';
import { MENU_ITEMS } from '../config/menu-items';
import type { PriceEstimate } from '../types/pricing';

export function useBuyoutPricing(): PriceEstimate | null {
  const { buyoutData } = useFormStore();
  const { mealType, barOption, headcount } = buyoutData;

  return useMemo(() => {
    if (!mealType || !barOption) return null;

    const meal = MEAL_TYPE_PRICING.find((m) => m.mealType === mealType);
    const bar = BAR_PRICING.find((b) => b.barOption === barOption);
    if (!meal || !bar) return null;

    const foodLow = meal.pricePerPersonLow * headcount;
    const foodHigh = meal.pricePerPersonHigh * headcount;
    const barLow = bar.pricePerPersonLow * headcount;
    const barHigh = bar.pricePerPersonHigh * headcount;

    return {
      foodLow,
      foodHigh,
      barLow,
      barHigh,
      totalLow: foodLow + barLow,
      totalHigh: foodHigh + barHigh,
      headcount,
      notes: [...PRICING_NOTES],
    };
  }, [mealType, barOption, headcount]);
}

export function useToGoPricing(): PriceEstimate | null {
  const { togoData } = useFormStore();
  const { selectedDishes, headcount } = togoData;

  return useMemo(() => {
    if (selectedDishes.length === 0) return null;

    let totalPerPerson = 0;
    for (const sel of selectedDishes) {
      const item = MENU_ITEMS.find((m) => m.id === sel.dishId);
      if (item) {
        totalPerPerson += item.pricePerPerson;
      }
    }

    const total = totalPerPerson * headcount;

    return {
      foodLow: total,
      foodHigh: total,
      barLow: 0,
      barHigh: 0,
      totalLow: total,
      totalHigh: total,
      headcount,
      notes: ['Tax not included', 'Pickup only', 'Final pricing confirmed upon order'],
    };
  }, [selectedDishes, headcount]);
}
