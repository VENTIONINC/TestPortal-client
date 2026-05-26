// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { Input, InputProps } from '@/components/ui';

interface FormDateInputProps<T extends FieldValues> extends Omit<InputProps, 'name' | 'type'> {
  name: Path<T>;
  error?: string;
}

export const FormDateInput = <T extends FieldValues>({ name, error, ...rest }: FormDateInputProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => (
        <Input
          type="date"
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          error={error}
          {...rest}
        />
      )}
    />
  );
};
