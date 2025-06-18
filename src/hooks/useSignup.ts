import { useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { PATHS } from '@/types/paths';
import { usePostApiV2UsersSignupMutation } from '@/redux/apis/generatedApi';
import { signupSchema, type SignupFormData } from '@/schemas/authSchemas';
import { extractApiError } from '@/utils/apiErrors';

export interface UseSignupOptions {
  redirectPath?: string;
  onSuccess?: (data: SignupFormData) => void;
  onError?: (error: string) => void;
}

export function useSignup(options: UseSignupOptions = {}) {
  const navigate = useNavigate();
  const [postApiUsersSignup, { isLoading: isApiLoading, error: apiError }] = usePostApiV2UsersSignupMutation();

  const { redirectPath = PATHS.LOGIN, onSuccess, onError } = options;

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
          name: data.name,
          email: data.email,
          password: data.password,
        },
      }).unwrap();

      onSuccess?.(data);

      navigate(redirectPath, {
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

      onError?.(errorMessage);
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
