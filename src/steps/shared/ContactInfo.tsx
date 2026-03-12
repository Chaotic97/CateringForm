import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactSchemaType } from '../../schemas/contact.schema';
import { useFormStore } from '../../store/useFormStore';
import { createDraftInquiry } from '../../services/email';
import { ContactFields } from '../../components/shared/ContactFields';
import { Button } from '../../components/ui/Button';

interface ContactInfoProps {
  subtitle?: string;
}

export function ContactInfo({ subtitle = 'How should we reach you?' }: ContactInfoProps) {
  const store = useFormStore();
  const { contactData, updateContact, setInquiryId, nextStep } = store;
  const [saving, setSaving] = useState(false);

  const methods = useForm<ContactSchemaType>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: contactData.firstName,
      lastName: contactData.lastName,
      email: contactData.email,
      phone: contactData.phone,
      specialRequests: contactData.specialRequests,
    },
  });

  const onSubmit = async (data: ContactSchemaType) => {
    updateContact(data);
    setSaving(true);
    try {
      const state = useFormStore.getState();
      const inquiryId = await createDraftInquiry({
        cateringType: state.cateringType,
        buyoutData: state.buyoutData,
        togoData: state.togoData,
        contactData: { ...state.contactData, ...data },
        submittedAt: null,
      });
      setInquiryId(inquiryId);
      nextStep();
    } catch {
      // Still advance — inquiry can be created on final submit as fallback
      nextStep();
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 max-w-lg mx-auto"
      >
        <div>
          <h2 className="font-heading text-2xl font-bold text-text-main mb-1">
            Contact Information
          </h2>
          <p className="font-body text-sm text-muted">
            {subtitle}
          </p>
        </div>

        <ContactFields />

        <Button type="submit" size="lg" className="mt-2 w-full" disabled={saving}>
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </form>
    </FormProvider>
  );
}
