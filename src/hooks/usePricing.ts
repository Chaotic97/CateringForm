import { useMemo } from 'react';
import { useFormStore } from '../store/useFormStore';
import { useMenuItems } from './useMenuItems';
import { usePricingTiers } from './usePricingTiers';
import { useSiteSettings } from './useSiteSettings';
import { PRICING_NOTES } from '../config/pricing';
import type { PriceEstimate } from '../types/pricing';

export function useBuyoutPricing(): PriceEstimate | null {
  const { buyoutData } = useFormStore();
  const { mealType, barOption, headcount, eventDate } = buyoutData;
  const { mealPricing, barPricing } = usePricingTiers();
  const { rentalFees } = useSiteSettings();

  return useMemo(() => {
    if (!mealType || !barOption) return null;

    const meal = mealPricing.find((m) => m.mealType === mealType);
    const bar = barPricing.find((b) => b.barOption === barOption);
    if (!meal || !bar) return null;

    const foodLow = meal.pricePerPersonLow * headcount;
    const foodHigh = meal.pricePerPersonHigh * headcount;
    const barLow = bar.pricePerPersonLow * headcount;
    const barHigh = bar.pricePerPersonHigh * headcount;

    // Rental fee based on event day of week
    let rentalFee = 0;
    let rentalDayLabel = '';
    if (eventDate) {
      // Parse date as local (YYYY-MM-DD) — add T12:00 to avoid timezone shift
      const date = new Date(eventDate + 'T12:00:00');
      const dayOfWeek = date.getDay();
      const feeEntry = rentalFees.find((f) => f.dayOfWeek === dayOfWeek);
      if (feeEntry) {
        rentalFee = feeEntry.fee;
        rentalDayLabel = feeEntry.dayLabel;
      }
    }

    return {
      foodLow,
      foodHigh,
      barLow,
      barHigh,
      rentalFee,
      rentalDayLabel,
      totalLow: foodLow + barLow + rentalFee,
      totalHigh: foodHigh + barHigh + rentalFee,
      headcount,
      notes: [...PRICING_NOTES],
    };
  }, [mealType, barOption, headcount, eventDate, mealPricing, barPricing, rentalFees]);
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
      rentalFee: 0,
      rentalDayLabel: '',
      totalLow: total,
      totalHigh: total,
      headcount,
      notes: ['Tax not included', 'Pickup only', 'Final pricing confirmed upon order'],
    };
  }, [selectedDishes, headcount, menuItems]);
}
