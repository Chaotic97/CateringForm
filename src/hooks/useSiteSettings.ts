import { useState, useEffect } from 'react';

export interface RecommendedTier {
  maxHeadcount: number;
  count: number;
}

export interface RentalFee {
  dayOfWeek: number;
  dayLabel: string;
  fee: number;
}

interface SiteSettings {
  buyoutDescription: string;
  togoDescription: string;
  recommendedDishes: Record<string, RecommendedTier[]>;
  rentalFees: RentalFee[];
  loading: boolean;
}

const DEFAULT_BUYOUT_DESC = 'Reserve the entire restaurant for your private event. Choose from tasting menus, family style, buffet, or small bites with full bar service.';
const DEFAULT_TOGO_DESC = 'Order our signature dishes for pickup. Perfect for office lunches, parties, and celebrations of any size.';

const DEFAULT_RECOMMENDED: Record<string, RecommendedTier[]> = {
  appetizer:      [{ maxHeadcount: 20, count: 2 }, { maxHeadcount: 40, count: 3 }, { maxHeadcount: 80, count: 4 }],
  soup:           [{ maxHeadcount: 40, count: 1 }, { maxHeadcount: 80, count: 2 }],
  entree:         [{ maxHeadcount: 20, count: 2 }, { maxHeadcount: 40, count: 3 }, { maxHeadcount: 60, count: 4 }, { maxHeadcount: 80, count: 5 }],
  side:           [{ maxHeadcount: 20, count: 1 }, { maxHeadcount: 80, count: 2 }],
  'noodles-rice': [{ maxHeadcount: 20, count: 1 }, { maxHeadcount: 80, count: 2 }],
  dessert:        [{ maxHeadcount: 30, count: 1 }, { maxHeadcount: 80, count: 2 }],
};

const DEFAULT_RENTAL_FEES: RentalFee[] = [
  { dayOfWeek: 0, dayLabel: 'Sunday', fee: 1500 },
  { dayOfWeek: 1, dayLabel: 'Monday', fee: 1000 },
  { dayOfWeek: 2, dayLabel: 'Tuesday', fee: 1000 },
  { dayOfWeek: 3, dayLabel: 'Wednesday', fee: 1000 },
  { dayOfWeek: 4, dayLabel: 'Thursday', fee: 1500 },
  { dayOfWeek: 5, dayLabel: 'Friday', fee: 2500 },
  { dayOfWeek: 6, dayLabel: 'Saturday', fee: 3000 },
];

let cached: Omit<SiteSettings, 'loading'> | null = null;

export function useSiteSettings(): SiteSettings {
  const [state, setState] = useState<Omit<SiteSettings, 'loading'>>(cached ?? {
    buyoutDescription: DEFAULT_BUYOUT_DESC,
    togoDescription: DEFAULT_TOGO_DESC,
    recommendedDishes: DEFAULT_RECOMMENDED,
    rentalFees: DEFAULT_RENTAL_FEES,
  });
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) return;

    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/settings/rental-fees').then((r) => r.json()),
    ])
      .then(([settings, fees]: [Record<string, string>, RentalFee[]]) => {
        let recommended = DEFAULT_RECOMMENDED;
        try {
          if (settings.recommended_dishes) {
            recommended = JSON.parse(settings.recommended_dishes);
          }
        } catch { /* use default */ }

        const result = {
          buyoutDescription: settings.buyout_description || DEFAULT_BUYOUT_DESC,
          togoDescription: settings.togo_description || DEFAULT_TOGO_DESC,
          recommendedDishes: recommended,
          rentalFees: fees.length > 0 ? fees : DEFAULT_RENTAL_FEES,
        };
        cached = result;
        setState(result);
      })
      .catch(() => {
        cached = {
          buyoutDescription: DEFAULT_BUYOUT_DESC,
          togoDescription: DEFAULT_TOGO_DESC,
          recommendedDishes: DEFAULT_RECOMMENDED,
          rentalFees: DEFAULT_RENTAL_FEES,
        };
      })
      .finally(() => setLoading(false));
  }, []);

  return { ...state, loading };
}

export function getRecommendedCount(tiers: RecommendedTier[], headcount: number): number {
  for (const tier of tiers) {
    if (headcount <= tier.maxHeadcount) return tier.count;
  }
  return tiers.length > 0 ? tiers[tiers.length - 1].count : 1;
}
