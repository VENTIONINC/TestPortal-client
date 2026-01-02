import { forwardRef } from 'react';
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';

import { Field, FieldProps, useColorModeValue } from '@/components/ui';

export interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  name: string;
  error?: string | boolean;
  fieldProps?: FieldProps;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { label, error, fieldProps, ...rest } = props;

  const textareaBg = useColorModeValue('white', 'gray.900');
  const textareaBorder = useColorModeValue('gray.200', 'gray.600');
  const textareaHoverBorder = useColorModeValue('gray.300', 'gray.500');
  const textareaFocusBorder = useColorModeValue('blue.500', 'blue.300');
  const placeholderColor = useColorModeValue('gray.500', 'gray.400');

  const sharedStyles: ChakraTextareaProps = {
    bg: rest.bg ?? textareaBg,
    borderColor: rest.borderColor ?? textareaBorder,
    _hover: {
      ...rest._hover,
      borderColor: rest._hover?.borderColor ?? textareaHoverBorder,
    },
    _focusVisible: {
      ...rest._focusVisible,
      borderColor: rest._focusVisible?.borderColor ?? textareaFocusBorder,
      boxShadow: rest._focusVisible?.boxShadow ?? `0 0 0 1px ${textareaFocusBorder}`,
    },
    _placeholder: {
      ...rest._placeholder,
      color: rest._placeholder?.color ?? placeholderColor,
    },
  };

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      <ChakraTextarea ref={ref} {...rest} {...sharedStyles} />
    </Field>
  );
});
