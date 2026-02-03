import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';
import { forwardRef } from 'react';
import { LuArrowRight } from 'react-icons/lu';

import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { useColorModeValue } from '@/components/ui/color-mode';

export interface ButtonProps extends ChakraButtonProps {
  variant?: 'primary' | 'destructive' | 'outline' | 'ghost';
  withArrow?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', withArrow, children, ...props }, ref) => {
    const { borders, text } = useSurfaceColors();
    const ghostHover = useColorModeValue('gray.50', 'whiteAlpha.100');
    const activeBg = useColorModeValue('gray.100', 'whiteAlpha.200');

    const styles = {
      primary: {
        bg: '#3054FE',
        color: 'white',
        _hover: {
          bg: '#1A35CB',
          _disabled: {
            bg: '#3054FE',
          },
        },
        _active: {
          bg: '#1A35CB',
        },
      },
      destructive: {
        bg: '#DC2626',
        color: 'white',
        _hover: {
          bg: '#B91C1C',
          _disabled: {
            bg: '#DC2626',
          },
        },
        _active: {
          bg: '#B91C1C',
        },
      },
      outline: {
        bg: 'transparent',
        border: '1px solid',
        borderColor: borders.subtle,
        color: text.primary,
        _hover: {
          bg: ghostHover,
        },
        _active: {
          bg: activeBg,
        },
      },
      ghost: {
        bg: 'transparent',
        color: text.primary,
        _hover: {
          bg: ghostHover,
        },
        _active: {
          bg: activeBg,
        },
      },
    };

    const selectedStyle = styles[variant as keyof typeof styles] || styles.primary;

    return (
      <ChakraButton
        ref={ref}
        // h="40px"
        borderRadius="4px"
        // fontWeight="medium"
        // fontSize="sm"
        px={4}
        {...selectedStyle}
        {...props}
      >
        {children}
        {withArrow && <LuArrowRight />}
      </ChakraButton>
    );
  },
);

Button.displayName = 'Button';
