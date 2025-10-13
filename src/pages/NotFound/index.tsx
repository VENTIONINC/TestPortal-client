import { Link } from 'react-router';
import { Box, Container, Heading, Text, Button } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';

export function NotFoundPage() {
  return (
    <Box minH="100vh" bg="gray.50" py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box textAlign="center">
          <Heading fontSize="9xl" fontWeight="bold" color="blue.500" mb={8}>
            404
          </Heading>

          <Box mb={8}>
            <Heading size="xl" mb={4}>
              Page not found
            </Heading>
            <Text color="gray.600">Sorry, we couldn't find the page you're looking for.</Text>
          </Box>

          <Box mb={8}>
            <Link to={PATHS.ROOT}>
              <Button colorScheme="blue" size="lg">
                Go back home
              </Button>
            </Link>
          </Box>

          <Box>
            <Heading size="lg" mb={4}>
              Popular pages
            </Heading>
            <Box>
              <Box mb={2}>
                <Link to={PATHS.RESULTS}>
                  <Text color="blue.500" textDecoration="underline">
                    Results
                  </Text>
                </Link>
              </Box>
              <Box mb={2}>
                <Link to={PATHS.ISSUES}>
                  <Text color="blue.500" textDecoration="underline">
                    Issues
                  </Text>
                </Link>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
