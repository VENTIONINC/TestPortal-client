import { Card as ChakraCard, CardRootProps, CardTitleProps, CardDescriptionProps } from '@chakra-ui/react';
import { forwardRef } from 'react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { useColorModeValue } from '@/components/ui';

const Root = forwardRef<HTMLDivElement, CardRootProps>(function CardRoot(props, ref) {
  const { backgroundColor, text } = useSurfaceColors();
  const shadow = useColorModeValue('0px 1px 2px rgba(0, 0, 0, 0.08)', '0px 1px 2px rgba(255, 255, 255, 0.08)');

  return (
    <ChakraCard.Root
      ref={ref}
      bg={backgroundColor.primary}
      color={text.primary}
      shadow={shadow}
      borderRadius="12px"
      {...props}
    >
      {props.children}
    </ChakraCard.Root>
  );
});

const Title = forwardRef<HTMLDivElement, CardTitleProps>(function CardTitle(props, ref) {
  const { text } = useSurfaceColors();
  return (
    <ChakraCard.Title ref={ref} fontWeight="500" fontSize="18px" lineHeight="26px" color={text.primary} {...props}>
      {props.children}
    </ChakraCard.Title>
  );
});

const Description = forwardRef<HTMLDivElement, CardDescriptionProps>(function CardDescription(props, ref) {
  const { text } = useSurfaceColors();
  return (
    <ChakraCard.Description
      ref={ref}
      fontWeight="400"
      fontSize="14px"
      lineHeight="22px"
      color={text.secondary}
      {...props}
    >
      {props.children}
    </ChakraCard.Description>
  );
});

export const Card = {
  Root,
  Header: ChakraCard.Header,
  Body: ChakraCard.Body,
  Footer: ChakraCard.Footer,
  Title,
  Description,
};
