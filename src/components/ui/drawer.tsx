import { forwardRef } from 'react';
import { Drawer as ChakraDrawer, Portal } from '@chakra-ui/react';

import { useDrawer } from '@/redux/slices/drawer';

import { CloseButton } from './close-button';

export interface DrawerProps extends ChakraDrawer.RootProps {
  title: string;
  onClose: () => void;
  contentProps?: DrawerContentProps;
}

export const Drawer = ({ title, onClose, contentProps, children, ...props }: DrawerProps) => {
  return (
    <ChakraDrawer.Root open onOpenChange={onClose} {...props}>
      <ChakraDrawer.Backdrop />
      <DrawerContent {...contentProps}>
        <ChakraDrawer.Header>
          <ChakraDrawer.Title>{title}</ChakraDrawer.Title>
        </ChakraDrawer.Header>

        {children}

        <DrawerCloseTrigger />
      </DrawerContent>
    </ChakraDrawer.Root>
  );
};

interface DrawerContentProps extends ChakraDrawer.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
  offset?: ChakraDrawer.ContentProps['padding'];
}

const DrawerContent = forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(props, ref) {
  const { children, portalled = true, portalRef, offset, ...rest } = props;
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraDrawer.Positioner padding={offset}>
        <ChakraDrawer.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDrawer.Content>
      </ChakraDrawer.Positioner>
    </Portal>
  );
});

const DrawerCloseTrigger = forwardRef<HTMLButtonElement, ChakraDrawer.CloseTriggerProps>(
  function DrawerCloseTrigger(props, ref) {
    return (
      <ChakraDrawer.CloseTrigger position="absolute" top="2" insetEnd="2" {...props} asChild>
        <CloseButton size="sm" ref={ref} />
      </ChakraDrawer.CloseTrigger>
    );
  },
);

export const DrawerBody = ChakraDrawer.Body;
export const DrawerFooter = ChakraDrawer.Footer;

export const DrawerPortal = () => {
  const drawers = useDrawer();

  if (!drawers.length) return null;

  return drawers.map(({ Component, props, ...rest }, index) => <Component key={index} {...props} {...rest} />);
};
