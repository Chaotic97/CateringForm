interface RadioCardOption {
  value: string;
  label: string;
  description: string;
  badge?: string;
}

interface RadioCardGroupProps {
  options: RadioCardOption[];
  selectedValue: string | null;
  onChange: (value: string) => void;
  name: string;
}

export function RadioCardGroup({
  options,
  selectedValue,
  onChange,
  name,
}: RadioCardGroupProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = option.value === selectedValue;

        return (
          <label
            key={option.value}
            className={[
              'relative flex cursor-pointer rounded-xl border-2 p-5 transition-all duration-150',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-white hover:border-primary/40 hover:shadow-sm',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center justify-between">
                <span className="font-body font-semibold text-text-main">
                  {option.label}
                </span>
                {option.badge && (
                  <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                    {option.badge}
                  </span>
                )}
              </div>
              <p className="text-sm font-body text-muted leading-relaxed">
                {option.description}
              </p>
            </div>

            {/* Selected indicator */}
            <div
              className={[
                'absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-border bg-white',
              ].join(' ')}
            >
              {isSelected && (
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
          </label>
        );
      })}
    </div>
  );
}
