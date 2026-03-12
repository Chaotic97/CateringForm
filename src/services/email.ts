import type { FormState } from '../types/form';

/**
 * Create a draft inquiry in the backend (not yet submitted).
 * Returns the created inquiry's ID.
 */
export async function createDraftInquiry(data: Omit<FormState, 'currentStep'>): Promise<number> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, submitted: false }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create inquiry' }));
    throw new Error(err.error || 'Failed to create inquiry');
  }

  const inquiry = await res.json();
  return inquiry.id;
}

/**
 * Mark an existing inquiry as submitted.
 * The server handles email notification to staff.
 */
export async function submitInquiry(inquiryId: number, estimates?: { estimateLow?: number; estimateHigh?: number }): Promise<void> {
  const res = await fetch(`/api/inquiries/${inquiryId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(estimates || {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(err.error || 'Submission failed');
  }
}

/**
 * Legacy: create and immediately submit an inquiry in one step.
 * Used by flows that don't create a draft first (e.g., general contact).
 */
export async function sendInquiryNotification(data: Omit<FormState, 'currentStep'>): Promise<number> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, submitted: true }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Submission failed' }));
    throw new Error(err.error || 'Submission failed');
  }

  const inquiry = await res.json();
  return inquiry.id;
}
