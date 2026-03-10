import { useFormContext } from 'react-hook-form';
import { Input } from '../ui/Input';

interface ContactFieldValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

export function ContactFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContactFieldValues>();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          placeholder="Jane"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>

      <Input
        label="Email"
        type="email"
        placeholder="jane@example.com"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="(555) 123-4567"
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="specialRequests"
          className="text-sm font-medium font-body text-text-main"
        >
          Special Requests
        </label>
        <textarea
          id="specialRequests"
          rows={4}
          placeholder="Allergies, dietary needs, special arrangements..."
          className={[
            'w-full rounded-lg border bg-white px-4 py-2.5 font-body text-text-main placeholder:text-muted transition-colors duration-150 resize-y',
            'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
            errors.specialRequests
              ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
              : 'border-border',
          ].join(' ')}
          {...register('specialRequests')}
        />
        {errors.specialRequests?.message && (
          <p className="text-sm text-red-600 font-body">
            {errors.specialRequests.message}
          </p>
        )}
      </div>
    </div>
  );
}
