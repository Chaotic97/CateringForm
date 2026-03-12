import { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { useToGoPricing } from '../../hooks/usePricing';
import { useMenuItems } from '../../hooks/useMenuItems';
import { submitInquiry, sendInquiryNotification } from '../../services/email';
import { Button } from '../../components/ui/Button';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PriceSummary() {
  const { items: menuItems } = useMenuItems();
  const store = useFormStore();
  const {
    togoData,
    contactData,
    buyoutData,
    cateringType,
    inquiryId,
    submit,
    nextStep,
  } = store;
  const estimate = useToGoPricing();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      submit();
      const estimates = estimate
        ? { estimateLow: estimate.totalLow, estimateHigh: estimate.totalLow }
        : undefined;

      if (inquiryId) {
        await submitInquiry(inquiryId, estimates);
      } else {
        // Fallback: create and submit in one step if draft wasn't created
        await sendInquiryNotification({
          cateringType,
          buyoutData,
          togoData,
          contactData,
          submittedAt: new Date().toISOString(),
        });
      }
      nextStep();
    } catch {
      // Allow user to retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Order Summary
        </h2>
        <p className="font-body text-sm text-muted">
          Review your selections before submitting.
        </p>
      </div>

      {/* Pickup details */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <h3 className="font-heading text-base font-semibold text-text-main mb-3">
          Pickup Details
        </h3>
        <div className="flex flex-col gap-1 font-body text-sm text-muted">
          <p>
            <span className="text-text-main font-medium">Date:</span>{' '}
            {togoData.preferredPickupDate || 'Not set'}
          </p>
          <p>
            <span className="text-text-main font-medium">Time:</span>{' '}
            {togoData.preferredPickupTime || 'Not set'}
          </p>
          <p>
            <span className="text-text-main font-medium">Headcount:</span>{' '}
            {togoData.headcount} {togoData.headcount === 1 ? 'person' : 'people'}
          </p>
        </div>
      </div>

      {/* Itemized dishes */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <h3 className="font-heading text-base font-semibold text-text-main mb-3">
          Selected Dishes
        </h3>
        <div className="flex flex-col gap-2">
          {togoData.selectedDishes.map((sel) => {
            const item = menuItems.find((m) => m.id === sel.dishId);
            if (!item) return null;
            return (
              <div key={sel.dishId} className="flex items-center justify-between">
                <span className="font-body text-sm text-text-main">{item.name}</span>
                <span className="font-body text-sm text-muted">
                  {formatCurrency(item.pricePerPerson)}/person &times; {togoData.headcount}
                </span>
              </div>
            );
          })}

          {estimate && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="flex items-center justify-between">
                <span className="font-body text-base font-semibold text-text-main">
                  Total Estimate
                </span>
                <span className="font-heading text-xl font-bold text-primary">
                  {formatCurrency(estimate.totalLow)}
                </span>
              </div>
            </>
          )}
        </div>

        {estimate && estimate.notes.length > 0 && (
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

      <p className="font-body text-xs text-muted text-center italic">
        Pickup only &mdash; delivery coming soon
      </p>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
      </Button>
    </div>
  );
}
