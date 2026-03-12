import { useMenuItems } from '../../hooks/useMenuItems';

interface MenuPreviewProps {
  mealType: string;
  selectedDishIds?: string[];
}

export function MenuPreview({ mealType, selectedDishIds }: MenuPreviewProps) {
  const { items, CATEGORY_LABELS, CATEGORY_ORDER } = useMenuItems();

  // If specific dishes were selected, show only those; otherwise show all available
  const filteredItems = selectedDishIds
    ? items.filter((item) => selectedDishIds.includes(item.id))
    : items.filter((item) => item.available);

  const groupedItems = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category] ?? category,
    items: filteredItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  const heading = selectedDishIds ? 'Your Selected Menu' : 'Sample Menu';

  return (
    <div className="mx-auto max-w-xl text-center">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-body uppercase tracking-[0.2em] text-muted mb-2">
          {heading}
        </p>
        <h2 className="font-heading text-3xl font-bold text-text-main">
          {mealType === 'tasting' && 'Tasting Menu'}
          {mealType === 'family-style' && 'Family Style'}
          {mealType === 'buffet' && 'Buffet Spread'}
          {mealType === 'small-bites' && 'Small Bites'}
          {!['tasting', 'family-style', 'buffet', 'small-bites'].includes(mealType) &&
            'Our Menu'}
        </h2>
        <div className="mx-auto mt-3 h-px w-16 bg-accent" />
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-10">
        {groupedItems.map((group) => (
          <div key={group.category}>
            <h3 className="font-heading text-sm uppercase tracking-[0.15em] text-accent mb-5">
              {group.label}
            </h3>

            <div className="flex flex-col gap-4">
              {group.items.map((item) => (
                <div key={item.id} className="group">
                  <div className="flex items-center justify-center gap-2">
                    {item.isSignature && (
                      <svg
                        className="h-4 w-4 text-accent flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                    <span className="font-heading text-lg font-semibold text-text-main">
                      {item.name}
                    </span>
                    {item.isSignature && (
                      <svg
                        className="h-4 w-4 text-accent flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    )}
                  </div>
                  <p className="font-body text-sm text-muted mt-0.5">
                    {item.description}
                  </p>
                  {item.allergens.length > 0 && (
                    <p className="font-body text-[10px] italic text-muted/60 mt-0.5">
                      Contains: {item.allergens.join(', ')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-10 pt-6 border-t border-border/50">
        <p className="font-body text-xs text-muted italic">
          {selectedDishIds
            ? 'Your coordinator will finalize the menu details with you.'
            : <>Menu items may vary based on seasonal availability.<br />Items marked with stars are our signature dishes.</>
          }
        </p>
      </div>
    </div>
  );
}
