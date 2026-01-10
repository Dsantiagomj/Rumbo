import { z } from 'zod';
import { subYears } from 'date-fns';

// Password validation schema (shared for register and password updates)
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener mínimo 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe tener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe tener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe tener al menos un número');

// Base fields for registration (without confirmPassword)
const registerBaseSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  name: z.string().min(2, 'El nombre completo es requerido'),
  preferredName: z
    .string()
    .min(2, 'Dinos cómo quieres que te llamemos')
    .max(50, 'El nombre preferido es muy largo'),
  dateOfBirth: z
    .date()
    .max(new Date(), 'La fecha de nacimiento no puede ser futura')
    .min(subYears(new Date(), 120), 'Fecha de nacimiento inválida')
    .refine(
      (date) => date <= subYears(new Date(), 13),
      'Debes tener al menos 13 años para usar Rumbo',
    ),
  identification: z
    .string()
    .regex(/^\d+$/, 'La identificación debe contener solo números')
    .min(6, 'La identificación debe tener al menos 6 dígitos')
    .max(15, 'La identificación es muy larga')
    .optional(),
});

// Backend register schema (for API)
export const registerBackendSchema = registerBaseSchema;

// Frontend register schema (with confirmPassword validation)
export const registerSchema = registerBaseSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

// Profile update schema
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre completo es requerido').optional(),
  preferredName: z
    .string()
    .min(2, 'El nombre preferido es muy corto')
    .max(50, 'El nombre preferido es muy largo')
    .optional(),
  email: z.string().email('Email inválido').optional(),
  currency: z.enum(['COP', 'USD', 'EUR']).optional(),
  language: z.enum(['es-CO', 'en-US']).optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY']).optional(),
  timezone: z.string().optional(),
});

// Type exports (inferred from schemas)
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterBackendInput = z.infer<typeof registerBackendSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
