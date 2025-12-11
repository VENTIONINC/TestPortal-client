import { forwardRef, ReactNode } from 'react';
import { Tooltip as ChakraTooltip } from '@chakra-ui/react';

export interface TooltipProps extends ChakraTooltip.RootProps {
  content: ReactNode;
  children: ReactNode;
}

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip({ content, children, ...props }, ref) {
  return (
    <ChakraTooltip.Root positioning={{ placement: 'top' }} {...props}>
      <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
      <ChakraTooltip.Positioner>
        <ChakraTooltip.Content ref={ref}>{content}</ChakraTooltip.Content>
      </ChakraTooltip.Positioner>
    </ChakraTooltip.Root>
  );
});
