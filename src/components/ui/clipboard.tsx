// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { Clipboard as ChakraClipboard, Text, TextProps } from '@chakra-ui/react';

import { toaster } from './toaster';

const ClipboardRoot = ChakraClipboard.Root;
const ClipBoardTrigger = ChakraClipboard.Trigger;

interface ClipboardCopyTextProps extends TextProps {
  value: string;
}

export const ClipboardCopyText = forwardRef<HTMLDivElement, ClipboardCopyTextProps>(function ClipboardCopyText(
  { children, value, ...props },
  ref,
) {
  return (
    <ClipboardRoot
      value={value}
      onClick={() => toaster.create({ title: 'Copied to clipboard', type: 'success' })}
      ref={ref}
    >
      <ClipBoardTrigger asChild>
        <Text as="span" cursor="copy" _hover={{ textDecoration: 'underline' }} {...props}>
          {children}
        </Text>
      </ClipBoardTrigger>
    </ClipboardRoot>
  );
});
