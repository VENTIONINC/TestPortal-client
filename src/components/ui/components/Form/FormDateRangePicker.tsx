// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { useFormContext, useWatch } from 'react-hook-form';

import { DateRangePicker, type DateRangePickerProps } from '@/components/ui/date-range-picker';

interface FormDateRangePickerProps extends Omit<
  DateRangePickerProps,
  'name' | 'fromValue' | 'toValue' | 'onChangeFrom' | 'onChangeTo'
> {
  fromName: string;
  toName: string;
  name?: string;
}

export const FormDateRangePicker = ({ fromName, toName, name, ...rest }: FormDateRangePickerProps) => {
  const { setValue } = useFormContext();
  const fromValue = useWatch({ name: fromName }) as string | undefined;
  const toValue = useWatch({ name: toName }) as string | undefined;
  const { onClear, ...pickerProps } = rest;

  return (
    <DateRangePicker
      name={name ?? `${fromName}-${toName}`}
      fromValue={fromValue ?? ''}
      toValue={toValue ?? ''}
      onChangeFrom={(value) => setValue(fromName, value, { shouldDirty: true })}
      onChangeTo={(value) => setValue(toName, value, { shouldDirty: true })}
      onClear={
        onClear
          ? () => {
              setValue(fromName, '', { shouldDirty: true });
              setValue(toName, '', { shouldDirty: true });
              onClear();
            }
          : undefined
      }
      {...pickerProps}
    />
  );
};
