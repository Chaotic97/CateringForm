import { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { MEAL_TYPE_PRICING, BAR_PRICING } from '../../config/pricing';
import { RadioCardGroup } from '../../components/ui/RadioCardGroup';
import { Button } from '../../components/ui/Button';
import type { MealType, BarOption } from '../../types/form';

function formatBadge(low: number, high: number): string {
  if (low === 0 && high === 0) return 'No cost';
  if (low === high) return `$${low}/person`;
  return `$${low}\u2013${high}/person`;
}

export function MenuStyle() {
  const { buyoutData, updateBuyoutMenu, nextStep } = useFormStore();

  const [mealType, setMealType] = useState<string | null>(buyoutData.mealType);
  const [barOption, setBarOption] = useState<string | null>(buyoutData.barOption);
  const [error, setError] = useState<string | null>(null);

  const mealOptions = MEAL_TYPE_PRICING.map((m) => ({
    value: m.mealType,
    label: m.label,
    description: m.description,
    badge: formatBadge(m.pricePerPersonLow, m.pricePerPersonHigh),
  }));

  const barOptions = BAR_PRICING.map((b) => ({
    value: b.barOption,
    label: b.label,
    description: b.description,
    badge: formatBadge(b.pricePerPersonLow, b.pricePerPersonHigh),
  }));

  const handleContinue = () => {
    if (!mealType || !barOption) {
      setError('Please select both a meal type and a bar option.');
      return;
    }
    setError(null);
    updateBuyoutMenu(mealType as MealType, barOption as BarOption);
    nextStep();
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Menu Style
        </h2>
        <p className="font-body text-sm text-muted">
          Choose your dining experience and bar service.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-lg font-semibold text-text-main">
          Meal Type
        </h3>
        <RadioCardGroup
          name="mealType"
          options={mealOptions}
          selectedValue={mealType}
          onChange={(val) => { setMealType(val); setError(null); }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-lg font-semibold text-text-main">
          Bar Option
        </h3>
        <RadioCardGroup
          name="barOption"
          options={barOptions}
          selectedValue={barOption}
          onChange={(val) => { setBarOption(val); setError(null); }}
        />
      </section>

      {error && (
        <p className="text-sm text-red-600 font-body">{error}</p>
      )}

      <Button type="button" size="lg" className="w-full" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
