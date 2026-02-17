import { forwardRef, ReactNode, Ref } from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';

import { Field, FieldProps, InputGroup, InputGroupProps } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export interface InputProps extends ChakraInputProps {
  label?: string;
  name: string;
  error?: string;
  hint?: string;
  startElement?: ReactNode;
  endElement?: ReactNode;
  groupProps?: InputGroupProps;
  fieldProps?: FieldProps;
}

export const Input = forwardRef(function Input(props: InputProps, ref: Ref<HTMLInputElement>) {
  const { label, error, startElement, endElement, groupProps, fieldProps, ...rest } = props;
  const { borders, text } = useSurfaceColors();

  const inputFocusBorder = borders.focus;
  const placeholderColor = text.muted;

  const sharedStyles: ChakraInputProps = {
    bg: rest.bg ?? 'bg.input',
    color: rest.color ?? 'text.primary',
    borderColor: rest.borderColor ?? 'border.main',
    _hover: {
      ...rest._hover,
      borderColor: rest._hover?.borderColor ?? 'border.subtle',
    },
    _focusVisible: {
      ...rest._focusVisible,
      borderColor: rest._focusVisible?.borderColor ?? 'border.active',
      boxShadow: rest._focusVisible?.boxShadow ?? `0 0 0 1px ${inputFocusBorder}`,
    },
    _placeholder: {
      ...rest._placeholder,
      color: rest._placeholder?.color ?? placeholderColor,
    },
  };

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      {startElement || endElement ? (
        <InputGroup w="full" startElement={startElement} endElement={endElement} {...groupProps}>
          <ChakraInput ref={ref} {...rest} {...sharedStyles} />
        </InputGroup>
      ) : (
        <ChakraInput ref={ref} {...rest} {...sharedStyles} />
      )}
    </Field>
  );
});
