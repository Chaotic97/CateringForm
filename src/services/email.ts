import type { FormState } from '../types/form';

/**
 * Stub for email notification.
 *
 * TODO: Integrate with email service (SendGrid, Resend, etc.)
 * When ready, replace this with a fetch() call to your serverless function:
 *
 *   const res = await fetch('/api/send-inquiry', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify(data),
 *   });
 *
 * The serverless function should send to multiple staff emails
 * configured via environment variables.
 */
export async function sendInquiryNotification(data: Omit<FormState, 'currentStep'>): Promise<void> {
  console.log('[Email Stub] Inquiry submitted:', data);
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log('[Email Stub] Notification would be sent to staff emails');
}
