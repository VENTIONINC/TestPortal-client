// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PATHS } from '@/types/paths';
import { usePostApiV2AuthSignupMutation } from '@/redux/apis/generatedApi';
import { signupSchema, type SignupFormData } from '@/schemas/authSchemas';
import { extractApiError } from '@/utils/apiErrors';

export function useSignup() {
  const navigate = useNavigate();
  const [postApiUsersSignup, { isLoading: isApiLoading, error: apiError }] = usePostApiV2AuthSignupMutation();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    reset,
  } = form;

  const onSubmit = async (data: SignupFormData) => {
    try {
      clearErrors('root');

      await postApiUsersSignup({
        userSignupRequest: {
          name: data.name.trim(),
          email: data.email.trim(),
          password: data.password.trim(),
        },
      }).unwrap();

      navigate(PATHS.LOGIN, {
        state: {
          message: 'Account created successfully! Please sign in to continue.',
          email: data.email,
        },
      });
    } catch {
      const errorMessage = 'Failed to create account. Please try again.';

      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
    }
  };

  const getErrorMessage = () => {
    if (errors.root?.message) return errors.root.message;
    if (apiError) return extractApiError(apiError);
    return null;
  };

  const loading = isApiLoading || isSubmitting;
  const errorMessage = getErrorMessage();

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    loading,
    errorMessage,
    reset,
    clearErrors,
    form,
  };
}
