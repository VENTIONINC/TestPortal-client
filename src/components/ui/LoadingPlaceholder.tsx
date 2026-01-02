import { Box, Flex, Image } from '@chakra-ui/react';

import { useColorModeValue } from '@/components/ui';

export function LoadingPlaceholder() {
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg={bg}>
      <Box mb={8}>
        <Image src="/image.png" alt="Test Analysis Portal" maxW="300px" h="auto" />
      </Box>
    </Flex>
  );
}
