import { forwardRef, ReactNode, Ref } from 'react';
import { Input as ChakraInput, InputProps as ChakraInputProps } from '@chakra-ui/react';

import { Field, FieldProps, InputGroup, InputGroupProps } from '@/components/ui';

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

  return (
    <Field label={label} errorText={error} invalid={Boolean(error)} {...fieldProps}>
      {startElement || endElement ? (
        <InputGroup w="full" startElement={startElement} endElement={endElement} {...groupProps}>
          <ChakraInput ref={ref} {...rest} />
        </InputGroup>
      ) : (
        <ChakraInput ref={ref} {...rest} />
      )}
    </Field>
  );
});
