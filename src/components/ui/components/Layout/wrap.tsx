import { Wrap as ChakraWrap, WrapProps } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';
import { useSurfaceColors } from '@/theme/useSurfaceColors';

export const Wrap = (props: WrapProps) => {
  const { backgroundColor } = useSurfaceColors();
  const shadow = useColorModeValue('0px 1px 2px rgba(0, 0, 0, 0.08)', '0px 1px 2px rgba(255, 255, 255, 0.08)');

  return <ChakraWrap p="16px" gap="16px" bg={backgroundColor.primary} shadow={shadow} borderRadius="12px" {...props} />;
};
