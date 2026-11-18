import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(50, { message: 'Full name cannot exceed 50 characters.' }),
  email: z
    .string()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' })
    .regex(/[A-Z]/, { message: 'Password must include at least 1 uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must include at least 1 lowercase letter.' }),
  role: z.enum(['customer', 'technician'] as const, {
    message: 'Please select a valid role.',
  }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().optional(),
});

export type SignInFormValues = z.infer<typeof signInSchema>;
