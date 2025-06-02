import { Box, Flex, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router';

import { useAuth } from '@/hooks';
import { PATHS } from '@/types/paths';

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" px={6} py={4}>
        <Text fontSize="lg" fontWeight="bold" color="blue.600">
          Test Portal
        </Text>

        <Flex align="center" gap={4}>
          {isAuthenticated && user ? (
            <>
              <Text fontSize="sm" color="gray.600">
                Welcome, {user.name}!
              </Text>
              <Button size="sm" variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Flex gap={2}>
              <Link to={PATHS.LOGIN}>
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link to={PATHS.SIGNUP}>
                <Button size="sm" colorScheme="blue">
                  Sign Up
                </Button>
              </Link>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
