import React, { cloneElement, forwardRef } from 'react';
import { BoxProps, Group, InputElement, InputElementProps } from '@chakra-ui/react';

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps;
  endElementProps?: InputElementProps;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  children: React.ReactElement<object>;
}

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(props, ref) {
  const { startElement, startElementProps, endElement, endElementProps, children, ...rest } = props;

  return (
    <Group ref={ref} {...rest}>
      {startElement && (
        <InputElement pointerEvents="none" {...startElementProps}>
          {startElement}
        </InputElement>
      )}
      {cloneElement(children, {
        ...(startElement && { ps: 'var(--input-height)' }),
        ...(endElement && { pe: 'var(--input-height)' }),
        ...children.props,
      })}
      {endElement && (
        <InputElement placement="end" {...endElementProps}>
          {endElement}
        </InputElement>
      )}
    </Group>
  );
});
