// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { ButtonProps, IconButton as ChakraIconButton } from '@chakra-ui/react';
import { LuEllipsisVertical } from 'react-icons/lu';

export interface ContextMenuButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ContextMenuButton = forwardRef<HTMLButtonElement, ContextMenuButtonProps>(function ContextMenuButton(
  { onClick, ...props },
  ref,
) {
  return (
    <ChakraIconButton
      variant="ghost"
      size="sm"
      aria-label="More options"
      color="bg.primary.default"
      bg="bg.primary.default"
      _hover={{
        bg: 'bg.primary.hover',
        color: 'bg.primary.focus',
      }}
      _active={{
        bg: 'bg.primary.active',
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
