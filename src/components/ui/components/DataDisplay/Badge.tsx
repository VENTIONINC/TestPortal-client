// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export interface BadgeProps extends Omit<ChakraBadgeProps, 'variant'> {
  variant?: 'solid' | 'outline' | 'surface';
  status?: 'info' | 'success' | 'warning' | 'error' | 'attention' | 'default';
  isCapitalize?: boolean;
  isBoxShadow?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'surface', isBoxShadow = false, status = 'default', isCapitalize = true, children, ...props }, ref) => {
    return (
      <ChakraBadge
        ref={ref}
        variant={variant}
        bg={variant === 'surface' ? `badge.${status}.bg` : variant === 'solid' ? `badge.${status}.text` : 'transparent'}
        color={variant === 'solid' ? 'bg.page' : `badge.${status}.text`}
        borderColor={variant === 'outline' ? `badge.${status}.text` : 'transparent'}
        borderWidth={variant === 'outline' ? '1px' : undefined}
        borderRadius="full"
        px="8px"
        py="4px"
        textTransform={isCapitalize ? 'capitalize' : 'none'}
        fontSize="xs"
        fontWeight="medium"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        boxShadow={isBoxShadow ? 'card' : 'none'}
        lineHeight="1.2"
        {...props}
      >
        {children}
      </ChakraBadge>
    );
  },
);
