import { Box } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';

export const BasicWrapper = ({ children }: { children: React.ReactNode }) => {
  const bg = useColorModeValue('#EBEBEC', '#212126');

  return (
    <Box minH="100vh" bg={bg} padding="30px 50px">
      {children}
    </Box>
  );
};
