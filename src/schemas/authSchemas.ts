// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { z } from 'zod';

// Shared validation rules
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase character')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
  .regex(/[0-9]/, 'Password must contain at least one numeric character');

const emailValidation = z.string().email('Please enter a valid email address');

const nameValidation = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// Signup schema
export const signupSchema = z
  .object({
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Login schema
export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: emailValidation,
});

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordValidation,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

// TypeScript types
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
