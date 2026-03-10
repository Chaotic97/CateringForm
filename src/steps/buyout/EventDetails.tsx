import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { buyoutEventSchema, type BuyoutEventSchemaType } from '../../schemas/buyout.schema';
import { useFormStore } from '../../store/useFormStore';
import { TIME_SLOTS } from '../../config/form-options';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Counter } from '../../components/ui/Counter';

export function EventDetails() {
  const { buyoutData, updateBuyoutEvent, nextStep } = useFormStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BuyoutEventSchemaType>({
    resolver: zodResolver(buyoutEventSchema),
    defaultValues: {
      eventDate: buyoutData.eventDate,
      eventTime: buyoutData.eventTime,
      headcount: buyoutData.headcount,
      companyName: buyoutData.companyName,
      eventDescription: buyoutData.eventDescription,
    },
  });

  const headcount = watch('headcount');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const timeOptions = TIME_SLOTS.map((t) => ({ value: t, label: t }));

  const onSubmit = (data: BuyoutEventSchemaType) => {
    updateBuyoutEvent(data);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Event Details
        </h2>
        <p className="font-body text-sm text-muted">
          Tell us when and how many guests to expect.
        </p>
      </div>

      <Input
        label="Event Date"
        type="date"
        min={minDate}
        error={errors.eventDate?.message}
        {...register('eventDate')}
      />

      <Select
        label="Event Time"
        options={timeOptions}
        placeholder="Select a time"
        error={errors.eventTime?.message}
        {...register('eventTime')}
      />

      <Counter
        label="Number of Guests"
        value={headcount}
        onChange={(val) => setValue('headcount', val, { shouldValidate: true })}
        min={1}
        max={80}
        hint="Maximum capacity: 80 guests"
      />
      {errors.headcount?.message && (
        <p className="text-sm text-red-600 font-body -mt-4">{errors.headcount.message}</p>
      )}

      <Input
        label="Company / Organization (optional)"
        placeholder="Acme Corp"
        error={errors.companyName?.message}
        {...register('companyName')}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="eventDescription"
          className="text-sm font-medium font-body text-text-main"
        >
          Event Description (optional)
        </label>
        <textarea
          id="eventDescription"
          rows={3}
          placeholder="Birthday, corporate dinner, anniversary..."
          className={[
            'w-full rounded-lg border bg-white px-4 py-2.5 font-body text-text-main placeholder:text-muted transition-colors duration-150 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            errors.eventDescription
              ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
              : 'border-border',
          ].join(' ')}
          {...register('eventDescription')}
        />
        {errors.eventDescription?.message && (
          <p className="text-sm text-red-600 font-body">{errors.eventDescription.message}</p>
        )}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full">
        Continue
      </Button>
    </form>
  );
}
