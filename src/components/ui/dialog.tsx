import { forwardRef, RefObject } from 'react';
import { Dialog as ChakraDialog, DialogRootProps, Portal } from '@chakra-ui/react';

import { useDialog } from '@/redux/slices/dialog';

import { CloseButton } from './close-button';

export interface DialogProps extends DialogRootProps {
  title: string;
  onClose: () => void;
  titleProps?: ChakraDialog.TitleProps;
}

export const Dialog = ({ title, onClose, titleProps, children, ...props }: DialogProps) => {
  return (
    <ChakraDialog.Root
      open
      onOpenChange={onClose}
      placement={{ base: 'top', md: 'center' }}
      scrollBehavior="inside"
      {...props}
    >
      <DialogContent>
        <DialogCloseTrigger />

        <ChakraDialog.Header>
          <ChakraDialog.Title {...titleProps}>{title}</ChakraDialog.Title>
        </ChakraDialog.Header>
        {children}
      </DialogContent>
    </ChakraDialog.Root>
  );
};

interface DialogContentProps extends ChakraDialog.ContentProps {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement>;
  backdrop?: boolean;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(props, ref) {
  const { children, portalled = true, portalRef, backdrop = true, ...rest } = props;

  return (
    <Portal disabled={!portalled} container={portalRef}>
      {backdrop && <ChakraDialog.Backdrop />}
      <ChakraDialog.Positioner>
        <ChakraDialog.Content ref={ref} {...rest} asChild={false}>
          {children}
        </ChakraDialog.Content>
      </ChakraDialog.Positioner>
    </Portal>
  );
});

const DialogCloseTrigger = forwardRef<HTMLButtonElement, ChakraDialog.CloseTriggerProps>(function DialogCloseTrigger(
  props,
  ref,
) {
  return (
    <ChakraDialog.CloseTrigger position="absolute" top="2" insetEnd="2" {...props} asChild>
      <CloseButton size="sm" ref={ref}>
        {props.children}
      </CloseButton>
    </ChakraDialog.CloseTrigger>
  );
});

export const DialogBody = ChakraDialog.Body;
export const DialogFooter = ChakraDialog.Footer;

export const DialogPortal = () => {
  const dialogs = useDialog();

  if (!dialogs.length) return null;

  return dialogs.map(({ Component, props, ...rest }, index) => <Component key={index} {...props} {...rest} />);
};
