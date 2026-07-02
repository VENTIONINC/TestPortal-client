# Forms with React Hook Form + Zod + ChakraUI

This project uses a powerful combination of **React Hook Form**, **Zod**, and **ChakraUI** for form handling and validation.

## 🚀 Why This Combination?

- **React Hook Form**: Minimal re-renders, uncontrolled components, and less boilerplate.
- **Zod**: TypeScript-first schema validation with great error messages and runtime safety.
- **ChakraUI**: Accessible, consistent, and customizable UI components.

## 🏗️ Clean Architecture

We follow clean architecture principles by separating business logic from UI components.

### **File Structure Pattern**

```
src/
├── schemas/
│   └── [feature]Schemas.ts     # Validation schemas (Zod)
├── hooks/
│   └── use[Feature].ts         # Business logic & form state (RHF)
├── components/
│   └── forms/
│       └── FormField.tsx       # Reusable UI wrapper
└── pages/
    └── [Feature]/
        └── index.tsx           # Clean UI component (Rendering only)
```

### **Benefits**

- ✅ **Separation of Concerns**: UI components focus only on rendering.
- ✅ **Reusable Logic**: Business logic can be shared across components.
- ✅ **Testability**: Hooks and utilities can be unit tested independently.
- ✅ **Maintainability**: Changes to business logic don't affect UI structure.

## 🎯 Implementation Pattern

### 1. Define Schema

Define the shape and validation rules of your form data.

```typescript
// src/schemas/exampleSchema.ts
import { z } from 'zod';

export const exampleSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Too short'),
});

export type ExampleFormData = z.infer<typeof exampleSchema>;
```

### 2. Create Custom Hook

Encapsulate form logic, API calls, and navigation.

```typescript
// src/hooks/useExample.ts
export function useExample() {
  const form = useForm<ExampleFormData>({
    resolver: zodResolver(exampleSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ExampleFormData) => {
    // Handle API logic, success/error notifications, and navigation here
  };

  return {
    ...form,
    handleSubmit: form.handleSubmit(onSubmit),
    loading: form.formState.isSubmitting,
  };
}
```

### 3. Clean UI Component

Use the hook and `FormField` to keep the component declarative.

```tsx
// src/pages/Example/index.tsx
export function ExamplePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    loading,
  } = useExample();

  return (
    <form onSubmit={handleSubmit}>
      <FormField {...register('email')} label="Email" error={errors.email?.message} disabled={loading} />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
}
```

## 🧩 Reusable FormField

The `FormField` component (found in `src/components/forms/FormField.tsx`) is a wrapper that handles:

- Label rendering (with required indicator)
- Input registration (via `ref` forwarding)
- Error message display
- Helper text display
- ChakraUI styling integration

## 🔥 Advanced Patterns

### Schema Composition

Reuse validation pieces across different schemas to ensure consistency.

```typescript
const passwordRules = z.string().min(8).regex(/[a-z]/).regex(/[A-Z]/);

export const signupSchema = z
  .object({
    password: passwordRules,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
```

### Error Handling

Use utility functions (like `extractApiError`) to transform backend errors into user-friendly messages that can be set via `setError('root', ...)` or displayed in toasts.

## 📋 Best Practices

1. **Keep Components Dumb**: If a component has more than 2-3 lines of form logic, move it to a hook.
2. **Validate Early**: Use `mode: 'onBlur'` or `'onChange'` for better UX.
3. **Type Everything**: Always infer types from Zod schemas using `z.infer<typeof schema>`.
4. **Centralize Schemas**: Keep schemas in `src/schemas` so they can be reused by both hooks and components.
5. **Use FormField**: Avoid manual `FormControl`, `FormLabel`, and `FormErrorMessage` boilerplate.

## 🧪 Testing Strategy

- **Test Hooks**: Use `@testing-library/react`'s `renderHook` to test form submission logic and validation triggers.
- **Test Components**: Use `screen.getByLabelText` and `userEvent` to test the end-to-end form flow.

---

This architecture ensures that as the project grows, our forms remain maintainable, type-safe, and easy to test. 🚀
