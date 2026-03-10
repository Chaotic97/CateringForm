import type { PriceEstimate as PriceEstimateType } from '../../types/pricing';

interface PriceEstimateProps {
  estimate: PriceEstimateType;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PriceRange({ low, high, label }: { low: number; high: number; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-body text-sm text-muted">{label}</span>
      <span className="font-body text-sm font-medium text-text-main">
        {formatCurrency(low)} &ndash; {formatCurrency(high)}
      </span>
    </div>
  );
}

export function PriceEstimate({ estimate }: PriceEstimateProps) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 p-5">
      <h3 className="font-heading text-lg font-semibold text-text-main mb-1">
        Estimated Price
      </h3>
      <p className="text-xs font-body text-muted mb-4">
        For {estimate.headcount} {estimate.headcount === 1 ? 'guest' : 'guests'}
      </p>

      <div className="flex flex-col gap-2">
        <PriceRange low={estimate.foodLow} high={estimate.foodHigh} label="Food" />
        {(estimate.barLow > 0 || estimate.barHigh > 0) && (
          <PriceRange low={estimate.barLow} high={estimate.barHigh} label="Bar" />
        )}

        <div className="my-2 border-t border-border" />

        <div className="flex items-center justify-between">
          <span className="font-body text-base font-semibold text-text-main">
            Total
          </span>
          <span className="font-heading text-xl font-bold text-primary">
            {formatCurrency(estimate.totalLow)} &ndash; {formatCurrency(estimate.totalHigh)}
          </span>
        </div>
      </div>

      {estimate.notes.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1">
          {estimate.notes.map((note, i) => (
            <li key={i} className="text-xs font-body text-muted flex gap-1.5">
              <span className="text-accent mt-0.5">*</span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
