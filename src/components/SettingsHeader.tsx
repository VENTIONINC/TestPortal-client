import { Box, Container, Flex, Heading, Text, Image } from '@chakra-ui/react';

import { Link } from '@/components/ui';
import { UserMenu } from '@/components/UserMenu';
import { useSurfaceColors } from '@/theme/useSurfaceColors';
import { PATHS } from '@/types/paths';

export const SettingsHeader = () => {
  const { surfaces, borders, text } = useSurfaceColors();

  return (
    <Box bg={surfaces.card} shadow="sm" borderBottom="1px" borderColor={borders.subtle}>
      <Flex justify="space-between" align="center" px={6} py={4}>
        <Link href={PATHS.ROOT} textStyle="lg" fontWeight="bold" color="blue.600">
          <Image src="/image.png" alt="TestPortal Logo" height="10" />
        </Link>
        <Container maxW="6xl">
          <Box>
            <Heading size="lg" color={text.primary}>
              User Settings
            </Heading>
            <Text color={text.muted} fontSize="sm">
              Manage your account settings and API keys
            </Text>
          </Box>
        </Container>

        <UserMenu />
      </Flex>
    </Box>
  );
};
