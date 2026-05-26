// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { Link } from 'react-router';
import { Box, Button, Heading, Text, Container } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';
import { FormField } from '@/components/forms';
import { useLogin } from '@/hooks';
export function LoginPage() {
  const { register, handleSubmit, errors, loading, successMessage, errorMessage } = useLogin();

  return (
    <Box minH="100vh" bg="bg.page" py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box bg="bg.card" p={8} borderRadius="lg" boxShadow="lg" w="100%">
          <Heading size="lg" textAlign="center" mb={6} color="text.main">
            Sign in to your account
          </Heading>

          {successMessage && (
            <Box
              bg="status.success.bg"
              color="status.success.text"
              p={3}
              mb={4}
              borderRadius="md"
              border="1px solid"
              borderColor="status.success.text"
            >
              {successMessage}
            </Box>
          )}

          {errorMessage && (
            <Box
              bg="status.error.bg"
              color="status.error.text"
              p={3}
              mb={4}
              borderRadius="md"
              border="1px solid"
              borderColor="status.error.text"
            >
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

          <Text textAlign="center" color="text.secondary">
            Don't have an account?{' '}
            <Link to={PATHS.SIGNUP}>
              <Text as="span" color="bg.accent" textDecoration="underline">
                Sign up
              </Text>
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
