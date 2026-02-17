import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { DatePicker, type DatePickerProps } from '@/components/ui/date-picker';

interface FormDatePickerProps<T extends FieldValues> extends Omit<DatePickerProps, 'name' | 'value' | 'onChange'> {
  name: Path<T>;
}

export const FormDatePicker = <T extends FieldValues>({ name, ...rest }: FormDatePickerProps<T>) => {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => (
        <DatePicker
          name={name}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          {...rest}
        />
      )}
    />
  );
};
