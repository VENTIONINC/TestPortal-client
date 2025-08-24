import { Box, Flex, Button, HStack } from '@chakra-ui/react';
import { useLocation } from 'react-router';

import { Link } from '@/components/ui';
import { UserMenu } from '@/components/UserMenu';
import { useAuth } from '@/hooks';
import { PATHS } from '@/types/paths';

const NAVIGATION_LINKS = [
  { label: 'Results', path: PATHS.RESULTS },
  { label: 'Issues', path: PATHS.ISSUES },
  { label: 'Prompts', path: PATHS.PROMPTS },
];

export const AppHeader = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" px={6} py={4}>
        <HStack gap={8}>
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
        </HStack>

        <Flex align="center" gap={4}>
          {isAuthenticated ? (
            <UserMenu />
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
