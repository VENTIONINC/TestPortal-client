// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import { loginSchema, type LoginFormData } from '@/schemas/authSchemas';
import { usePostApiV2UsersLoginMutation } from '@/redux/apis/generatedApi';
import { setTokens } from '@/redux/slices/auth';
import { useResetState } from '@/hooks/useResetState';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

export function useLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resetState = useResetState();
  const [postApiUsersLogin, { isLoading: isApiLoading, error: apiError }] = usePostApiV2UsersLoginMutation();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    setError,
    clearErrors,
  } = form;

  useEffect(() => {
    if (location.state?.email) {
      setValue('email', location.state.email);
    }
  }, [location.state, setValue]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearErrors('root');

      const response = await postApiUsersLogin({
        userLoginRequest: {
          email: data.email.trim(),
          password: data.password.trim(),
        },
      }).unwrap();

      // Store authentication tokens in Redux - user data will be fetched by useAuth
      dispatch(
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      // Reset global state to ensure fresh initialization
      resetState();

      // Navigate to intended destination
      navigate(PATHS.ROOT);
    } catch {
      const errorMessage = 'Login failed. Please check your credentials.';

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
  const successMessage = location.state?.message;
  const errorMessage = getErrorMessage();

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    loading,
    successMessage,
    errorMessage,
    clearErrors,
    form,
  };
}
