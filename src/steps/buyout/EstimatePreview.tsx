import { useState } from 'react';
import { useFormStore } from '../../store/useFormStore';
import { useBuyoutPricing } from '../../hooks/usePricing';
import { PriceEstimate } from '../../components/shared/PriceEstimate';
import { MenuPreview } from '../../components/menu/MenuPreview';
import { sendInquiryNotification } from '../../services/email';
import { Button } from '../../components/ui/Button';

export function EstimatePreview() {
  const {
    buyoutData,
    contactData,
    cateringType,
    togoData,
    submittedAt,
    submit,
    nextStep,
  } = useFormStore();
  const estimate = useBuyoutPricing();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      submit();
      await sendInquiryNotification({
        cateringType,
        buyoutData,
        togoData,
        contactData,
        submittedAt: submittedAt ?? new Date().toISOString(),
      });
      nextStep();
    } catch {
      // Allow user to retry
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Your Estimated Quote
        </h2>
        <p className="font-body text-sm text-muted">
          This is an estimate based on your selections. Final pricing will be confirmed by your
          event coordinator.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Price Estimate */}
        <div>
          {estimate && <PriceEstimate estimate={estimate} />}
        </div>

        {/* Menu Preview */}
        <div>
          {buyoutData.mealType && (
            <MenuPreview mealType={buyoutData.mealType} />
          )}
        </div>
      </div>

      <Button
        type="button"
        size="lg"
        className="w-full max-w-md mx-auto"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? 'Submitting...' : 'Submit Inquiry'}
      </Button>
    </div>
  );
}
