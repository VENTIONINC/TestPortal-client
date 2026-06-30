// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { MultiSelect, MultiSelectProps } from '@/components/ui/multi-select';

interface FormMultiSelectProps<T extends FieldValues> extends Omit<MultiSelectProps, 'name' | 'value' | 'onChange'> {
  name: Path<T>;
}

export const FormMultiSelect = <T extends FieldValues>({ name, ...rest }: FormMultiSelectProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => {
        const arrayValue = typeof value === 'string' && value.length > 0
          ? value.split(',')
          : Array.isArray(value)
            ? value
            : [];

        return (
          <MultiSelect
            name={name}
            value={arrayValue}
            onChange={(newValue) => onChange(newValue.join(','))}
            onBlur={onBlur}
            {...rest}
          />
        );
      }}
    />
  );
};
