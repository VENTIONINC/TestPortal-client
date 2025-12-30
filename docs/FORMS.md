# Forms with React Hook Form + Zod + ChakraUI

This project uses a powerful combination of **React Hook Form**, **Zod**, and **ChakraUI** for form handling and validation.

## 🚀 Why This Combination?

### **React Hook Form**

- ✅ **Better Performance**: Minimal re-renders, uncontrolled components
- ✅ **Smaller Bundle**: Lightweight library
- ✅ **Better DX**: Less boilerplate code
- ✅ **Built-in Validation**: Comprehensive validation support

### **Zod**

- ✅ **Type Safety**: TypeScript-first schema validation
- ✅ **Runtime Validation**: Catch errors at runtime
- ✅ **Reusable Schemas**: Share validation logic across client/server
- ✅ **Great Error Messages**: User-friendly validation messages

### **ChakraUI Integration**

- ✅ **Fully Compatible**: Works seamlessly with ChakraUI components
- ✅ **Consistent Styling**: Maintains design system consistency
- ✅ **Accessible**: Built-in accessibility features
- ✅ **Customizable**: Easy to theme and customize

## 🏗️ Clean Architecture

We follow clean architecture principles by separating business logic from UI components:

### **File Structure**

```
src/
├── schemas/
│   └── authSchemas.ts          # Validation schemas
├── hooks/
│   ├── useSignup.ts            # Signup business logic
│   ├── useLogin.ts             # Login business logic
│   └── index.ts                # Hook exports
├── utils/
│   └── apiErrors.ts            # Error handling utilities
├── components/
│   └── forms/
│       ├── FormField.tsx       # Reusable form field
│       └── index.ts            # Component exports
└── pages/
    ├── Signup/
    │   └── index.tsx           # Clean UI component
    └── Login/
        └── index.tsx           # Clean UI component
```

### **Benefits of This Architecture**

- ✅ **Separation of Concerns**: UI components focus only on rendering
- ✅ **Reusable Logic**: Business logic can be shared across components
- ✅ **Testability**: Hooks and utilities can be unit tested independently
- ✅ **Maintainability**: Changes to business logic don't affect UI structure
- ✅ **Type Safety**: Full TypeScript support throughout

## 📦 Dependencies

```bash
yarn add react-hook-form zod @hookform/resolvers
```

## 🎯 Basic Usage

### 1. Define Schemas (src/schemas/authSchemas.ts)

```typescript
import { z } from 'zod';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase character')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
      .regex(/[0-9]/, 'Password must contain at least one numeric character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
```

### 2. Create Custom Hook (src/hooks/useSignup.ts)

```typescript
import { useSignup } from '@/hooks';

export function useSignup(options: UseSignupOptions = {}) {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignupFormData) => {
    // API logic, navigation, error handling
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    loading,
    errorMessage,
  };
}
```

### 3. Clean UI Component (src/pages/Signup/index.tsx)

```typescript
import { useSignup } from '@/hooks';
import { FormField } from '@/components/forms';

export function SignupPage() {
  const { register, handleSubmit, errors, loading } = useSignup();

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <FormField
        {...register('email')}
        label="Email address"
        error={errors.email?.message}
        disabled={loading}
        required
      />
      {/* More fields... */}
      <Button type="submit" loading={loading}>
        Sign up
      </Button>
    </Box>
  );
}
```

## 🧩 Custom FormField Component

We've created a reusable `FormField` component that integrates all three libraries:

```typescript
// components/forms/FormField.tsx
interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, ...inputProps }, ref) => {
    return (
      <Box mb={4}>
        <Text mb={2} fontWeight="medium">
          {label}
          {required && <Text as="span" color="red.500" ml={1}>*</Text>}
        </Text>
        <Input
          {...inputProps}
          ref={ref}
          borderColor={error ? 'red.300' : undefined}
          _focus={{
            borderColor: error ? 'red.500' : 'blue.500',
            boxShadow: error
              ? '0 0 0 1px var(--chakra-colors-red-500)'
              : '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
        />
        {error && (
          <Text color="red.500" fontSize="sm" mt={1}>
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text color="gray.600" fontSize="sm" mt={1}>
            {helperText}
          </Text>
        )}
      </Box>
    );
  }
);
```

