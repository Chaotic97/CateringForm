import type { MenuItem } from '../../types/menu';

interface BuyoutDishCardProps {
  dish: MenuItem;
  selected: boolean;
  onToggle: () => void;
}

const TAG_LABELS: Record<string, string> = {
  vegetarian: 'V',
  vegan: 'VG',
  'gluten-free': 'GF',
  'contains-nuts': 'Nuts',
  spicy: 'Spicy',
};

export function BuyoutDishCard({ dish, selected, onToggle }: BuyoutDishCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'relative flex flex-col text-left rounded-xl border-2 p-4 transition-all duration-150 w-full',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-white hover:border-primary/30 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Checkbox indicator */}
      <div
        className={[
          'absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
          selected ? 'border-primary bg-primary' : 'border-border bg-white',
        ].join(' ')}
      >
        {selected && (
          <svg
            className="h-3 w-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>

      {/* Dish info */}
      <div className="pr-7">
        <div className="flex items-center gap-1.5">
          {dish.isSignature && (
            <svg
              className="h-3.5 w-3.5 text-accent flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
          <h4 className="font-body font-semibold text-text-main text-sm">
            {dish.name}
          </h4>
          {dish.isPremium && (
            <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold font-body text-accent uppercase tracking-wide">
              Premium
            </span>
          )}
        </div>
        <p className="font-body text-xs text-muted mt-1 leading-relaxed">
          {dish.description}
        </p>
      </div>

      {/* Footer: dietary tags + allergens */}
      <div className="mt-3 flex flex-col gap-1.5">
        {dish.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dish.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium font-body text-muted"
              >
                {TAG_LABELS[tag] ?? tag}
              </span>
            ))}
          </div>
        )}
        {dish.allergens.length > 0 && (
          <p className="font-body text-[10px] italic text-muted/70">
            Contains: {dish.allergens.join(', ')}
          </p>
        )}
      </div>
    </button>
  );
}
