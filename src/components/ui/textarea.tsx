import { forwardRef } from 'react';
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';

import { Field, FieldProps } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  name: string;
  error?: string | boolean;
  fieldProps?: FieldProps;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { label, error, fieldProps, ...rest } = props;
  const { borders, text } = useSurfaceColors();

  const placeholderColor = text.muted;
  const inputFocusBorder = borders.focus;

  const sharedStyles: ChakraTextareaProps = {
    bg: rest.bg ?? 'bg.input',
    color: rest.color ?? 'text.primary',
    borderColor: rest.borderColor ?? 'border.main',
    _hover: {
      ...rest._hover,
      borderColor: rest._hover?.borderColor ?? 'border.main',
    },
    _focusVisible: {
      ...rest._focusVisible,
      borderColor: rest._focusVisible?.borderColor ?? 'border.focus',
      boxShadow: rest._focusVisible?.boxShadow ?? `0 0 0 1px ${inputFocusBorder}`,
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
