// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef } from 'react';
import { Progress as ChakraProgress } from '@chakra-ui/react';

export const ProgressBar = forwardRef<HTMLDivElement, ChakraProgress.TrackProps>(function ProgressBar(props, ref) {
  return (
    <ChakraProgress.Track {...props} ref={ref}>
      <ChakraProgress.Range />
    </ChakraProgress.Track>
  );
});

export type ProgressLabelProps = ChakraProgress.LabelProps;

export const ProgressLabel = forwardRef<HTMLDivElement, ProgressLabelProps>(function ProgressLabel(props, ref) {
  const { children, ...rest } = props;
  return (
    <ChakraProgress.Label {...rest} ref={ref}>
      {children}
    </ChakraProgress.Label>
  );
});

export const ProgressRoot = ChakraProgress.Root;
export const ProgressValueText = ChakraProgress.ValueText;
