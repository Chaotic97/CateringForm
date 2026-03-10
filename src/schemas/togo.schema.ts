import { z } from 'zod';

export const togoSchema = z.object({
  headcount: z.number().min(1, 'At least 1 person required'),
  selectedDishes: z
    .array(z.object({ dishId: z.string(), quantity: z.number().min(1) }))
    .min(1, 'Please select at least one dish'),
  preferredPickupDate: z.string().min(1, 'Please select a pickup date'),
  preferredPickupTime: z.string().min(1, 'Please select a pickup time'),
});

export type ToGoSchemaType = z.infer<typeof togoSchema>;
