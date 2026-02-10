import { forwardRef } from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

export interface BadgeProps extends Omit<ChakraBadgeProps, 'variant'> {
  variant?: 'solid' | 'outline' | 'surface';
  status?: 'info' | 'success' | 'warning' | 'error' | 'attention' | 'default';
}

export const Badge = forwardRef<BadgeProps, 'span'>(
  ({ variant = 'surface', status = 'default', children, ...props }, ref) => {
    const { badge } = useSurfaceColors();

    const statusColors = badge[status] || badge.default;
    const variantStyles = statusColors[variant];
    console.log(statusColors, status);
    return (
      <ChakraBadge
        ref={ref}
        variant={variant}
        status={status}
        // bg={variantStyles.bg}
        // color={variantStyles.color}
        // border={variantStyles.border}
        borderRadius="full"
        px="8px"
        py="4px"
        textTransform="none"
        fontSize="xs"
        fontWeight="medium"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        lineHeight="1.2"
        {...props}
      >
        {children}
      </ChakraBadge>
    );
  },
);
