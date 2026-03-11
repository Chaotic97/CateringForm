import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormStore } from '../store/useFormStore';
import { sendInquiryNotification } from '../services/email';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const directContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string(),
  message: z.string().min(1, 'Please include a message so we can help you'),
});

type DirectContactForm = z.infer<typeof directContactSchema>;

export function DirectContact() {
  const { contactData, updateContact, cateringType, buyoutData, togoData, submittedAt, submit, nextStep } = useFormStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DirectContactForm>({
    resolver: zodResolver(directContactSchema),
    defaultValues: {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      message: contactData.specialRequests,
    },
  });

  const onSubmit = async (data: DirectContactForm) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const contact = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialRequests: data.message,
      };
      updateContact(contact);
      submit();
      await sendInquiryNotification({
        cateringType,
        buyoutData,
        togoData,
        contactData: contact,
        submittedAt: submittedAt ?? new Date().toISOString(),
      });
      nextStep();
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-lg mx-auto"
    >
      <div>
        <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
          Get in Touch
        </h2>
        <p className="font-body text-sm text-muted">
          Tell us a bit about yourself and what you have in mind. Our team will get back to you shortly.
        </p>
      </div>

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
            htmlFor="message"
            className="text-sm font-medium font-body text-text-main"
          >
            Message
          </label>
          <textarea
            id="message"
            rows={5}
            placeholder="Tell us about your event, questions, or how we can help..."
            className={[
              'w-full rounded-lg border bg-white px-4 py-2.5 font-body text-text-main placeholder:text-muted transition-colors duration-150 resize-y',
              'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
              errors.message
                ? 'border-red-500 focus:ring-red-500/40 focus:border-red-500'
                : 'border-border',
            ].join(' ')}
            {...register('message')}
          />
          {errors.message?.message && (
            <p className="text-sm text-red-600 font-body">
              {errors.message.message}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <p className="text-sm text-red-600 font-body">{submitError}</p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
