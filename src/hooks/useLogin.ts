import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import { loginSchema, type LoginFormData } from '@/schemas/authSchemas';
import { usePostApiUsersLoginMutation } from '@/redux/apis/generatedApi';
import { setTokens } from '@/redux/slices/auth';
import { extractApiError } from '@/utils/apiErrors';
import { PATHS } from '@/types/paths';

export interface UseLoginOptions {
  redirectPath?: string;
  onSuccess?: (data: LoginFormData) => void;
  onError?: (error: string) => void;
}

export function useLogin(options: UseLoginOptions = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [postApiUsersLogin, { isLoading: isApiLoading, error: apiError }] = usePostApiUsersLoginMutation();

  const { redirectPath = PATHS.ROOT, onSuccess, onError } = options;

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
          email: data.email,
          password: data.password,
        },
      }).unwrap();

      // Store authentication tokens in Redux - user data will be fetched by useAuth
      dispatch(
        setTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        }),
      );

      onSuccess?.(data);

      // Navigate to intended destination
      navigate(redirectPath);
    } catch {
      const errorMessage = 'Login failed. Please check your credentials.';

      setError('root', {
        type: 'manual',
        message: errorMessage,
      });

      onError?.(errorMessage);
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
