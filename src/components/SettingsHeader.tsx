import { Box, Container, Flex, Heading, Text } from '@chakra-ui/react';

import { Link } from '@/components/ui';
import { UserMenu } from '@/components/UserMenu';
import { PATHS } from '@/types/paths';

export const SettingsHeader = () => {
  return (
    <Box bg="white" shadow="sm" borderBottom="1px" borderColor="gray.200">
      <Flex justify="space-between" align="center" px={6} py={4}>
        <Link href={PATHS.ROOT} textStyle="lg" fontWeight="bold" color="blue.600">
          Test Portal
        </Link>
        <Container maxW="6xl">
          <Box>
            <Heading size="lg">User Settings</Heading>
            <Text color="gray.600" fontSize="sm">
              Manage your account settings and API keys
            </Text>
          </Box>
        </Container>

        <UserMenu />
      </Flex>
    </Box>
  );
};
