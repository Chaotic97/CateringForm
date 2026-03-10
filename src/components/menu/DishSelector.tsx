import { MENU_ITEMS, CATEGORY_LABELS, CATEGORY_ORDER } from '../../config/menu-items';
import { DishCard } from './DishCard';

interface DishSelectorProps {
  selectedDishIds: string[];
  onToggleDish: (dishId: string) => void;
}

export function DishSelector({ selectedDishIds, onToggleDish }: DishSelectorProps) {
  const availableItems = MENU_ITEMS.filter((item) => item.available);

  const groupedItems = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    items: availableItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col gap-8">
      {groupedItems.map((group) => (
        <section key={group.category}>
          <h3 className="font-heading text-lg font-semibold text-text-main mb-3 pb-2 border-b border-border">
            {group.label}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <DishCard
                key={item.id}
                dish={item}
                selected={selectedDishIds.includes(item.id)}
                onToggle={() => onToggleDish(item.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
