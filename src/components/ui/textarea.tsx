import { forwardRef } from 'react';
import { Textarea as ChakraTextarea, TextareaProps as ChakraTextareaProps } from '@chakra-ui/react';

import { Field, FieldProps } from '@/components/ui';

export interface TextareaProps extends ChakraTextareaProps {
  label?: string;
  name: string;
  error?: string | boolean;
  fieldProps?: FieldProps;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(props, ref) {
  const { label, error, fieldProps, ...rest } = props;

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      <ChakraTextarea ref={ref} {...rest} />
    </Field>
  );
});
