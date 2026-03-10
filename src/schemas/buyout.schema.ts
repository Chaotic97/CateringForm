import { z } from 'zod';

export const buyoutEventSchema = z.object({
  eventDate: z.string().min(1, 'Please select a date'),
  eventTime: z.string().min(1, 'Please select a time'),
  headcount: z.number().min(1, 'At least 1 guest required').max(80, 'Maximum capacity is 80 guests'),
  companyName: z.string(),
  eventDescription: z.string(),
});

export const buyoutMenuSchema = z.object({
  mealType: z.enum(['tasting', 'family-style', 'buffet', 'small-bites'], {
    message: 'Please select a meal type',
  }),
  barOption: z.enum(['cash-bar', 'open-bar', 'pairings', 'none'], {
    message: 'Please select a bar option',
  }),
});

export type BuyoutEventSchemaType = z.infer<typeof buyoutEventSchema>;
export type BuyoutMenuSchemaType = z.infer<typeof buyoutMenuSchema>;
