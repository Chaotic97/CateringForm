interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  hint?: string;
}

export function Counter({
  value,
  onChange,
  min = 0,
  max = Infinity,
  label,
  hint,
}: CounterProps) {
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium font-body text-text-main">
          {label}
        </span>
      )}

      <div className="inline-flex items-center gap-0">
        <button
          type="button"
          onClick={() => canDecrement && onChange(value - 1)}
          disabled={!canDecrement}
          aria-label="Decrease"
          className={[
            'flex h-10 w-10 items-center justify-center rounded-l-lg border border-r-0 border-border text-lg font-medium transition-colors',
            canDecrement
              ? 'text-text-main hover:bg-surface cursor-pointer'
              : 'text-muted/40 cursor-not-allowed bg-surface/50',
          ].join(' ')}
        >
          &minus;
        </button>

        <div className="flex h-10 min-w-[3.5rem] items-center justify-center border border-border bg-white px-3 font-body font-semibold text-text-main tabular-nums">
          {value}
        </div>

        <button
          type="button"
          onClick={() => canIncrement && onChange(value + 1)}
          disabled={!canIncrement}
          aria-label="Increase"
          className={[
            'flex h-10 w-10 items-center justify-center rounded-r-lg border border-l-0 border-border text-lg font-medium transition-colors',
            canIncrement
              ? 'text-text-main hover:bg-surface cursor-pointer'
              : 'text-muted/40 cursor-not-allowed bg-surface/50',
          ].join(' ')}
        >
          +
        </button>
      </div>

      {hint && (
        <p className="text-xs font-body text-muted">{hint}</p>
      )}
    </div>
  );
}
