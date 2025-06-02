import { useState } from 'react';
import { Link } from 'react-router';
import { Box, Button, Input, Heading, Text, Container } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    // eslint-disable-next-line no-console
    console.log('Login:', { email, password });
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" w="100%">
          <Heading size="lg" textAlign="center" mb={6}>
            Sign in to your account
          </Heading>

          <Box as="form" onSubmit={handleSubmit}>
            <Box mb={4}>
              <Text mb={2} fontWeight="medium">
                Email address
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Box>

            <Box mb={6}>
              <Text mb={2} fontWeight="medium">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </Box>

            <Button type="submit" colorScheme="blue" width="100%" size="lg" mb={4}>
              Sign in
            </Button>
          </Box>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link to={PATHS.SIGNUP}>
              <Text as="span" color="blue.500" textDecoration="underline">
                Sign up
              </Text>
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
