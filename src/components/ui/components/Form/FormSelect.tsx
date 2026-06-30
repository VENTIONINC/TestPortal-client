// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { NativeSelect, NativeSelectProps } from '@/components/ui';

interface FormSelectProps<T extends FieldValues> extends Omit<NativeSelectProps, 'name'> {
  name: Path<T>;
  error?: string;
}

export const FormSelect = <T extends FieldValues>({ name, error, ...rest }: FormSelectProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => (
        <NativeSelect name={name} value={value ?? ''} onChange={onChange} onBlur={onBlur} error={error} {...rest} />
      )}
    />
  );
};
