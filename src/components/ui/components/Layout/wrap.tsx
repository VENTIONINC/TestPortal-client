import { Wrap as ChakraWrap, WrapProps } from '@chakra-ui/react';

export const Wrap = (props: WrapProps) => {
  return <ChakraWrap p="16px" gap="16px" bg="bg.section" shadow="sm" borderRadius="12px" {...props} />;
};
