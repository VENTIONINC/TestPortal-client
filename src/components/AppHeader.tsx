import { Box, Flex, Button, Text, HStack } from '@chakra-ui/react';
import { useLocation } from 'react-router';

import { Link } from '@/components/ui';
import { useAuth } from '@/hooks';
import { PATHS } from '@/types/paths';

const NAVIGATION_LINKS = [
  { label: 'Results', path: PATHS.RESULTS },
  { label: 'Issues', path: PATHS.ISSUES },
];

export const AppHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" px={6} py={4}>
        <Link href={PATHS.ROOT} textStyle="lg" fontWeight="bold" color="blue.600">
          Test Portal
        </Link>

        <HStack gap={4}>
          {NAVIGATION_LINKS.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                href={link.path}
                color={isActive ? 'blue.500' : 'gray.600'}
                fontWeight={isActive ? 700 : 500}
              >
                {link.label}
              </Link>
            );
          })}
        </HStack>

        <Flex align="center" gap={4}>
          <Link href={PATHS.MCP}>
            <Button size="sm" variant="outline">
              MCP Chat
            </Button>
          </Link>
          {isAuthenticated && user ? (
            <>
              <Text textStyle="sm" color="gray.600">
                Welcome, {user.name}!
              </Text>
              <Button size="sm" variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Flex gap={2}>
              <Link href={PATHS.LOGIN}>
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link href={PATHS.SIGNUP}>
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
};