## 🔥 Advanced Features

### Custom Hook Options

```typescript
const { register, handleSubmit, errors, loading } = useSignup({
  redirectPath: PATHS.DASHBOARD, // Custom redirect
  onSuccess: (data) => {
    // Custom success handling
    analytics.track('user_signed_up', { email: data.email });
  },
  onError: (error) => {
    // Custom error handling
    console.error('Signup failed:', error);
  },
});
```

### Error Handling Utilities

```typescript
// utils/apiErrors.ts
export function extractApiError(error: FetchBaseQueryError | SerializedError): string {
  // Comprehensive error extraction logic
  if ('status' in error) {
    switch (error.status) {
      case 409:
        return 'This email is already registered';
      case 422:
        return 'Please check your input';
      default:
        return 'An unexpected error occurred';
    }
  }
  return 'Network error. Please try again.';
}
```

### Schema Composition

```typescript
// Reusable validation pieces
const emailValidation = z.string().email('Please enter a valid email address');
const passwordValidation = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase character')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
  .regex(/[0-9]/, 'Password must contain at least one numeric character');

// Compose into different schemas
export const signupSchema = z
  .object({
    name: nameValidation,
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: z.string(),
  })
  .refine(/* password matching logic */);

export const loginSchema = z.object({
  email: emailValidation,
  password: z.string().min(1, 'Password is required'),
});
```

## 🎨 ChakraUI Integration Patterns

### Custom Styling

```typescript
<FormField
  {...register('email')}
  label="Email"
  placeholder="Enter email"
  error={errors.email?.message}
  // ChakraUI props work seamlessly
  size="lg"
  variant="filled"
  bg="gray.50"
/>
```

### Loading States

```typescript
const loading = isSubmitting || isApiLoading;

<FormField
  {...register('email')}
  disabled={loading}
  placeholder={loading ? 'Loading...' : 'Enter email'}
/>

<Button
  type="submit"
  loading={loading}
  disabled={loading}
>
  {loading ? 'Submitting...' : 'Submit'}
</Button>
```

## 📋 Best Practices

1. **Separate Business Logic**: Use custom hooks for form logic
2. **Reusable Schemas**: Keep validation schemas in separate files
3. **Error Handling**: Create utility functions for consistent error handling
4. **Clean Components**: UI components should focus only on rendering
5. **Type Safety**: Use TypeScript throughout the entire flow
6. **Testing**: Test hooks and utilities independently
7. **Documentation**: Document hook interfaces and options

## 🧪 Testing Strategy

### Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';
import { useSignup } from '@/hooks/useSignup';

test('should handle successful signup', async () => {
  const { result } = renderHook(() => useSignup());

  await act(async () => {
    result.current.handleSubmit({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });
  });

  expect(result.current.loading).toBe(false);
  // Assert success behavior
});
```

### Testing Components

```typescript
import { render, screen } from '@testing-library/react';
import { SignupPage } from '@/pages/Signup';

test('should render signup form', () => {
  render(<SignupPage />);

  expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
});
```

## 🔧 Migration from Manual State

**Before (Mixed Concerns):**

```typescript
export function SignupPage() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    // Validation logic
    // API logic
    // Navigation logic
    // Error handling
  };

  return (
    // UI with inline logic
  );
}
```

**After (Clean Architecture):**

```typescript
// Custom hook handles all business logic
export function SignupPage() {
  const { register, handleSubmit, errors, loading } = useSignup();

  return (
    // Clean UI focused on rendering
    <FormField {...register('email')} error={errors.email?.message} />
  );
}
```

## 🚀 Performance Benefits

- **Fewer re-renders**: Uncontrolled components reduce re-renders
- **Better bundle size**: React Hook Form is lighter than alternatives
- **Optimized validation**: Only validates dirty fields
- **Efficient error handling**: Built-in error state management
- **Code splitting**: Business logic can be lazy-loaded independently

This setup provides a robust, type-safe, and performant foundation for all forms in the application! 🎉
