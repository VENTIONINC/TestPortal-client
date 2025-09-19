import { Box, Flex, Image } from '@chakra-ui/react';

export function LoadingPlaceholder() {
  return (
    <Flex direction="column" align="center" justify="center" minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }}>
      <Box mb={8}>
        <Image src="/image.png" alt="Test Analysis Portal" maxW="300px" h="auto" />
      </Box>
    </Flex>
  );
}
