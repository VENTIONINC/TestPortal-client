import { Box, Flex, Image } from '@chakra-ui/react';

import { useSurfaceColors } from '@/theme/useSurfaceColors';

export function LoadingPlaceholder() {
  const { surfaces } = useSurfaceColors();
  const bg = surfaces.page;

  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg={bg}>
      <Box mb={8}>
        <Image src="/image.png" alt="Test Analysis Portal" maxW="300px" h="auto" />
      </Box>
    </Flex>
  );
}
