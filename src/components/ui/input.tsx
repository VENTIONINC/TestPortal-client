import { forwardRef, ReactNode, Ref } from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';

import { Field, FieldProps, InputGroup, InputGroupProps, useColorModeValue } from '@/components/ui';

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

  const inputBg = useColorModeValue('white', 'gray.900');
  const inputBorder = useColorModeValue('gray.200', 'gray.600');
  const inputHoverBorder = useColorModeValue('gray.300', 'gray.500');
  const inputFocusBorder = useColorModeValue('blue.500', 'blue.300');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  const sharedStyles: ChakraInputProps = {
    bg: rest.bg ?? inputBg,
    borderColor: rest.borderColor ?? inputBorder,
    _hover: {
      ...rest._hover,
      borderColor: rest._hover?.borderColor ?? inputHoverBorder,
    },
    _focusVisible: {
      ...rest._focusVisible,
      borderColor: rest._focusVisible?.borderColor ?? inputFocusBorder,
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
