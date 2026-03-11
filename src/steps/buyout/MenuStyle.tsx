import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStore } from '../../store/useFormStore';
import { usePricingTiers } from '../../hooks/usePricingTiers';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useSiteSettings, getRecommendedCount } from '../../hooks/useSiteSettings';
import { RadioCardGroup } from '../../components/ui/RadioCardGroup';
import { BuyoutDishCard } from '../../components/menu/BuyoutDishCard';
import { Button } from '../../components/ui/Button';
import type { MealType, BarOption } from '../../types/form';

const DISH_SELECTION_TYPES = ['family-style', 'buffet'];

function formatBadge(low: number, high: number): string {
  if (low === 0 && high === 0) return 'No cost';
  if (low === high) return `$${low}/person`;
  return `$${low}\u2013${high}/person`;
}

export function MenuStyle() {
  const { buyoutData, updateBuyoutMenu, toggleBuyoutDish, nextStep } = useFormStore();

  const [mealType, setMealType] = useState<string | null>(buyoutData.mealType);
  const [barOption, setBarOption] = useState<string | null>(buyoutData.barOption);
  const [selectedDishes, setSelectedDishes] = useState<string[]>(buyoutData.selectedDishes);
  const [error, setError] = useState<string | null>(null);
  const { mealPricing, barPricing } = usePricingTiers();
  const { items: menuItems, CATEGORY_LABELS, CATEGORY_ORDER } = useMenuItems();
  const { recommendedDishes } = useSiteSettings();

  const mealOptions = mealPricing.map((m) => ({
    value: m.mealType,
    label: m.label,
    description: m.description,
    badge: formatBadge(m.pricePerPersonLow, m.pricePerPersonHigh),
  }));

  const barOptions = barPricing.map((b) => ({
    value: b.barOption,
    label: b.label,
    description: b.description,
    badge: formatBadge(b.pricePerPersonLow, b.pricePerPersonHigh),
  }));

  const selectedMealLabel = mealPricing.find((m) => m.mealType === mealType);
  const showDishSelection = mealType && DISH_SELECTION_TYPES.includes(mealType);

  const availableItems = menuItems.filter((item) => item.available);
  const groupedItems = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    items: availableItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const handleToggleDish = (dishId: string) => {
    setSelectedDishes((prev) =>
      prev.includes(dishId)
        ? prev.filter((id) => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleContinue = () => {
    if (!mealType || !barOption) {
      setError('Please select both a meal type and a bar option.');
      return;
    }
    setError(null);
    updateBuyoutMenu(mealType as MealType, barOption as BarOption);
    // Sync selected dishes to store
    selectedDishes.forEach((id) => {
      if (!buyoutData.selectedDishes.includes(id)) toggleBuyoutDish(id);
    });
    buyoutData.selectedDishes.forEach((id) => {
      if (!selectedDishes.includes(id)) toggleBuyoutDish(id);
    });
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

      {/* Meal Type — collapsible with animation */}
      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-lg font-semibold text-text-main">
          Meal Type
        </h3>

        <AnimatePresence mode="wait">
          {!mealType ? (
            <motion.div
              key="meal-options"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <RadioCardGroup
                name="mealType"
                options={mealOptions}
                selectedValue={mealType}
                onChange={(val) => { setMealType(val); setError(null); }}
              />
            </motion.div>
          ) : (
            <motion.button
              key="meal-collapsed"
              type="button"
              onClick={() => setMealType(null)}
              className="flex items-center justify-between w-full rounded-xl border-2 border-primary bg-primary/5 px-5 py-3 text-left transition-all hover:bg-primary/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="font-body font-semibold text-text-main">
                  {selectedMealLabel?.label}
                </span>
                {selectedMealLabel && (
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {formatBadge(selectedMealLabel.pricePerPersonLow, selectedMealLabel.pricePerPersonHigh)}
                  </span>
                )}
              </div>
              <span className="text-xs font-body text-muted">Change</span>
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      {/* Dish Selection — only for family-style and buffet */}
      <AnimatePresence>
        {showDishSelection && (
          <motion.section
            className="flex flex-col gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div>
              <h3 className="font-heading text-lg font-semibold text-text-main">
                Select Your Dishes
              </h3>
              <p className="font-body text-sm text-muted mt-0.5">
                Choose the dishes you'd like for your event. Your coordinator will finalize the menu with you.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {groupedItems.map((group) => (
                <div key={group.category}>
                  <h4 className="font-heading text-sm uppercase tracking-[0.12em] text-accent mb-3 flex items-center gap-2">
                    {group.label}
                    {recommendedDishes[group.category] && (
                      <span className="text-[11px] font-body normal-case tracking-normal text-muted font-normal">
                        — {getRecommendedCount(recommendedDishes[group.category], buyoutData.headcount)} recommended
                      </span>
                    )}
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {group.items.map((dish) => (
                      <BuyoutDishCard
                        key={dish.id}
                        dish={dish}
                        selected={selectedDishes.includes(dish.id)}
                        onToggle={() => handleToggleDish(dish.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Bar Option */}
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
