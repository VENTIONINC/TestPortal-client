import { Link } from 'react-router';
import { Box, Button, Heading, Text, Container } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';
import { FormField } from '@/components/forms';
import { useLogin } from '@/hooks';

export function LoginPage() {
  const { register, handleSubmit, errors, loading, successMessage, errorMessage } = useLogin();

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" w="100%">
          <Heading size="lg" textAlign="center" mb={6}>
            Sign in to your account
          </Heading>

          {successMessage && (
            <Box
              bg="green.50"
              color="green.700"
              p={3}
              mb={4}
              borderRadius="md"
              border="1px solid"
              borderColor="green.200"
            >
              {successMessage}
            </Box>
          )}

          {errorMessage && (
            <Box bg="red.50" color="red.700" p={3} mb={4} borderRadius="md" border="1px solid" borderColor="red.200">
              {errorMessage}
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit}>
            <FormField
              {...register('email')}
              label="Email address"
              type="email"
              placeholder="Enter your email"
              disabled={loading}
              error={errors.email?.message}
              required
            />

            <FormField
              {...register('password')}
              label="Password"
              type="password"
              placeholder="Enter your password"
              disabled={loading}
              error={errors.password?.message}
              required
            />

            <Button type="submit" colorScheme="blue" width="100%" size="lg" mb={4} loading={loading} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
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
