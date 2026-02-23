import { forwardRef } from 'react';
import { Badge as ChakraBadge, BadgeProps as ChakraBadgeProps } from '@chakra-ui/react';

export interface BadgeProps extends Omit<ChakraBadgeProps, 'variant'> {
  variant?: 'solid' | 'outline' | 'surface';
  status?: 'info' | 'success' | 'warning' | 'error' | 'attention' | 'default';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'surface', status = 'default', children, ...props }, ref) => {
    return (
      <ChakraBadge
        ref={ref}
        variant={variant}
        status={status}
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
