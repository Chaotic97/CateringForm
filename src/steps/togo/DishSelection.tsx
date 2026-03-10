import { useState, useMemo } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { PICKUP_TIME_SLOTS } from '../../config/form-options';
import { useMenuItems } from '../../hooks/useMenuItems';
import { Counter } from '../../components/ui/Counter';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DishSelector } from '../../components/menu/DishSelector';
import { Button } from '../../components/ui/Button';

export function DishSelection() {
  const { togoData, updateToGo, toggleDish, nextStep } = useFormStore();

  const [headcount, setHeadcount] = useState(togoData.headcount);
  const [pickupDate, setPickupDate] = useState(togoData.preferredPickupDate);
  const [pickupTime, setPickupTime] = useState(togoData.preferredPickupTime);
  const [error, setError] = useState<string | null>(null);
  const { items: menuItems } = useMenuItems();

  const selectedDishIds = togoData.selectedDishes.map((d) => d.dishId);

  const runningTotal = useMemo(() => {
    let perPerson = 0;
    for (const sel of togoData.selectedDishes) {
      const item = menuItems.find((m) => m.id === sel.dishId);
      if (item) perPerson += item.pricePerPerson;
    }
    return perPerson * headcount;
  }, [togoData.selectedDishes, headcount]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const timeOptions = PICKUP_TIME_SLOTS.map((t) => ({ value: t, label: t }));

  const handleToggleDish = (dishId: string) => {
    toggleDish(dishId, headcount);
  };

  const handleContinue = () => {
    if (togoData.selectedDishes.length === 0) {
      setError('Please select at least one dish.');
      return;
    }
    if (!pickupDate) {
      setError('Please select a pickup date.');
      return;
    }
    if (!pickupTime) {
      setError('Please select a pickup time.');
      return;
    }
    setError(null);
    updateToGo({
      headcount,
      preferredPickupDate: pickupDate,
      preferredPickupTime: pickupTime,
    });
    nextStep();
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto pb-28">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Build Your Order
        </h2>
        <p className="font-body text-sm text-muted">
          Select dishes and choose a pickup time.
        </p>
      </div>

      <Counter
        label="Number of People"
        value={headcount}
        onChange={(val) => setHeadcount(val)}
        min={1}
        hint="Price is per person for each dish"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Pickup Date"
          type="date"
          min={minDate}
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
        />
        <Select
          label="Pickup Time"
          options={timeOptions}
          placeholder="Select a time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
        />
      </div>

      <DishSelector
        selectedDishIds={selectedDishIds}
        onToggleDish={handleToggleDish}
      />

      {error && (
        <p className="text-sm text-red-600 font-body">{error}</p>
      )}

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 backdrop-blur-sm px-4 py-4 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="font-body text-sm text-text-main">
            <span className="font-semibold">{togoData.selectedDishes.length}</span>{' '}
            {togoData.selectedDishes.length === 1 ? 'dish' : 'dishes'} selected
            <span className="mx-2 text-muted">&middot;</span>
            <span className="font-semibold">
              ${runningTotal.toLocaleString()}
            </span>{' '}
            estimated
          </div>
          <Button type="button" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
