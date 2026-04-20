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
      render={({ field: { value, onChange, onBlur } }) => (
        <MultiSelect
          name={name}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          onBlur={onBlur}
          {...rest}
        />
      )}
    />
  );
};
