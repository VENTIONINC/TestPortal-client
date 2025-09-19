import { forwardRef } from 'react';
import { ButtonProps, IconButton as ChakraIconButton } from '@chakra-ui/react';
import { LuEllipsisVertical } from 'react-icons/lu';

import { useColorModeValue } from '@/components/ui';

export interface ContextMenuButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ContextMenuButton = forwardRef<HTMLButtonElement, ContextMenuButtonProps>(function ContextMenuButton(
  { onClick, ...props },
  ref,
) {
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const activeBgColor = useColorModeValue('gray.200', 'gray.600');
  const iconColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <ChakraIconButton
      variant="ghost"
      size="sm"
      aria-label="More options"
      color={iconColor}
      _hover={{
        bg: hoverBgColor,
        color: useColorModeValue('gray.700', 'gray.300'),
      }}
      _active={{
        bg: activeBgColor,
        transform: 'scale(0.95)',
      }}
      transition="all 0.2s"
      borderRadius="md"
      ref={ref}
      onClick={onClick}
      data-testid="context-menu-button"
      {...props}
    >
      <LuEllipsisVertical size={16} />
    </ChakraIconButton>
  );
});
