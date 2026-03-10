import { useMemo } from 'react';
import { useFormStore } from '../store/useFormStore';
import { useMenuItems } from './useMenuItems';
import { usePricingTiers } from './usePricingTiers';
import { PRICING_NOTES } from '../config/pricing';
import type { PriceEstimate } from '../types/pricing';

export function useBuyoutPricing(): PriceEstimate | null {
  const { buyoutData } = useFormStore();
  const { mealType, barOption, headcount } = buyoutData;
  const { mealPricing, barPricing } = usePricingTiers();

  return useMemo(() => {
    if (!mealType || !barOption) return null;

    const meal = mealPricing.find((m) => m.mealType === mealType);
    const bar = barPricing.find((b) => b.barOption === barOption);
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
  }, [mealType, barOption, headcount, mealPricing, barPricing]);
}

export function useToGoPricing(): PriceEstimate | null {
  const { togoData } = useFormStore();
  const { selectedDishes, headcount } = togoData;
  const { items: menuItems } = useMenuItems();

  return useMemo(() => {
    if (selectedDishes.length === 0) return null;

    let totalPerPerson = 0;
    for (const sel of selectedDishes) {
      const item = menuItems.find((m) => m.id === sel.dishId);
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
  }, [selectedDishes, headcount, menuItems]);
}
