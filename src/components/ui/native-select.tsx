import { forwardRef, ReactNode, useMemo } from 'react';
import { NativeSelect as Select } from '@chakra-ui/react';

import { Field } from './field';

export interface NativeSelectProps extends NativeSelectField {
  label?: string;
  error?: string;
}

export const NativeSelect = ({ label, error, ...props }: NativeSelectProps) => {
  return (
    <Field label={label} errorText={error} invalid={Boolean(error)}>
      <NativeSelectRoot>
        <NativeSelectField {...props}></NativeSelectField>
      </NativeSelectRoot>
    </Field>
  );
};

interface NativeSelectRootProps extends Select.RootProps {
  icon?: ReactNode;
}

const NativeSelectRoot = forwardRef<HTMLDivElement, NativeSelectRootProps>(function NativeSelect(props, ref) {
  const { icon, children, ...rest } = props;

  return (
    <Select.Root ref={ref} {...rest}>
      {children}
      <Select.Indicator>{icon}</Select.Indicator>
    </Select.Root>
  );
});

interface NativeSelectItem {
  value: string;
  label: string;
  disabled?: boolean;
}

interface NativeSelectField extends Select.FieldProps {
  items?: Array<string | NativeSelectItem>;
}

const NativeSelectField = forwardRef<HTMLSelectElement, NativeSelectField>(function NativeSelectField(props, ref) {
  const { items: itemsProp, children, placeholder, ...rest } = props;

  const items = useMemo(
    () => itemsProp?.map((item) => (typeof item === 'string' ? { label: item, value: item } : item)),
    [itemsProp],
  );

  return (
    <Select.Field ref={ref} {...rest}>
      {children}
      {placeholder && (
        <option disabled value="">
          {placeholder}
        </option>
      )}
      {items?.map((item) => (
        <option key={item.value} value={item.value} disabled={item.disabled}>
          {item.label}
        </option>
      ))}
    </Select.Field>
  );
});
