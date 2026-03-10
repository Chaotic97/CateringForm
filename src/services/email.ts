import type { FormState } from '../types/form';

/**
 * Submit catering inquiry to the backend API.
 * The server handles email notification to staff.
 */
export async function sendInquiryNotification(data: Omit<FormState, 'currentStep'>): Promise<void> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(err.error || 'Submission failed');
  }
}
