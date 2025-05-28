import React, { forwardRef } from 'react';
import { Field as ChakraField } from '@chakra-ui/react';

export interface FieldProps extends ChakraField.RootProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  errorText?: React.ReactNode;
  optionalText?: React.ReactNode;
  labelProps?: ChakraField.LabelProps;
}

export const Field = forwardRef<HTMLDivElement, FieldProps>(function Field(props, ref) {
  const { label, children, helperText, errorText, optionalText, labelProps, ...rest } = props;

  return (
    <ChakraField.Root ref={ref} {...rest}>
      {label && (
        <ChakraField.Label {...labelProps}>
          {label}
          <ChakraField.RequiredIndicator fallback={optionalText} />
        </ChakraField.Label>
      )}
      {children}
      {helperText && <ChakraField.HelperText>{helperText}</ChakraField.HelperText>}
      {errorText && <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>}
    </ChakraField.Root>
  );
});
