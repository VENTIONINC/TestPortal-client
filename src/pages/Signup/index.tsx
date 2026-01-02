import { Link } from 'react-router';
import { Box, Button, Heading, Text, Container } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';
import { FormField } from '@/components/forms';
import { useSignup } from '@/hooks';
import { useColorModeValue } from '@/components/ui';

export function SignupPage() {
  const { register, handleSubmit, errors, loading, errorMessage } = useSignup();

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const errorBg = useColorModeValue('red.50', 'red.900');
  const errorText = useColorModeValue('red.700', 'red.100');
  const errorBorder = useColorModeValue('red.200', 'red.700');
  const linkColor = useColorModeValue('blue.500', 'blue.300');

  return (
    <Box minH="100vh" bg={pageBg} py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box bg={cardBg} p={8} borderRadius="lg" boxShadow="lg" w="100%">
          <Heading size="lg" textAlign="center" mb={6}>
            Create your account
          </Heading>

          {errorMessage && (
            <Box
              bg={errorBg}
              color={errorText}
              p={3}
              mb={4}
              borderRadius="md"
              border="1px solid"
              borderColor={errorBorder}
            >
              {errorMessage}
            </Box>
          )}

          <Box as="form" onSubmit={handleSubmit}>
            <FormField
              {...register('name')}
              label="Full name"
              placeholder="Enter your full name"
              disabled={loading}
              error={errors.name?.message}
              required
            />

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
              helperText="Must be at least 8 characters and contain lowercase, uppercase, and numeric characters"
              required
            />

            <FormField
              {...register('confirmPassword')}
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              disabled={loading}
              error={errors.confirmPassword?.message}
              required
            />

            <Button type="submit" colorScheme="blue" width="100%" size="lg" mb={4} loading={loading} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </Box>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link to={PATHS.LOGIN}>
              <Text as="span" color={linkColor} textDecoration="underline">
                Sign in
              </Text>
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
