import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactSchemaType } from '../../schemas/contact.schema';
import { useFormStore } from '../../store/useFormStore';
import { ContactFields } from '../../components/shared/ContactFields';
import { Button } from '../../components/ui/Button';

export function ContactInfo() {
  const { contactData, updateContact, nextStep } = useFormStore();

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

  const onSubmit = (data: ContactSchemaType) => {
    updateContact(data);
    nextStep();
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
            How should we reach you about your event?
          </p>
        </div>

        <ContactFields />

        <Button type="submit" size="lg" className="mt-2 w-full">
          Continue
        </Button>
      </form>
    </FormProvider>
  );
}
