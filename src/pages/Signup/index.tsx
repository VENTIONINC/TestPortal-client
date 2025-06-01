import { useState } from 'react';
import { Link } from 'react-router';
import { Box, Button, Input, Heading, Text, Container } from '@chakra-ui/react';

import { PATHS } from '@/types/paths';

export function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement signup logic
    // eslint-disable-next-line no-console
    console.log('Signup:', formData);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={12} px={4}>
      <Container maxW="md" centerContent>
        <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" w="100%">
          <Heading size="lg" textAlign="center" mb={6}>
            Create your account
          </Heading>

          <Box as="form" onSubmit={handleSubmit}>
            <Box mb={4}>
              <Text mb={2} fontWeight="medium">
                Full name
              </Text>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </Box>

            <Box mb={4}>
              <Text mb={2} fontWeight="medium">
                Email address
              </Text>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </Box>

            <Box mb={4}>
              <Text mb={2} fontWeight="medium">
                Password
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </Box>

            <Box mb={6}>
              <Text mb={2} fontWeight="medium">
                Confirm password
              </Text>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </Box>

            <Button type="submit" colorScheme="blue" width="100%" size="lg" mb={4}>
              Sign up
            </Button>
          </Box>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link to={PATHS.LOGIN}>
              <Text as="span" color="blue.500" textDecoration="underline">
                Sign in
              </Text>
            </Link>
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
