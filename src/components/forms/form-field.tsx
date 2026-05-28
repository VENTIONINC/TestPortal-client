// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { Box, Text } from '@chakra-ui/react';

import { Input, InputProps } from '@/components/ui';

interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, ...inputProps }, ref) => {
    const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Box mb={4}>
        <Text mb={2} fontWeight="medium">
          {label}
          {required && (
            <Text as="span" color="red.500" ml={1}>
              *
            </Text>
          )}
        </Text>
        <Input
          {...inputProps}
          ref={ref}
          id={fieldId}
          borderColor={error ? 'red.300' : undefined}
          _focus={{
            borderColor: error ? 'red.500' : 'blue.500',
            boxShadow: error ? '0 0 0 1px var(--chakra-colors-red-500)' : '0 0 0 1px var(--chakra-colors-blue-500)',
          }}
        />
        {error && (
          <Text color="red.500" fontSize="sm" mt={1}>
            {error}
          </Text>
        )}
        {helperText && !error && (
          <Text color="gray.600" fontSize="sm" mt={1}>
            {helperText}
          </Text>
        )}
      </Box>
    );
  },
);

FormField.displayName = 'FormField';
