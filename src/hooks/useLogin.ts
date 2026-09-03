// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import { loginSchema, type LoginFormData } from '@/schemas/authSchemas';
import { usePostApiV2AuthLoginMutation } from '@/redux/apis/generatedApi';
import { setTokens } from '@/redux/slices/auth';
import { useResetState } from '@/hooks/useResetState';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

const GENERIC_LOGIN_ERROR = 'Authentication failed. Please check your credentials.';
const PENDING_APPROVAL_PRIMARY_PATTERNS = [/pending/i, /awaiting/i];
const PENDING_APPROVAL_SECONDARY_PATTERNS = [/approval/i, /approve/i];

export function isPendingApprovalLoginError(message: string) {
  return (
    PENDING_APPROVAL_PRIMARY_PATTERNS.some((pattern) => pattern.test(message)) &&
    PENDING_APPROVAL_SECONDARY_PATTERNS.some((pattern) => pattern.test(message))
  );
}

export function getLoginErrorMessage(error: Parameters<typeof extractApiError>[0]) {
  const extractedMessage = extractApiError(error);

  if (isPendingApprovalLoginError(extractedMessage)) {
    return extractedMessage;
  }

  return GENERIC_LOGIN_ERROR;
}

export function useLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const resetState = useResetState();
  const [postApiUsersLogin, { isLoading: isApiLoading, error: apiError }] = usePostApiV2AuthLoginMutation();

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

      if (!('accessToken' in response) || !('refreshToken' in response)) {
        setError('root', {
          type: 'manual',
          message: 'message' in response ? response.message || GENERIC_LOGIN_ERROR : GENERIC_LOGIN_ERROR,
        });
        return;
      }

      dispatch(
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      resetState();
      navigate(PATHS.ROOT);
    } catch (error) {
      const errorMessage = getLoginErrorMessage(error as Parameters<typeof extractApiError>[0]);

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
