import { forwardRef, ReactNode, useMemo } from 'react';
import { NativeSelect as Select } from '@chakra-ui/react';

import { Field, useColorModeValue } from '@/components/ui';

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

  const selectBg = useColorModeValue('white', 'gray.900');
  const selectBorder = useColorModeValue('gray.200', 'gray.600');
  const selectHoverBorder = useColorModeValue('gray.300', 'gray.500');
  const selectFocusBorder = useColorModeValue('blue.500', 'blue.300');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  const sharedStyles: Select.FieldProps = {
    bg: rest.bg ?? selectBg,
    borderColor: rest.borderColor ?? selectBorder,
    _hover: {
      ...rest._hover,
      borderColor: rest._hover?.borderColor ?? selectHoverBorder,
    },
    _focusVisible: {
      ...rest._focusVisible,
      borderColor: rest._focusVisible?.borderColor ?? selectFocusBorder,
      boxShadow: rest._focusVisible?.boxShadow ?? `0 0 0 1px ${selectFocusBorder}`,
    },
    _placeholder: {
      ...rest._placeholder,
      color: rest._placeholder?.color ?? placeholderColor,
    },
  };

  const items = useMemo(
    () => itemsProp?.map((item) => (typeof item === 'string' ? { label: item, value: item } : item)),
    [itemsProp],
  );

  return (
    <Select.Field ref={ref} {...rest} {...sharedStyles}>
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
