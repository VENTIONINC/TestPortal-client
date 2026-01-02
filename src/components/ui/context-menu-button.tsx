import { forwardRef } from 'react';
import { ButtonProps, IconButton as ChakraIconButton } from '@chakra-ui/react';
import { LuEllipsisVertical } from 'react-icons/lu';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

export interface ContextMenuButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ContextMenuButton = forwardRef<HTMLButtonElement, ContextMenuButtonProps>(function ContextMenuButton(
  { onClick, ...props },
  ref,
) {
  const { states, text } = useSurfaceColors();
  const hoverBgColor = states.hoverSubtle;
  const activeBgColor = states.selected;
  const iconColor = text.muted;

  return (
    <ChakraIconButton
      variant="ghost"
      size="sm"
      aria-label="More options"
      color={iconColor}
      _hover={{
        bg: hoverBgColor,
        color: text.primary,
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
