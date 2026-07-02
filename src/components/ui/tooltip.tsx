// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef, ReactNode, type ComponentPropsWithoutRef } from 'react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';

type TooltipContentProps = ComponentPropsWithoutRef<typeof ChakraTooltip.Content>;

export interface TooltipProps extends ChakraTooltip.RootProps {
  content: ReactNode;
  children: ReactNode;
  contentProps?: TooltipContentProps;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { content, children, contentProps, ...props },
  ref,
) {
  const contentBg = 'bg.panel';
  const contentColor = 'text.primary';
  const contentBorder = 'border.subtle';
  const mergedContentProps: TooltipContentProps = {
    bg: contentBg,
    color: contentColor,
    borderWidth: '1px',
    borderColor: contentBorder,
    boxShadow: 'sm',
    px: 2,
    py: 1,
    ...contentProps,
  };

  return (
    <ChakraTooltip.Root positioning={{ placement: 'top' }} {...props}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content ref={ref} {...mergedContentProps}>
          {content}
        </ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  );
});
