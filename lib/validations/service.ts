import { z } from 'zod';
import { SERVICE_CATEGORIES } from '@/lib/types';

export const serviceSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters.' })
    .max(100, { message: 'Title cannot exceed 100 characters.' }),
  category: z.string().min(1, { message: 'Please select a service category.' }),
  serviceMode: z.enum(['Home Visit', 'Shop Drop-off'] as const, {
    message: 'Please select a service delivery mode.',
  }),
  basePrice: z
    .number({ message: 'Base price must be a valid number.' })
    .positive({ message: 'Base price must be greater than $0.' }),
  estimatedDuration: z
    .string()
    .min(2, { message: 'Estimated duration is required (e.g., "1-2 hours").' }),
  serviceArea: z
    .string()
    .min(3, { message: 'Service area is required (e.g., "Downtown & Metro").' }),
  description: z
    .string()
    .min(20, { message: 'Description must be at least 20 characters.' })
    .max(1000, { message: 'Description cannot exceed 1000 characters.' }),
  image: z
    .string()
    .min(1, { message: 'Service photo is required. Please upload an image.' }),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;
