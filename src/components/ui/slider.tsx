// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { forwardRef, ReactNode } from 'react';
import { Slider as ChakraSlider, HStack, Text } from '@chakra-ui/react';

export interface SliderProps extends ChakraSlider.RootProps {
  marks?: Array<number | { value: number; label: React.ReactNode }>;
  label?: React.ReactNode;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(props, ref) {
  const { marks: marksProp, label, showValue, formatValue, ...rest } = props;
  const value = props.value ?? props.defaultValue;
  const rangeBg = 'bg.accent';

  const marks = marksProp?.map((mark) => {
    if (typeof mark === 'number') return { value: mark, label: undefined };
    return mark;
  });

  const hasMarkLabel = !!marks?.some((mark) => mark.label);

  return (
    <ChakraSlider.Root ref={ref} thumbAlignment="center" {...rest}>
      {label && !showValue && <ChakraSlider.Label>{label}</ChakraSlider.Label>}
      {label && showValue && (
        <HStack justify="space-between">
          <ChakraSlider.Label>{label}</ChakraSlider.Label>
          {formatValue ? <Text>{formatValue(value?.length ? value[0] : 0)}</Text> : <ChakraSlider.ValueText />}
        </HStack>
      )}
      <ChakraSlider.Control data-has-mark-label={hasMarkLabel || undefined}>
        <ChakraSlider.Track>
          <ChakraSlider.Range bg={rangeBg} />
        </ChakraSlider.Track>
        <ChakraSlider.Thumbs />
        <SliderMarks marks={marks} />
      </ChakraSlider.Control>
    </ChakraSlider.Root>
  );
});

interface SliderMarksProps {
  marks?: Array<number | { value: number; label: ReactNode }>;
}

const SliderMarks = forwardRef<HTMLDivElement, SliderMarksProps>(function SliderMarks(props, ref) {
  const { marks } = props;
  if (!marks?.length) return null;

  return (
    <ChakraSlider.MarkerGroup ref={ref}>
      {marks.map((mark, index) => {
        const value = typeof mark === 'number' ? mark : mark.value;
        const label = typeof mark === 'number' ? undefined : mark.label;
        return (
          <ChakraSlider.Marker key={index} value={value}>
            <ChakraSlider.MarkerIndicator />
            {label}
          </ChakraSlider.Marker>
        );
      })}
    </ChakraSlider.MarkerGroup>
  );
});
